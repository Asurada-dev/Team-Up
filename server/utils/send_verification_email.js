const sendEmail = require('./send_email');

const sendVerificationEmail = async ({
  name,
  email,
  verificationToken,
  origin,
}) => {
  const verifyEmail = `${origin}/auth/verify-email?token=${verificationToken}&email=${email}`;

  const message = `<h3>Hello! ${name}<br> You're on your way!<br>
  Let's confirm your email address.</h3>
  <p>By clicking on the following link, you are confirming your email address.</p>
  <p><a href="${verifyEmail}">Verify Email</a> </p>`;
  console.log(message);

  return sendEmail({
    to: email,
    subject: 'Welcome to TeamUp! Confirm Your Email',
    html: message,
  });
};

module.exports = sendVerificationEmail;
