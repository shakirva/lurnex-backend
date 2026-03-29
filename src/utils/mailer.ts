import nodemailer from 'nodemailer';
import config from '../config';

const transporter = nodemailer.createTransport({
  host: config.mail.host,
  port: config.mail.port,
  secure: config.mail.port === 465, // true for 465, false for other ports
  auth: {
    user: config.mail.user,
    pass: config.mail.pass,
  },
});

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const resetUrl = `${config.cors.origin}/reset-password?token=${token}`;

  const mailOptions = {
    from: config.mail.from,
    to: email,
    subject: 'Password Reset Request - Lurnex Academy',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <h2 style="color: #1B4696; text-align: center;">Lurnex Academy</h2>
        <p>Hello,</p>
        <p>You requested a password reset for your Lurnex Academy account. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #1B4696; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>If you didn't request this, you can safely ignore this email. The link will expire in 1 hour.</p>
        <p>Alternatively, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666; font-size: 13px;">${resetUrl}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Lurnex Academy. All rights reserved.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};
