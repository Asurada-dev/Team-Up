require('dotenv').config();
const CustomError = require('../errors');
const { isTokenValid } = require('../utils');
const pool = require('../db/connectDB');

const tokenModel = require('../models/token_model');

const authenticateUser = async (req, res, next) => {
  const { accessToken, refreshToken } = req.signedCookies;

  try {
    if (accessToken) {
      const payload = isTokenValid(accessToken);
      req.user = payload.user;
      return next();
    }

    if (!refreshToken) {
      const message = '?message=Please%20Login%20to%20Continue';
      const loginPage = process.env.ORIGIN + '/auth/login' + message;
      return res.redirect(loginPage);
    }
    const payload = isTokenValid(refreshToken);

    const existingToken = await tokenModel.getTokenByRefreshToken(
      payload.user.userId,
      payload.refreshToken
    );

    if (!existingToken || !existingToken?.isValid) {
      const message = '?message=Authentication%20Invalid';
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
