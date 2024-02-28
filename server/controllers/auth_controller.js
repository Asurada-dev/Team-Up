require('dotenv').config();

const crypto = require('crypto');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const bcrypt = require('bcryptjs');
const {
  attachCookiesToResponse,
  sendVerificationEmail,
  sendResetPasswordEmail,
  createHash,
} = require('../utils');

const userModel = require('../models/user_model');
const tokenModel = require('../models/token_model');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await userModel.getUserByEmail(email);
  if (existingUser) {
    throw new CustomError.BadRequestError('Email already exists');
  }

  const isAdminexists = await userModel.getAllAdmins();
  const role = isAdminexists ? 'user' : 'admin';
  const verificationToken = crypto.randomBytes(40).toString('hex');

  const user = await userModel.createUser(
    name,
    email,
    password,
    role,
    verificationToken
  );

  const origin = process.env.ORIGIN;

  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verification_token,
    origin,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ msg: 'Please check your email to verify account.' });
};

const verifyEmail = async (req, res) => {
  const { token: verificationToken, email } = req.body;

  const user = await userModel.getUserByEmail(email);

  if (!user) {
    throw new CustomError.UnauthenticatedError('Verification Failed');
  }

  if (user.verification_token !== verificationToken) {
    throw new CustomError.UnauthenticatedError('Verification Failed');
  }
  await userModel.updateUserToVerified(email);

  res.status(StatusCodes.OK).json({ msg: 'Success! Email Verified' });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password');
  }

  const user = await userModel.getUserByEmail(email);

  if (!user) {
    throw new CustomError.UnauthenticatedError('User does not exist');
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new CustomError.UnauthenticatedError('Please confirm your password');
  }
  if (!user.is_verified) {
    throw new CustomError.UnauthenticatedError('Please verify your email');
  }

  let refreshToken = '';

  // check for existing token

  const token = await tokenModel.getTokenByUserId(user.id);

  const tokenUser = { name: user.name, userId: user.id, role: user.role };

  if (token) {
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
  await tokenModel.createToken(user.id, refreshToken, ip, userAgent);

  attachCookiesToResponse(res, tokenUser, refreshToken);

  res.status(StatusCodes.OK).json({ success: true });
};

const logout = async (req, res) => {
  await tokenModel.deleteToken(req.user.userId);

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
  const user = await userModel.getUserByEmail(email);
  console.log(user);
  if (!user) {
    throw new CustomError.UnauthenticatedError('User does not exist');
  }

  if (user) {
    const passwordToken = crypto.randomBytes(70).toString('hex');

    const origin = process.env.ORIGIN;

    await sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      token: passwordToken,
      origin,
    });

    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);
    const passwordTokenHashed = createHash(passwordToken);

    await userModel.updatePasswordToken(
      passwordTokenHashed,
      passwordTokenExpirationDate,
      user.email
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

  const user = await userModel.getUserByEmail(email);
  if (!user) {
    throw new CustomError.UnauthenticatedError('User does not exist');
  }

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
      console.log('test');
      await userModel.updatePassword(newPassword, user.email);

      res
        .status(StatusCodes.OK)
        .json({ msg: 'Success! Please use new password to login' });
      return;
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
