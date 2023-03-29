const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth_controller');

const { authenticateUser } = require('../middlewares/authentication');

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.delete('/logout', authenticateUser, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// router.post('/login', login);

module.exports = router;
