const { createJWT, isTokenValid, attachCookiesToResponse } = require('./jwt');
const createTokenUser = require('./create_token_user');
const checkPermissions = require('./check_permissions');
const sendVerificationEmail = require('./send_verification_email');
const sendResetPasswordEmail = require('./send_reset_password_email');
const createHash = require('./create_hash');
const checkIsActivityMember = require('./check_is_activity_member');
const formatMessage = require('./format_message');

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
  createTokenUser,
  checkPermissions,
  sendVerificationEmail,
  sendResetPasswordEmail,
  createHash,
  checkIsActivityMember,
  formatMessage,
};
