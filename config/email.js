// const nodemailer = require('nodemailer');

// // Create a transporter using OAuth2
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     type: 'OAuth2',
//     user: process.env.EMAIL_USER,
//     clientId: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     refreshToken: process.env.REFRESH_TOKEN,
//   },
// });

// // Verify the connection configuration
// transporter.verify((error, success) => {
//   if (error) {
//     console.error('Error connecting to email server:', error);
//   } else {
//     console.log('Email server is ready to send messages');
//   }
// });

// // Function to send email
// const sendEmail = async (to, subject, text, html) => {
//   try {
//     const mailOptions = {
//       from: `"ExpenseTrackerweb" <${process.env.EMAIL_USER}>`, // sender address
//       to, // list of receivers
//       subject, // Subject line
//       text, // plain text body
//       html, // html body
//     };

//     const info = await transporter.sendMail(mailOptions);
    
//     console.log('Message sent: %s', info.messageId);
//     if (nodemailer.getTestMessageUrl(info)) {
//       console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
//     }
//   } catch (error) {
//     console.error('Error sending email:', error);
//     // Optional: You can handle specific errors here, like logging to a service or retrying.
//   }
// };

// module.exports = sendEmail;
