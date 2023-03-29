const pool = require('../db/connectDB');

const crypto = require('crypto');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const bcrypt = require('bcryptjs');
const {
  attachCookiesToResponse,
  createTokenUser,
  sendVerificationEmail,
  sendResetPasswordEmail,
  createHash,
} = require('../utils');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const emailAlreadyExists = await pool.query(
    'SELECT 1 FROM users WHERE email=$1 ;',
    [email]
  );
  if (emailAlreadyExists.rows.length) {
    throw new CustomError.BadRequestError('Email already exists');
  }

  const isFirstAccount = await pool.query('SELECT 1 FROM users');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const role = isFirstAccount.rows.length ? 'user' : 'admin';

  const verificationToken = crypto.randomBytes(40).toString('hex');

  const user = (
    await pool.query(
      'INSERT INTO users (name, email, password, role, verification_token) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, verification_token;',
      [name, email, hashedPassword, role, verificationToken]
    )
  ).rows[0];
  console.log(user);
  const origin = 'http://localhost:4000';

  await sendVerificationEmail({
    to: user.name,
    email: user.email,
    verificationToken: user.verification_token,
    origin,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ msg: 'Please check your email to verify account.' });

  // .json({ msg: 'Success! Please check your email to verify account.' });
};

const verifyEmail = async (req, res) => {
  const { token: verificationToken, email } = req.body;

  const userQuery = await pool.query('SELECT * FROM users WHERE email=$1 ;', [
    email,
  ]);
  // console.log(userQuery);

  if (!userQuery.rows.length) {
    throw new CustomError.UnauthenticatedError('Verification Failed');
  }

  const user = userQuery.rows[0];

  if (user.verification_token !== verificationToken) {
    throw new CustomError.UnauthenticatedError('Verification Failed');
  }
  // now = new Date();
  await pool.query(
    'UPDATE users SET verification_token=$1, is_verified=$2, verified_date=$3  WHERE email=$4;',
    ['', true, new Date(), email]
  );

  res.status(StatusCodes.OK).json({ msg: 'Success! Email Verified' });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password');
  }

  const userQuery = await pool.query('SELECT * FROM users WHERE email=$1 ;', [
    email,
  ]);

  if (!userQuery.rows.length) {
    throw new CustomError.UnauthenticatedError('User does not exist');
  }
  const user = userQuery.rows[0];

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new CustomError.UnauthenticatedError('Please confirm your password');
  }
  if (!user.is_verified) {
    throw new CustomError.UnauthenticatedError('Please verify your email');
  }

  // create refresh token
  let refreshToken = '';

  //check for existing token
  const tokenQuery = await pool.query('SELECT * FROM token WHERE user_id=$1', [
    user.id,
  ]);
  const token = tokenQuery.rows[0];
  const tokenUser = { name: user.name, userId: user.id, role: user.role };

  if (tokenQuery.rows.length) {
    if (!token.is_valid) {
      throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    refreshToken = token.refresh_token;
    attachCookiesToResponse(res, tokenUser, refreshToken);

    res.status(StatusCodes.OK).json({ success: true });
    return;
  }

  refreshToken = crypto.randomBytes(40).toString('hex');
  const userAgent = req.headers['user-agent'];
  const ip = req.ip;

  console.log(refreshToken, userAgent, ip);
  await pool.query(
    'INSERT INTO token (user_id, refresh_token, ip, user_agent) VALUES ($1,$2,$3,$4);',
    [user.id, refreshToken, ip, userAgent]
  );
  attachCookiesToResponse(res, tokenUser, refreshToken);
  res.status(StatusCodes.OK).json({ success: true });
};

const logout = async (req, res) => {
  await pool.query('DELETE FROM token WHERE user_id=$1', [req.user.userId]);

  res.cookie('accessToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie('refreshToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ success: true });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError.BadRequestError('Please provide valid email');
  }
  const userQuery = await pool.query('SELECT * FROM users WHERE email=$1 ;', [
    email,
  ]);

  if (!userQuery.rows.length) {
    throw new CustomError.UnauthenticatedError('User does not exist');
  }
  const user = userQuery.rows[0];

  if (user) {
    const passwordToken = crypto.randomBytes(70).toString('hex');
    // send email
    console.log(user);
    const origin = 'http://localhost:4000';
    await sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      token: passwordToken,
      origin,
    });

    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);
    const passwordTokenHashed = createHash(passwordToken);
    await pool.query(
      'UPDATE users SET password_token=$1, password_token_expiration_date=$2 WHERE email=$3;',
      [passwordTokenHashed, passwordTokenExpirationDate, user.email]
    );
  }
  res
    .status(StatusCodes.OK)
    .json({ msg: 'Please check your email for reset password link' });
};
const resetPassword = async (req, res) => {
  const { token, email, newPassword } = req.body;

  if (!token || !email || !newPassword) {
    throw new CustomError.BadRequestError('Please provide all values');
  }

  const userQuery = await pool.query('SELECT * FROM users WHERE email=$1 ;', [
    email,
  ]);
  if (!userQuery.rows.length) {
    throw new CustomError.UnauthenticatedError('User does not exist');
  }
  const user = userQuery.rows[0];

  if (user) {
    const currentDate = new Date();
    if (user.password_token === createHash(token)) {
      console.log(user.password_token_expiration_date);
      console.log(currentDate);
    }
    if (
      user.password_token === createHash(token) &&
      user.password_token_expiration_date > currentDate
    ) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await pool.query(
        'UPDATE users SET password=$1, password_token=$2, password_token_expiration_date=$3 WHERE email=$4;',
        [hashedPassword, null, null, user.email]
      );

      res
        .status(StatusCodes.OK)
        .json({ msg: 'Success! Please use new password to login' });
    }
    throw new CustomError.UnauthenticatedError('Token invalid');
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
};
