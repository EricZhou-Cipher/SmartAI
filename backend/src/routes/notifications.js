const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

/**
 * @route   GET /api/notifications
 * @desc    获取用户通知列表
 * @access  Private
 */
router.get('/', authenticate, notificationController.getUserNotifications);

/**
 * @route   GET /api/notifications/unread/count
 * @desc    获取未读通知数量
 * @access  Private
 */
router.get('/unread/count', authenticate, notificationController.getUnreadNotificationCount);

/**
 * @route   GET /api/notifications/:id
 * @desc    获取通知详情
 * @access  Private
 */
router.get('/:id', authenticate, notificationController.getNotificationById);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    标记通知为已读
 * @access  Private
 */
router.patch('/:id/read', authenticate, notificationController.markNotificationAsRead);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    标记所有通知为已读
 * @access  Private
 */
router.patch('/read-all', authenticate, notificationController.markAllNotificationsAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    删除通知
 * @access  Private
 */
router.delete('/:id', authenticate, notificationController.deleteNotification);

module.exports = router;
