const LIMITS = {
  name: 120,
  email: 255,
  subject: 200,
  message: 5000,
};

function isNonEmptyString(v) {
  return typeof v === 'string';
}

/** Pragmatic email check (max length enforced separately). */
function isValidEmailFormat(email) {
  if (typeof email !== 'string') return false;
  const s = email.trim();
  if (s.length === 0) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

/**
 * Validate contact POST body. Returns { errors: Record<string,string> } or { values: {...} }.
 */
function validateContactBody(body) {
  const errors = {};

  const name = body?.name;
  const email = body?.email;
  const subject = body?.subject;
  const message = body?.message;

  if (!isNonEmptyString(name)) {
    errors.name = 'Name is required';
  } else {
    const t = name.trim();
    if (t.length === 0) errors.name = 'Name is required';
    else if (t.length > LIMITS.name) errors.name = `Name must be at most ${LIMITS.name} characters`;
  }

  if (!isNonEmptyString(email)) {
    errors.email = 'Email is required';
  } else {
    const t = email.trim();
    if (t.length === 0) errors.email = 'Email is required';
    else if (t.length > LIMITS.email) errors.email = `Email must be at most ${LIMITS.email} characters`;
    else if (!isValidEmailFormat(t)) errors.email = 'Invalid email format';
  }

  if (!isNonEmptyString(subject)) {
    errors.subject = 'Subject is required';
  } else {
    const t = subject.trim();
    if (t.length === 0) errors.subject = 'Subject is required';
    else if (t.length > LIMITS.subject)
      errors.subject = `Subject must be at most ${LIMITS.subject} characters`;
  }

  if (!isNonEmptyString(message)) {
    errors.message = 'Message is required';
  } else {
    const t = message.trim();
    if (t.length === 0) errors.message = 'Message is required';
    else if (t.length > LIMITS.message)
      errors.message = `Message must be at most ${LIMITS.message} characters`;
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    values: {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    },
  };
}

module.exports = {
  validateContactBody,
  LIMITS,
};
