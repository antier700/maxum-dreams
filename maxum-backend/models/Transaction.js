const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    /** deposit | withdraw | stake | unstake | referral_reward */
    type: {
      type: String,
      required: true,
      enum: ['deposit', 'withdraw', 'stake', 'unstake', 'referral_reward'],
      index: true,
    },
    token: { type: String, default: 'NEXB' },
    amount: { type: Number, required: true },
    /** For withdraw: destination wallet address */
    walletAddress: { type: String, default: '' },
    /** Blockchain transaction hash (if applicable) */
    hash: { type: String, default: '' },
    fromAddress: { type: String, default: '' },
    toAddress: { type: String, default: '' },
    /** pending | completed | failed */
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'completed', 'failed'],
    },
    note: { type: String, default: '' },
  },
  { timestamps: true, versionKey: false }
);

transactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
