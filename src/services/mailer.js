const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

async function sendMail({ to, subject, text, html }) {
  const recipients = Array.isArray(to) ? to.join(',') : to;
  const mail = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: recipients,
    subject,
    text,
    html
  };

  const info = await transport.sendMail(mail);
  console.log('Email sent', info.messageId);
  return info;
}

module.exports = { sendMail };
