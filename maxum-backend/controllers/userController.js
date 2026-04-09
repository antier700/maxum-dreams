const User = require('../models/User');
const Transaction = require('../models/Transaction');
const stakingController = require('./stakingController');
const crypto = require('crypto');
const { roundMoney, parseAmount } = require('../utils/staking');
const { isMockDepositEnabled } = require('../utils/envFlags');

// ─── Native TOTP helpers (no external deps) ───────────────────────────────
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function generateBase32Secret(length = 20) {
  const bytes = crypto.randomBytes(length);
  let result = '';
  let buffer = 0, bitsLeft = 0;
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bitsLeft += 8;
    while (bitsLeft >= 5) {
      result += BASE32_CHARS[(buffer >> (bitsLeft - 5)) & 31];
      bitsLeft -= 5;
    }
  }
  if (bitsLeft > 0) result += BASE32_CHARS[(buffer << (5 - bitsLeft)) & 31];
  return result;
}

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
  const code = ((hmac[offset] & 0x7f) << 24 | hmac[offset+1] << 16 | hmac[offset+2] << 8 | hmac[offset+3]) % 1000000;
  return code.toString().padStart(6, '0');
}

async function verifyTOTP(secret, token) {
  for (const offset of [0, -1, 1]) {
    if (await generateTOTP(secret, offset) === token) return true;
  }
  return false;
}
// ─────────────────────────────────────────────────────────────────────────

/**
 * GET /api/user/profile
 * Returns the logged-in user's profile (req.user set by authMiddleware)
 */
const getProfile = async (req, res) => {
  try {
    const user = req.user; // already populated by protect middleware

    const idStr = String(user._id);
    const referralCode = `MAX${idStr.slice(-8).toUpperCase()}`;

    res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        referralCode,
        dob: user.dob || '',
        phone: user.phone || '',
        gender: user.gender || '',
        street: user.street || '',
        state: user.state || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        profilePicture: user.profilePicture || '',
        twoFactorEnabled: !!user.twoFactorEnabled,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching profile',
    });
  }
};

/**
 * PUT /api/user/update
 * Updates display name, email, and optional extended profile fields (JSON body).
 */
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      dob,
      phone,
      gender,
      street,
      state,
      city,
      postalCode,
      profilePicture,
    } = req.body;

    const nameStr = name != null ? String(name).trim() : '';
    const emailStr = email != null ? String(email).toLowerCase().trim() : '';

    if (!nameStr || !emailStr) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required',
      });
    }

    const updates = {
      name: nameStr,
      email: emailStr,
    };

    if (dob !== undefined) updates.dob = String(dob).trim();
    if (phone !== undefined) updates.phone = String(phone).trim();
    if (gender !== undefined) updates.gender = String(gender).trim();
    if (street !== undefined) updates.street = String(street).trim();
    if (state !== undefined) updates.state = String(state).trim();
    if (city !== undefined) updates.city = String(city).trim();
    if (postalCode !== undefined) updates.postalCode = String(postalCode).trim();
    if (profilePicture !== undefined) updates.profilePicture = String(profilePicture).trim();

    const emailExists = await User.findOne({
      email: updates.email,
      _id: { $ne: req.user._id },
    });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use by another account',
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    const idStr = String(updatedUser._id);
    const referralCode = `MAX${idStr.slice(-8).toUpperCase()}`;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
        referralCode,
        dob: updatedUser.dob || '',
        phone: updatedUser.phone || '',
        gender: updatedUser.gender || '',
        street: updatedUser.street || '',
        state: updatedUser.state || '',
        city: updatedUser.city || '',
        postalCode: updatedUser.postalCode || '',
        profilePicture: updatedUser.profilePicture || '',
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating profile',
    });
  }
};

/**
 * GET /api/user/transactions
 * Fetches user deposit/withdraw/stake history from the database.
 * Query: ?type=deposit|withdraw|stake  (optional, defaults to all non-stake)
 */
const getTransactions = async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;

    if (type === 'stake') {
      return stakingController.getStakes(req, res);
    }

    const query = { userId: req.user._id };
    if (type && type !== 'all') {
      query.type = type;
    } else {
      // Default: deposit and withdraw only (stakes have their own endpoint)
      query.type = { $in: ['deposit', 'withdraw'] };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [txDocs, totalRecords] = await Promise.all([
      Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Transaction.countDocuments(query),
    ]);

    const transactions = txDocs.map((tx) => ({
      id: String(tx._id),
      token: tx.token || 'NEXB',
      amount: String(tx.amount),
      walletAddress: tx.walletAddress || '',
      hash: tx.hash || '',
      fromAddress: tx.fromAddress || '',
      toAddress: tx.toAddress || tx.walletAddress || '',
      date: tx.createdAt,
      status: tx.status ? (tx.status.charAt(0).toUpperCase() + tx.status.slice(1)) : 'Pending',
      type: tx.type,
    }));

    res.status(200).json({
      success: true,
      data: {
        totalRecords,
        transactions,
      },
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching transactions',
    });
  }
};

/**
 * GET /api/user/referrals/rewards
 * Fetches referral rewards history.
 */
const getReferralRewards = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    res.status(200).json({
      success: true,
      data: {
        totalRecords: 10,
        rewards: [
          {
            id: "ref_123",
            referredEmail: "johnwick007@gmail.com",
            purchaseAmount: "10619.73",
            rewardAmount: "743.38",
            rewardPercentage: 7,
            level: 1,
            date: "2024-11-23T17:20:00Z"
          }
        ]
      }
    });
  } catch (error) {
    console.error('Get referral rewards error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching referral rewards',
    });
  }
};

/**
 * POST /api/user/mock-deposit
 * Credits availableBalance (no on-chain deposit). For local/demo only.
 * Enable with MOCK_DEPOSIT_ENABLED=true in .env — keep false in production.
 */
const mockDeposit = async (req, res) => {
  try {
    if (!isMockDepositEnabled()) {
      return res.status(403).json({
        success: false,
        message:
          'Mock deposit is off. Use NODE_ENV=development (npm run dev) or set MOCK_DEPOSIT_ENABLED=true in .env, then restart the server.',
      });
    }

    const amount = Number(req.body?.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'amount must be a positive number',
      });
    }

    const max = Number(process.env.MOCK_DEPOSIT_MAX_AMOUNT) || 1_000_000;
    if (amount > max) {
      return res.status(400).json({
        success: false,
        message: `amount cannot exceed ${max}`,
      });
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { availableBalance: roundMoney(amount) } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Record the deposit transaction
    await Transaction.create({
      userId: req.user._id,
      type: 'deposit',
      token: 'NEXB',
      amount: roundMoney(amount),
      status: 'completed',
      note: 'mock deposit',
    });

    res.status(200).json({
      success: true,
      message: 'NEXB credited to your available balance (mock deposit).',
      data: {
        availableBalance: String(roundMoney(updated.availableBalance)),
      },
    });
  } catch (error) {
    console.error('mockDeposit error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * POST /api/user/withdraw
 * User submits a withdrawal request for their NEXB tokens.
 * Deducts from availableBalance immediately; on-chain payout can be processed separately.
 */
const withdrawTokens = async (req, res) => {
  try {
    let amount;
    try {
      amount = parseAmount(req.body?.amount, 'amount');
    } catch (e) {
      return res.status(400).json({ success: false, message: e.message || 'Invalid amount' });
    }

    const walletAddress =
      typeof req.body?.walletAddress === 'string' ? req.body.walletAddress.trim() : '';
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Valid wallet address is required (0x followed by 40 hex characters)',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const avail = roundMoney(Number(user.availableBalance) || 0);
    if (amount > avail) {
      return res.status(400).json({ success: false, message: 'Insufficient available balance' });
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { availableBalance: -amount } },
      { new: true }
    );

    const newBal = String(roundMoney(updated.availableBalance));

    // Record the withdrawal transaction in the database
    const txDoc = await Transaction.create({
      userId: req.user._id,
      type: 'withdraw',
      token: 'NEXB',
      amount,
      walletAddress,
      status: 'pending',
    });

    res.status(200).json({
      success: true,
      message: 'Withdrawal request submitted successfully.',
      data: {
        transactionId: String(txDoc._id),
        status: 'Pending',
        availableBalance: newBal,
        balanceRemaining: newBal,
        walletAddress,
      },
    });
  } catch (error) {
    console.error('Withdraw tokens error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error submitting withdrawal request',
    });
  }
};

/**
 * GET /api/user/2fa/generate
 * Generates a TOTP secret for the logged-in user and returns the otpauth URL.
 */
const generate2FA = async (req, res) => {
  try {
    const secret = generateBase32Secret();
    const otpauthUrl = `otpauth://totp/MaxumDreams:${encodeURIComponent(req.user.email)}?secret=${secret}&issuer=MaxumDreams`;

    // Save secret to DB using $set
    await User.findByIdAndUpdate(
      req.user._id,
      { $set: { twoFactorSecret: secret, twoFactorEnabled: false } },
      { new: true, strict: false }
    );

    res.status(200).json({
      success: true,
      data: { secret, otpauthUrl },
    });
  } catch (error) {
    console.error('Generate 2FA error:', error.message, error.stack);
    res.status(500).json({ success: false, message: error.message || 'Server error generating 2FA secret' });
  }
};

/**
 * POST /api/user/2fa/verify
 * Verifies a 6-digit TOTP code and enables 2FA for the user.
 * Body: { code: "123456" }  OR  { enabled: false } to disable
 */
const verify2FA = async (req, res) => {
  try {
    const { code, enabled } = req.body;

    // -- Disable path --
    if (enabled === false) {
      await User.findByIdAndUpdate(req.user._id, {
        $set: { twoFactorEnabled: false, twoFactorSecret: null }
      }, { strict: false });
      return res.status(200).json({ success: true, message: '2FA disabled successfully' });
    }

    // -- Enable / verify path --
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide the 6-digit TOTP code' });
    }

    // Fetch the secret (select: false by default)
    const user = await User.findById(req.user._id).select('+twoFactorSecret');
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ success: false, message: 'No 2FA secret found. Please generate a QR code first.' });
    }

    const isValid = await verifyTOTP(user.twoFactorSecret, String(code));
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired TOTP code' });
    }

    await User.findByIdAndUpdate(req.user._id, { $set: { twoFactorEnabled: true } }, { strict: false });

    res.status(200).json({ success: true, message: '2FA verified and enabled successfully' });
  } catch (error) {
    console.error('Verify 2FA error:', error.message, error.stack);
    res.status(500).json({ success: false, message: error.message || 'Server error verifying 2FA code' });
  }
};

/**
 * POST /api/user/auth/change-password
 * Verifies oldPassword and updates to newPassword.
 * Body: { oldPassword, newPassword }
 */
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both oldPassword and newPassword are required',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters',
      });
    }

    // Fetch user with password (select: false by default in schema)
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Old password is incorrect',
      });
    }

    // Plain text here — User pre('save') hashes once. Pre-hashing then save() would double-hash and break login.
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error changing password',
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getTransactions,
  getReferralRewards,
  mockDeposit,
  withdrawTokens,
  generate2FA,
  verify2FA,
  changePassword,
};
