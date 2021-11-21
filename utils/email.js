const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //1) create a transporter
  const transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: '41fc1eec3f3c66',
      pass: '754520e555702b',
    },
  });
  //2) Define the mail options
  const mailOptions = {
    from: 'Laxman sharma <laxman@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html:
  };
  //3) Actually send the email
  await transport.sendMail(mailOptions);
};
module.exports = sendEmail;
