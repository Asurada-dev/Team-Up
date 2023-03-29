const nodemailer = require('nodemailer');
require('dotenv').config();
// const nodemailerConfig = require('./');
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  let transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY,
    },
  });

  return transporter.sendMail(
    {
      from: 'TeamUpExpress@gmail.com', // verified sender email
      to,
      subject,
      html,
    },
    function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    }
  );
};

module.exports = sendEmail;
