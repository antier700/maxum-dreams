const nodemailer = require('nodemailer');

/**
 * Create a reusable transporter.
 * Set these in your .env file:
 *   EMAIL_HOST     — SMTP host  (e.g. smtp.gmail.com)
 *   EMAIL_PORT     — SMTP port  (e.g. 587)
 *   EMAIL_SECURE   — true for 465, false for other ports
 *   EMAIL_USER     — sender email address
 *   EMAIL_PASS     — sender email password / app-password
 *   EMAIL_FROM     — "From" display name + address
 */
const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

/**
 * Send an email.
 * @param {Object} options
 * @param {string} options.to      - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html    - HTML body
 * @param {string} [options.text]  - Plain-text fallback
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Maxum" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''), // strip HTML as fallback
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Email sent to ${to}: ${info.messageId}`);
  return info;
};

/**
 * Send OTP email.
 * @param {string} to    - Recipient email
 * @param {string} otp   - 6-digit OTP
 */
const sendOtpEmail = async (to, otp) => {
  const subject = 'Your Maxum Verification Code';
  const html = `
    <table width="100%"border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center">
                <table class="content" align="center" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 640px; background-color: #07080b;">
                    <tr>
                        <td class="header" style="background-color: #16181F; text-align: center; padding: 20px 0;">
                            <h1 style="color: #e7b053; font-style: italic; font-weight: 900; margin: 0; font-size: 30px; letter-spacing: -0.5px; font-family: 'Arial Black', sans-serif; line-height: normal;">Maxum Dreams</h1>
                        </td>
                    </tr>
                    <tr>
                        <td class="body" style="padding: 40px 30px; background: #030004;
">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="text-align: center;">
                                        <p style="text-align: center; font-size: 16px; color: #B1B5C3; margin: 0 auto 35px; line-height: 1.6; max-width: 530px;">
                                            You recently attempted to sign in to your <span style="color: #ffffff;">Maxum Dreams</span> account from a new device or location. As a security measure, we require additional confirmation before allowing access to your <span style="color: #ffffff;">Maxum Dreams</span> account.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <table width="90%" align="center" cellpadding="0" cellspacing="0" border="0" style="background-color: #11182587; border-radius: 12px; margin-bottom: 35px;">
                                            <tr>
                                                <td style="padding: 40px 20px; text-align: center;">
                                                    <p style="color: #B1B5C3; font-size: 15px; margin-top: 0; margin-bottom: 30px;">If you recognize this activity, please confirm it with the activation code.</p>
                                                    <h2 style="color: #ffffff; font-size: 20px; font-weight: 500; margin-top: 0; margin-bottom: 30px;">Here is your account activation code:</h2>
                                                    
                                                    <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px;">
                                                        <tr>
                                                            ${String(otp).split('').map(digit => `
                                                            <td style="padding: 0 5px;">
                                                                <span style="color: #e7b053; font-size: 24px; border-radius: 8px; font-weight: 500; display: block; width: 48px; height: 48px; text-align: center; line-height: 48px; border: 1px solid #1f222e;">${digit}</span>
                                                            </td>`).join('')}
                                                        </tr>
                                                    </table>

                                                    <p style="color: #B1B5C3; font-size: 15px; margin-bottom: 0px; max-width: 440px; margin-left: auto; margin-right: auto; line-height: 1.5;">This verification code will be valid for 30 minutes. Please do not share this code with anyone.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align: center;">
                                        <p style="text-align: center; font-size: 16px; color: #B1B5C3; max-width: 530px; margin: 0 auto 40px; line-height: 1.5;">
                                            If you don't recognize this activity, please disable your account and contact our customer support immediately at Site
                                        </p>
                                        
                                        <div style="text-align: center; font-size: 17px; color: #B1B5C3;">
                                            <p style="margin: 0; margin-bottom: 5px;">Thanks</p>
                                            <p style="margin: 0;">Team <span style="color: #e7b053;">Maxum Dreams!!</span></p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #16181F; padding: 25px; text-align: center; font-size: 14px; color: #B1B5C3;">
                            © 2026 <span style="color: #ffffff;">Maxum Dreams</span>. All Rights Reserved.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
  `;
  return sendEmail({ to, subject, html });
};

module.exports = { sendEmail, sendOtpEmail };
