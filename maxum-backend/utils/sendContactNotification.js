const { sendEmail } = require('./sendEmail');
const { escapeHtml } = require('./sanitizeContact');

/**
 * Notify admin/support inbox of a new contact submission.
 * Set CONTACT_NOTIFICATION_EMAIL (or SUPPORT_INBOX_EMAIL) in .env; if unset, skips send.
 */
async function sendContactNotification({ name, email, subject, message, userId }) {
  const to =
    process.env.CONTACT_NOTIFICATION_EMAIL ||
    process.env.SUPPORT_INBOX_EMAIL ||
    '';

  if (!to || !process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    return { skipped: true };
  }

  const uid = userId ? escapeHtml(String(userId)) : '(anonymous)';

  const html = `
    <h2>New contact form submission</h2>
    <p><strong>User ID:</strong> ${uid}</p>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
    <p><strong>Message:</strong></p>
    <pre style="white-space:pre-wrap;font-family:sans-serif;">${escapeHtml(message)}</pre>
  `;

  const text = [
    'New contact form submission',
    `User ID: ${userId || 'anonymous'}`,
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subject}`,
    '',
    message,
  ].join('\n');

  await sendEmail({
    to,
    subject: `[Contact] ${subject}`.slice(0, 200),
    html,
    text,
  });

  return { skipped: false };
}

/**
 * Send a copy of the submission to the address the user entered (confirmation / receipt).
 * Uses same SMTP env as other mail; skipped if EMAIL_HOST / EMAIL_USER missing.
 */
async function sendContactUserConfirmation({ name, email, subject, message }) {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    return { skipped: true };
  }

  const html = `
    <h2>We received your message</h2>
    <p>Hi ${escapeHtml(name)},</p>
    <p>Thank you for contacting us. Below is a copy of what you submitted.</p>
    <hr />
    <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
    <p><strong>Your email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Message:</strong></p>
    <pre style="white-space:pre-wrap;font-family:sans-serif;">${escapeHtml(message)}</pre>
    <hr />
    <p style="color:#666;font-size:14px;">Our team will get back to you as soon as possible.</p>
  `;

  const text = [
    'We received your message',
    '',
    `Hi ${name},`,
    'Thank you for contacting us. Here is a copy of your submission:',
    '',
    `Subject: ${subject}`,
    `Your email: ${email}`,
    '',
    message,
    '',
    'Our team will get back to you as soon as possible.',
  ].join('\n');

  await sendEmail({
    to: email,
    subject: `We received: ${subject}`.slice(0, 200),
    html,
    text,
  });

  return { skipped: false };
}

module.exports = { sendContactNotification, sendContactUserConfirmation };
