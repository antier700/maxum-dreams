const ContactMessage = require('../models/ContactMessage');
const { validateContactBody } = require('../utils/contactValidation');
const { sanitizeContactFields } = require('../utils/sanitizeContact');
const {
  sendContactNotification,
  sendContactUserConfirmation,
} = require('../utils/sendContactNotification');

/**
 * POST /api/contact
 * Optional Bearer JWT: if valid, userId is stored on the message.
 */
const submitContact = async (req, res) => {
  try {
    const result = validateContactBody(req.body);
    if (result.errors) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: result.errors,
      });
    }

    const { values } = result;
    const stored = sanitizeContactFields(values);

    const doc = await ContactMessage.create({
      userId: req.user ? req.user._id : null,
      name: stored.name,
      email: stored.email,
      subject: stored.subject,
      message: stored.message,
      status: 'new',
    });

    try {
      await sendContactNotification({
        name: values.name,
        email: values.email,
        subject: values.subject,
        message: values.message,
        userId: req.user ? req.user._id : null,
      });
    } catch (mailErr) {
      console.error('Contact notification email failed:', mailErr.message);
    }

    try {
      await sendContactUserConfirmation({
        name: values.name,
        email: values.email,
        subject: values.subject,
        message: values.message,
      });
    } catch (userMailErr) {
      console.error('Contact user confirmation email failed:', userMailErr.message);
    }

    return res.status(201).json({
      success: true,
      data: {
        id: String(doc._id),
      },
    });
  } catch (error) {
    console.error('submitContact error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

module.exports = { submitContact };
