const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { sendOtpEmail } = require('../utils/sendEmail');

const SALT_ROUNDS = 10;
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const MAX_OTP_REQUESTS_PER_HOUR = 20; // TODO: lower back to 3 before production

// ─── TOTP helpers (mirrors userController — kept local to avoid circular deps) ─

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Decode(secret) {
  const s = secret.toUpperCase().replace(/=+$/, '');
  let bits = 0, val = 0;
  const output = [];
  for (const char of s) {
    val = (val << 5) | BASE32_CHARS.indexOf(char);
    bits += 5;
    if (bits >= 8) { output.push((val >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(output);
}

async function generateTOTP(secret, stepOffset = 0) {
  const time = Math.floor(Date.now() / 30000) + stepOffset;
  const timeBuf = Buffer.alloc(8);
  timeBuf.writeUInt32BE(Math.floor(time / 0x100000000), 0);
  timeBuf.writeUInt32BE(time >>> 0, 4);
  const key = base32Decode(secret);
  const hmac = crypto.createHmac('sha1', key).update(timeBuf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = (
    ((hmac[offset] & 0x7f) << 24) |
    (hmac[offset + 1] << 16) |
    (hmac[offset + 2] << 8) |
    hmac[offset + 3]
  ) % 1000000;
  return code.toString().padStart(6, '0');
}

async function verifyTOTP(secret, token) {
  for (const offset of [0, -1, 1]) {
    if (await generateTOTP(secret, offset) === token) return true;
  }
  return false;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1d' });

const generateOtp = () =>
  String(Math.floor(100000 + Math.random() * 900000));

/**
 * Core logic for sending an OTP.
 * Enforces max OTP requests per hour per (email + purpose).
 * @param {string} email
 * @param {import('express').Response} res
 * @param {'login'|'reset'|'signup'} purpose
 * @returns {Promise<boolean>} true on success, false when an error response was already sent
 */
const sendOtpForEmail = async (email, res, purpose = 'reset') => {
  const existingOtp = await Otp.findOne({ email, purpose });

  if (existingOtp) {
    const windowAgeMs = Date.now() - new Date(existingOtp.requestWindowStart).getTime();
    const oneHourMs = 60 * 60 * 1000;

    if (windowAgeMs < oneHourMs) {
      if (existingOtp.requestCount >= MAX_OTP_REQUESTS_PER_HOUR) {
        res.status(429).json({
          success: false,
          message: 'Too many OTP requests. Please try again after an hour.',
        });
        return false;
      }
      existingOtp.requestCount += 1;
    } else {
      existingOtp.requestCount = 1;
      existingOtp.requestWindowStart = new Date();
    }

    existingOtp.otp = generateOtp();
    existingOtp.expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    existingOtp.attempts = 0;
    existingOtp.used = false;
    await existingOtp.save();
    await sendOtpEmail(email, existingOtp.otp);
  } else {
    const otp = generateOtp();
    await Otp.create({
      email,
      otp,
      purpose,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    });
    await sendOtpEmail(email, otp);
  }

  return true;
};

/**
 * Shared OTP validation helper.
 * Returns the otpDoc on success, or sends an error response and returns null.
 */
const validateOtp = async (email, otp, purpose, res) => {
  const otpDoc = await Otp.findOne({ email: email.toLowerCase().trim(), purpose });

  if (!otpDoc || otpDoc.used) {
    res.status(400).json({ success: false, message: 'Invalid OTP.' });
    return null;
  }

  if (new Date() > new Date(otpDoc.expiresAt)) {
    await Otp.deleteOne({ _id: otpDoc._id });
    res.status(400).json({ success: false, message: 'OTP has expired.' });
    return null;
  }

  if (otpDoc.attempts >= MAX_OTP_ATTEMPTS) {
    await Otp.deleteOne({ _id: otpDoc._id });
    res.status(400).json({
      success: false,
      message: 'Too many incorrect attempts. Please request a new OTP.',
    });
    return null;
  }

  if (otpDoc.otp !== String(otp)) {
    otpDoc.attempts += 1;
    await otpDoc.save();
    res.status(400).json({ success: false, message: 'Invalid OTP.' });
    return null;
  }

  return otpDoc;
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password',
      });
    }

    const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!EMAIL_RE.test(String(email).trim())) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid email address (e.g. user@example.com)',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const initialRaw = process.env.DEMO_INITIAL_AVAILABLE_BALANCE;
    const initialNexb = initialRaw !== undefined ? Number(initialRaw) : NaN;
    const payload = { name, email: normalizedEmail, password };
    if (Number.isFinite(initialNexb) && initialNexb > 0) {
      const cap = Number(process.env.DEMO_INITIAL_BALANCE_MAX) || 1_000_000;
      payload.availableBalance = Math.min(initialNexb, cap);
    }

    const user = await User.create(payload);
    const sent = await sendOtpForEmail(user.email, res, 'signup');
    if (!sent) {
      await User.deleteOne({ _id: user._id });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Account created. OTP sent to your email.',
      data: {
        requiresOtp: true,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

/**
 * POST /api/auth/login
 *
 * Step 1 of the login flow: validate credentials then send an email OTP.
 * Does NOT return a JWT — that happens after OTP (+ optional 2FA) verification.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Credentials are valid — send a login OTP before issuing a token
    const sent = await sendOtpForEmail(user.email, res, 'login');
    if (!sent) return; // rate-limit response already sent

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete sign in.',
      data: {
        requiresOtp: true,
        requires2FA: user.twoFactorEnabled,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

/**
 * POST /api/auth/verify-login-otp
 *
 * Step 2 of the login flow: verify the email OTP (and TOTP code if 2FA is on).
 * Returns the JWT on success and deletes the OTP.
 * Body: { email, otp, twoFactorCode? }
 */
const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp, twoFactorCode } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const otpDoc = await validateOtp(normalizedEmail, otp, 'login', res);
    if (!otpDoc) return; // error already sent

    // Verify TOTP if the account has 2FA enabled
    const user = await User.findOne({ email: normalizedEmail }).select('+twoFactorSecret');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(400).json({
          success: false,
          message: '2FA code is required for this account.',
        });
      }
      const totpValid = await verifyTOTP(user.twoFactorSecret, String(twoFactorCode));
      if (!totpValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid 2FA code.',
        });
      }
    }

    // All checks passed — invalidate the OTP immediately
    await Otp.deleteOne({ _id: otpDoc._id });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Verify login OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login OTP verification',
    });
  }
};

/**
 * POST /api/auth/resend-login-otp
 * Body: { email }
 * Re-sends a login OTP for a user who already passed credential validation.
 */
const resendLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Return success to avoid user enumeration
      return res.status(200).json({ success: true, message: 'OTP resent if account exists.' });
    }

    const sent = await sendOtpForEmail(user.email, res, 'login');
    if (!sent) return;

    res.status(200).json({ success: true, message: 'OTP resent successfully.' });
  } catch (error) {
    console.error('Resend login OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during OTP resend',
    });
  }
};

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email.',
      });
    }

    const sent = await sendOtpForEmail(email.toLowerCase().trim(), res, 'reset');
    if (!sent) return;

    res.status(200).json({ success: true, message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during forgot password',
    });
  }
};

/**
 * POST /api/auth/verify-otp
 * Body: { email, otp, flow? }
 * Used by forgot-password and signup flows.
 * - flow=forgot (default): marks OTP as used for reset-password
 * - flow=signup: verifies OTP and logs user in immediately
 */
const verifyOtp = async (req, res) => {
  try {
    const { email, otp, flow } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const purpose = flow === 'signup' ? 'signup' : 'reset';
    const otpDoc = await validateOtp(normalizedEmail, otp, purpose, res);
    if (!otpDoc) return;

    if (purpose === 'signup') {
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      await Otp.deleteOne({ _id: otpDoc._id });
      const token = generateToken(user._id);

      return res.status(200).json({
        success: true,
        message: 'Account verified successfully.',
        data: {
          token,
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    }

    // Forgot-password flow: mark as used (resetPassword will delete it)
    otpDoc.used = true;
    await otpDoc.save();

    res.status(200).json({ success: true, message: 'OTP verified successfully.' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during OTP verification',
    });
  }
};

/**
 * POST /api/auth/reset-password
 * Body: { token (contains email), newPassword }
 */
const resetPassword = async (req, res) => {
  try {
    const { token: email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email and new password are required.',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Verify that a used reset OTP exists (guards against skipping verify-otp)
    const otpDoc = await Otp.findOne({ email: email.toLowerCase().trim(), purpose: 'reset', used: true });
    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: 'OTP verification is required before resetting your password.',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await User.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );

    // Delete all reset OTPs for this email after successful password change
    await Otp.deleteMany({ email: email.toLowerCase().trim(), purpose: 'reset' });

    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during reset password',
    });
  }
};

/**
 * POST /api/auth/resend-verification-email
 * Body: { email }
 */
const resendVerificationEmail = async (req, res) => {
  try {
    const { email, flow } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const purpose = flow === 'signup' ? 'signup' : 'reset';
    const sent = await sendOtpForEmail(email.toLowerCase().trim(), res, purpose);
    if (!sent) return;

    res.status(200).json({ success: true, message: 'OTP resent successfully.' });
  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during resend verification',
    });
  }
};

/**
 * POST /api/auth/change-password  — Auth required (protect middleware)
 * Body: { currentPassword, newPassword }
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during change password',
    });
  }
};

/**
 * POST /api/auth/verify-email
 */
const verifyEmail = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'Email verified successfully.' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ success: false, message: 'Server error during email verification.' });
  }
};

module.exports = {
  register,
  login,
  verifyLoginOtp,
  resendLoginOtp,
  forgotPassword,
  verifyOtp,
  resetPassword,
  resendVerificationEmail,
  changePassword,
  verifyEmail,
};
