/**
 * Escape HTML entities so stored contact text is safe if an admin UI renders
 * it into HTML without additional escaping (defense in depth).
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitize contact fields after validation (length checks use raw trimmed strings).
 */
function sanitizeContactFields({ name, email, subject, message }) {
  return {
    name: escapeHtml(name.trim()),
    email: escapeHtml(email.trim().toLowerCase()),
    subject: escapeHtml(subject.trim()),
    message: escapeHtml(message.trim()),
  };
}

module.exports = { escapeHtml, sanitizeContactFields };
