import nodemailer from 'nodemailer';

const hasEmailConfig = Boolean(
  process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS
);

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ email, subject, message }) => {
  if (!hasEmailConfig) {
    console.warn('EMAIL config missing. Reset email logged to console instead.');
    console.log('Password reset email:', {
      to: email,
      subject,
      message,
    });
    return { message: 'Email not sent: missing SMTP configuration' };
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"D's Cloud Space" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    text: message,
  };

  const info = await transport.sendMail(mailOptions);
  return info;
};
