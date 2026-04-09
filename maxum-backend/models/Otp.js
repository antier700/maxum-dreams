const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL — Mongo auto-deletes when expiresAt passes
    },
    attempts: {
      type: Number,
      default: 0,
    },
    used: {
      type: Boolean,
      default: false,
    },
    // Track how many OTP requests this email has made (for rate limiting)
    requestCount: {
      type: Number,
      default: 1,
    },
    requestWindowStart: {
      type: Date,
      default: Date.now,
    },
    /** Distinguishes OTPs for different flows so they never collide */
    purpose: {
      type: String,
      enum: ['login', 'reset', 'signup'],
      default: 'reset',
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model('Otp', otpSchema);
