const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter using Ethereal SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // Use TLS
  service: 'Ethereal',
  auth: {
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASS
  }
});

// Function to send verification email
const sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl = `https://event-manager-backend-cgrz.onrender.com/api/auth/verify-email?token=${verificationToken}`;

 
 
  const mailOptions = {
    from: 'garnett44@ethereal.email',
    to: email,
    subject: 'Email Verification',
    text: `Please verify your email by clicking on the following link: ${verificationUrl}`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent');
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

module.exports = { sendVerificationEmail };
