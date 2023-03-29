const express = require('express');
const router = express.Router();

router.get('/register', (req, res) => {
  res.render('pages/auth/register');
});

router.get('/verify-email', (req, res) => {
  res.render('pages/auth/verify_email');
});

router.get('/login', (req, res) => {
  res.render('pages/auth/login');
});

router.get('/forgot-password', (req, res) => {
  res.render('pages/auth/forgot_password');
});

router.get('/reset-password', (req, res) => {
  res.render('pages/auth/reset_password');
});

// router.get('/auth/check-email', (req, res) => {
//   res.render('pages/auth/check_email');
// });
module.exports = router;
