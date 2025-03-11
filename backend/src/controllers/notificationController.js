const notificationService = require('../services/notificationService');
const logService = require('../services/logService');

/**
 * 获取用户通知列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, isRead, type, priority } = req.query;

    const result = await notificationService.getUserNotifications(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      isRead,
      type,
      priority,
    });

    // 记录API访问
    await logService.logApiAccess(req, '获取用户通知列表');

    res.json(result);
  } catch (error) {
    console.error('获取用户通知列表失败:', error);
    await logService.logSystemError(error, 'notification_controller');
    res.status(500).json({ message: '获取用户通知列表失败', error: error.message });
  }
};

/**
 * 获取通知详情
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await notificationService.getNotificationById(id, userId);

    // 记录API访问
    await logService.logApiAccess(req, `获取通知详情: ${id}`);

    res.json(notification);
  } catch (error) {
    console.error('获取通知详情失败:', error);
    await logService.logSystemError(error, 'notification_controller');
    res.status(404).json({ message: '获取通知详情失败', error: error.message });
  }
};

/**
 * 标记通知为已读
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await notificationService.markNotificationAsRead(id, userId);

    // 记录用户操作
    await logService.logUserAction('标记通知为已读', userId, { notificationId: id });

    res.json(notification);
  } catch (error) {
    console.error('标记通知为已读失败:', error);
    await logService.logSystemError(error, 'notification_controller');
    res.status(404).json({ message: '标记通知为已读失败', error: error.message });
  }
};

/**
 * 标记所有通知为已读
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await notificationService.markAllNotificationsAsRead(userId);

    // 记录用户操作
    await logService.logUserAction('标记所有通知为已读', userId);

    res.json(result);
  } catch (error) {
    console.error('标记所有通知为已读失败:', error);
    await logService.logSystemError(error, 'notification_controller');
    res.status(500).json({ message: '标记所有通知为已读失败', error: error.message });
  }
};

/**
 * 删除通知
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const result = await notificationService.deleteNotification(id, userId);

    // 记录用户操作
    await logService.logUserAction('删除通知', userId, { notificationId: id });

    res.json({ success: result });
  } catch (error) {
    console.error('删除通知失败:', error);
    await logService.logSystemError(error, 'notification_controller');
    res.status(404).json({ message: '删除通知失败', error: error.message });
  }
};

/**
 * 获取未读通知数量
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const count = await notificationService.getUnreadNotificationCount(userId);

    res.json({ count });
  } catch (error) {
    console.error('获取未读通知数量失败:', error);
    await logService.logSystemError(error, 'notification_controller');
    res.status(500).json({ message: '获取未读通知数量失败', error: error.message });
  }
};
