const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: ['info', 'warning', 'error'],
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      required: true,
      index: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    relatedEntityType: {
      type: String,
      enum: ['alert', 'transaction', 'address', 'user', 'system'],
      index: true,
    },
    relatedEntityId: {
      type: String,
      index: true,
    },
    ip: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// 创建复合索引，用于按时间和级别查询
LogSchema.index({ timestamp: -1, level: 1 });
// 创建复合索引，用于按来源和时间查询
LogSchema.index({ source: 1, timestamp: -1 });

const Log = mongoose.model('Log', LogSchema);

module.exports = Log;
