require('dotenv').config();
const CustomError = require('../errors');
const { isTokenValid } = require('../utils');
const pool = require('../db/connectDB');

const authenticateUser = async (req, res, next) => {
  const { accessToken, refreshToken } = req.signedCookies;

  try {
    if (accessToken) {
      const payload = isTokenValid(accessToken);
      req.user = payload.user;
      return next();
    }
    const payload = isTokenValid(refreshToken);

    const tokenQuery = await pool.query(
      'SELECT * FROM token WHERE user_id=$1 AND refresh_token=$2',
      [payload.user.userId, payload.refreshToken]
    );
    const existingToken = tokenQuery.rows[0];

    if (!existingToken || !existingToken?.isValid) {
      const message = '?message=Please%20Login%20First';
      const loginPage = process.env.ORIGIN + '/auth/login' + message;
      return res.redirect(loginPage);
    }

    attachCookiesToResponse({
      res,
      user: payload.user,
      refreshToken: existingToken.refresh_token,
    });

    req.user = payload.user;
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        'Unauthorized to access this route'
      );
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizePermissions,
};
