const Notification = require('../models/Notification');
const { io } = require('../server');
const logService = require('./logService');

/**
 * 通知服务
 * 提供通知管理和WebSocket推送功能
 */
class NotificationService {
  constructor() {
    // 存储用户WebSocket连接
    this.userConnections = new Map();

    // 初始化WebSocket连接处理
    this.initializeSocketHandlers();
  }

  /**
   * 初始化WebSocket连接处理
   */
  initializeSocketHandlers() {
    io.on('connection', (socket) => {
      console.log('新的WebSocket连接:', socket.id);

      // 用户认证
      socket.on('authenticate', async (token) => {
        try {
          // 这里应该验证token并获取用户信息
          // 简化处理，假设token就是用户ID
          const userId = token;

          if (!userId) {
            socket.emit('auth_error', { message: '认证失败' });
            return;
          }

          // 存储用户连接
          this.addUserConnection(userId, socket);

          // 发送认证成功消息
          socket.emit('authenticated', { userId });

          // 记录日志
          await logService.info('用户WebSocket连接认证成功', 'notification_service', {
            userId,
            socketId: socket.id,
          });

          // 获取未读通知数量
          const unreadCount = await this.getUnreadNotificationCount(userId);
          socket.emit('unread_count', { count: unreadCount });
        } catch (error) {
          console.error('WebSocket认证失败:', error);
          socket.emit('auth_error', { message: '认证失败' });

          await logService.error('WebSocket认证失败', 'notification_service', {
            error: error.message,
            socketId: socket.id,
          });
        }
      });

      // 断开连接
      socket.on('disconnect', () => {
        this.removeUserConnection(socket.id);
        console.log('WebSocket连接断开:', socket.id);
      });
    });
  }

  /**
   * 添加用户WebSocket连接
   * @param {String} userId - 用户ID
   * @param {Object} socket - Socket.io连接对象
   */
  addUserConnection(userId, socket) {
    // 存储用户ID到socket对象
    socket.userId = userId;

    // 将socket加入用户房间
    socket.join(`user:${userId}`);

    // 存储用户连接
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId).add(socket.id);

    console.log(`用户 ${userId} 已连接，Socket ID: ${socket.id}`);
  }

  /**
   * 移除用户WebSocket连接
   * @param {String} socketId - Socket.io连接ID
   */
  removeUserConnection(socketId) {
    const socket = io.sockets.sockets.get(socketId);
    if (!socket) return;

    const userId = socket.userId;
    if (!userId) return;

    // 从用户连接集合中移除
    const userSockets = this.userConnections.get(userId);
    if (userSockets) {
      userSockets.delete(socketId);
      if (userSockets.size === 0) {
        this.userConnections.delete(userId);
      }
    }

    console.log(`用户 ${userId} 的连接 ${socketId} 已断开`);
  }

  /**
   * 创建通知
   * @param {Object} notificationData - 通知数据
   * @returns {Promise<Object>} 创建的通知对象
   */
  async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      const savedNotification = await notification.save();

      // 推送通知到用户
      this.pushNotificationToUser(notificationData.userId, 'new_notification', savedNotification);

      // 更新未读通知数量
      const unreadCount = await this.getUnreadNotificationCount(notificationData.userId);
      this.pushNotificationToUser(notificationData.userId, 'unread_count', { count: unreadCount });

      return savedNotification;
    } catch (error) {
      console.error('创建通知失败:', error);
      await logService.error('创建通知失败', 'notification_service', {
        error: error.message,
        notificationData,
      });
      throw error;
    }
  }

  /**
   * 推送通知到用户
   * @param {String} userId - 用户ID
   * @param {String} event - 事件名称
   * @param {Object} data - 事件数据
   */
  pushNotificationToUser(userId, event, data) {
    io.to(`user:${userId}`).emit(event, data);
  }

  /**
   * 创建告警通知
   * @param {Object} alert - 告警对象
   * @param {String} userId - 用户ID
   * @returns {Promise<Object>} 创建的通知对象
   */
  async createAlertNotification(alert, userId) {
    const priority = this.mapAlertRiskLevelToPriority(alert.riskLevel);

    return this.createNotification({
      userId,
      title: `${alert.riskLevel}告警: ${alert.rule.name}`,
      message: alert.description || `检测到${alert.riskLevel}风险告警`,
      type: 'alert',
      priority,
      relatedEntityType: 'alert',
      relatedEntityId: alert._id.toString(),
      data: {
        alert: {
          id: alert._id,
          riskLevel: alert.riskLevel,
          ruleName: alert.rule.name,
          target: alert.target,
        },
      },
    });
  }

  /**
   * 创建交易通知
   * @param {Object} transaction - 交易对象
   * @param {String} userId - 用户ID
   * @param {String} message - 通知消息
   * @returns {Promise<Object>} 创建的通知对象
   */
  async createTransactionNotification(transaction, userId, message) {
    return this.createNotification({
      userId,
      title: '交易通知',
      message,
      type: 'transaction',
      priority: 'medium',
      relatedEntityType: 'transaction',
      relatedEntityId: transaction._id.toString(),
      data: {
        transaction: {
          id: transaction._id,
          hash: transaction.hash,
          amount: transaction.amount,
          from: transaction.from,
          to: transaction.to,
        },
      },
    });
  }

  /**
   * 创建系统通知
   * @param {String} title - 通知标题
   * @param {String} message - 通知消息
   * @param {String} userId - 用户ID
   * @param {String} priority - 优先级
   * @returns {Promise<Object>} 创建的通知对象
   */
  async createSystemNotification(title, message, userId, priority = 'medium') {
    return this.createNotification({
      userId,
      title,
      message,
      type: 'system',
      priority,
      relatedEntityType: 'system',
    });
  }

  /**
   * 将告警风险等级映射为通知优先级
   * @param {String} riskLevel - 风险等级
   * @returns {String} 通知优先级
   */
  mapAlertRiskLevelToPriority(riskLevel) {
    const mapping = {
      高风险: 'high',
      中风险: 'medium',
      低风险: 'low',
    };
    return mapping[riskLevel] || 'medium';
  }

  /**
   * 获取用户通知列表
   * @param {String} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 通知列表和分页信息
   */
  async getUserNotifications(userId, options = {}) {
    const { page = 1, limit = 20, isRead, type, priority, sort = { createdAt: -1 } } = options;

    const skip = (page - 1) * limit;

    // 构建查询条件
    const query = { userId };

    if (isRead !== undefined) {
      query.isRead = isRead === 'true' || isRead === true;
    }

    if (type) {
      query.type = type;
    }

    if (priority) {
      query.priority = priority;
    }

    try {
      const [notifications, total] = await Promise.all([
        Notification.find(query).sort(sort).skip(skip).limit(limit).lean(),
        Notification.countDocuments(query),
      ]);

      return {
        notifications,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('获取用户通知列表失败:', error);
      await logService.error('获取用户通知列表失败', 'notification_service', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * 获取通知详情
   * @param {String} id - 通知ID
   * @param {String} userId - 用户ID
   * @returns {Promise<Object>} 通知对象
   */
  async getNotificationById(id, userId) {
    try {
      const notification = await Notification.findOne({
        _id: id,
        userId,
      }).lean();

      if (!notification) {
        throw new Error('通知不存在');
      }

      return notification;
    } catch (error) {
      console.error('获取通知详情失败:', error);
      await logService.error('获取通知详情失败', 'notification_service', {
        error: error.message,
        id,
        userId,
      });
      throw error;
    }
  }

  /**
   * 标记通知为已读
   * @param {String} id - 通知ID
   * @param {String} userId - 用户ID
   * @returns {Promise<Object>} 更新后的通知对象
   */
  async markNotificationAsRead(id, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: id, userId },
        { isRead: true },
        { new: true }
      ).lean();

      if (!notification) {
        throw new Error('通知不存在');
      }

      // 更新未读通知数量
      const unreadCount = await this.getUnreadNotificationCount(userId);
      this.pushNotificationToUser(userId, 'unread_count', { count: unreadCount });

      return notification;
    } catch (error) {
      console.error('标记通知为已读失败:', error);
      await logService.error('标记通知为已读失败', 'notification_service', {
        error: error.message,
        id,
        userId,
      });
      throw error;
    }
  }

  /**
   * 标记所有通知为已读
   * @param {String} userId - 用户ID
   * @returns {Promise<Object>} 更新结果
   */
  async markAllNotificationsAsRead(userId) {
    try {
      const result = await Notification.updateMany({ userId, isRead: false }, { isRead: true });

      // 更新未读通知数量
      this.pushNotificationToUser(userId, 'unread_count', { count: 0 });

      return {
        success: true,
        modifiedCount: result.modifiedCount,
      };
    } catch (error) {
      console.error('标记所有通知为已读失败:', error);
      await logService.error('标记所有通知为已读失败', 'notification_service', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * 删除通知
   * @param {String} id - 通知ID
   * @param {String} userId - 用户ID
   * @returns {Promise<Boolean>} 是否删除成功
   */
  async deleteNotification(id, userId) {
    try {
      const result = await Notification.findOneAndDelete({
        _id: id,
        userId,
      });

      if (!result) {
        throw new Error('通知不存在');
      }

      // 如果删除的是未读通知，更新未读通知数量
      if (!result.isRead) {
        const unreadCount = await this.getUnreadNotificationCount(userId);
        this.pushNotificationToUser(userId, 'unread_count', { count: unreadCount });
      }

      return true;
    } catch (error) {
      console.error('删除通知失败:', error);
      await logService.error('删除通知失败', 'notification_service', {
        error: error.message,
        id,
        userId,
      });
      throw error;
    }
  }

  /**
   * 获取未读通知数量
   * @param {String} userId - 用户ID
   * @returns {Promise<Number>} 未读通知数量
   */
  async getUnreadNotificationCount(userId) {
    try {
      return await Notification.countDocuments({
        userId,
        isRead: false,
      });
    } catch (error) {
      console.error('获取未读通知数量失败:', error);
      await logService.error('获取未读通知数量失败', 'notification_service', {
        error: error.message,
        userId,
      });
      return 0;
    }
  }

  /**
   * 清理过期通知
   * @returns {Promise<Number>} 清理的通知数量
   */
  async cleanupExpiredNotifications() {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() },
      });

      await logService.info('清理过期通知', 'notification_service', {
        deletedCount: result.deletedCount,
      });

      return result.deletedCount;
    } catch (error) {
      console.error('清理过期通知失败:', error);
      await logService.error('清理过期通知失败', 'notification_service', { error: error.message });
      throw error;
    }
  }
}

module.exports = new NotificationService();
