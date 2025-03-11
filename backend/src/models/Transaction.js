import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema(
  {
    hash: {
      type: String,
      required: [true, '请提供交易哈希'],
      unique: true,
      trim: true,
    },
    blockchain: {
      type: String,
      required: [true, '请提供区块链名称'],
      enum: ['Ethereum', 'Bitcoin', 'Solana', 'Polygon', 'BSC', 'Other'],
      default: 'Ethereum',
    },
    fromAddress: {
      type: String,
      required: [true, '请提供发送地址'],
      trim: true,
    },
    toAddress: {
      type: String,
      required: [true, '请提供接收地址'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, '请提供交易金额'],
    },
    amountUSD: {
      type: Number,
      default: 0,
    },
    fee: {
      type: Number,
      default: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    blockNumber: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'confirmed',
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
    tags: {
      type: [String],
      default: [],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// 索引
TransactionSchema.index({ hash: 1 });
TransactionSchema.index({ fromAddress: 1 });
TransactionSchema.index({ toAddress: 1 });
TransactionSchema.index({ blockchain: 1 });
TransactionSchema.index({ riskLevel: 1 });
TransactionSchema.index({ timestamp: -1 });

export default mongoose.model('Transaction', TransactionSchema);
