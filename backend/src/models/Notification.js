const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['alert', 'system', 'transaction', 'info'],
      default: 'info',
      index: true,
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
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
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    expiresAt: {
      type: Date,
      index: true,
    },
  },
  { timestamps: true }
);

// 创建复合索引，用于按用户和创建时间查询
NotificationSchema.index({ userId: 1, createdAt: -1 });
// 创建复合索引，用于按用户和已读状态查询
NotificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
