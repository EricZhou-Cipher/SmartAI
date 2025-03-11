import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: [true, '请提供地址'],
      unique: true,
      trim: true,
    },
    blockchain: {
      type: String,
      required: [true, '请提供区块链名称'],
      enum: ['Ethereum', 'Bitcoin', 'Solana', 'Polygon', 'BSC', 'Other'],
      default: 'Ethereum',
    },
    balance: {
      type: Number,
      default: 0,
    },
    balanceUSD: {
      type: Number,
      default: 0,
    },
    transactionCount: {
      type: Number,
      default: 0,
    },
    firstSeen: {
      type: Date,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
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
    category: {
      type: String,
      enum: ['exchange', 'defi', 'wallet', 'contract', 'mining', 'scam', 'other'],
      default: 'other',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    relatedAddresses: [
      {
        address: {
          type: String,
          required: true,
        },
        relationship: {
          type: String,
          enum: ['sender', 'receiver', 'contract', 'other'],
          default: 'other',
        },
        transactionCount: {
          type: Number,
          default: 0,
        },
      },
    ],
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
AddressSchema.index({ address: 1 });
AddressSchema.index({ blockchain: 1 });
AddressSchema.index({ riskLevel: 1 });
AddressSchema.index({ category: 1 });
AddressSchema.index({ tags: 1 });

export default mongoose.model('Address', AddressSchema);
