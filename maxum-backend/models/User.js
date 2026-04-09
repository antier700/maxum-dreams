const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    twoFactorSecret: {
      type: String,
      select: false, // never returned by default
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    dob: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    gender: { type: String, default: '', trim: true },
    street: { type: String, default: '', trim: true },
    state: { type: String, default: '', trim: true },
    city: { type: String, default: '', trim: true },
    postalCode: { type: String, default: '', trim: true },
    profilePicture: { type: String, default: '' },
    /** NEXB available to stake or withdraw (not locked in open stakes) */
    availableBalance: {
      type: Number,
      default: 0,
    },
    /** Accumulated rewards balance (e.g. from staking accrual) */
    rewardBalance: {
      type: Number,
      default: 0,
    },
  },
  { versionKey: false }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password helper
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
