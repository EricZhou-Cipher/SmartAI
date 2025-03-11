const Log = require('../models/Log');

/**
 * 日志服务
 * 提供系统日志记录和查询功能
 */
class LogService {
  /**
   * 创建日志
   * @param {Object} logData - 日志数据
   * @returns {Promise<Object>} 创建的日志对象
   */
  async createLog(logData) {
    try {
      const log = new Log(logData);
      return await log.save();
    } catch (error) {
      console.error('创建日志失败:', error);
      throw error;
    }
  }

  /**
   * 记录信息日志
   * @param {String} message - 日志消息
   * @param {String} source - 日志来源
   * @param {Object} details - 详细信息
   * @param {Object} options - 其他选项
   * @returns {Promise<Object>} 创建的日志对象
   */
  async info(message, source, details = {}, options = {}) {
    return this.createLog({
      level: 'info',
      message,
      source,
      details,
      ...options,
    });
  }

  /**
   * 记录警告日志
   * @param {String} message - 日志消息
   * @param {String} source - 日志来源
   * @param {Object} details - 详细信息
   * @param {Object} options - 其他选项
   * @returns {Promise<Object>} 创建的日志对象
   */
  async warning(message, source, details = {}, options = {}) {
    return this.createLog({
      level: 'warning',
      message,
      source,
      details,
      ...options,
    });
  }

  /**
   * 记录错误日志
   * @param {String} message - 日志消息
   * @param {String} source - 日志来源
   * @param {Object} details - 详细信息
   * @param {Object} options - 其他选项
   * @returns {Promise<Object>} 创建的日志对象
   */
  async error(message, source, details = {}, options = {}) {
    return this.createLog({
      level: 'error',
      message,
      source,
      details,
      ...options,
    });
  }

  /**
   * 记录API访问日志
   * @param {Object} req - 请求对象
   * @param {String} message - 日志消息
   * @returns {Promise<Object>} 创建的日志对象
   */
  async logApiAccess(req, message) {
    const options = {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      userId: req.user ? req.user._id : null,
      source: 'api',
      details: {
        method: req.method,
        path: req.path,
        query: req.query,
        params: req.params,
      },
    };

    return this.info(message, 'api_access', {}, options);
  }

  /**
   * 记录告警触发事件
   * @param {Object} alert - 告警对象
   * @param {String} userId - 用户ID
   * @returns {Promise<Object>} 创建的日志对象
   */
  async logAlertTriggered(alert, userId = null) {
    return this.warning(
      `告警触发: ${alert.rule.name}`,
      'alert_system',
      { alert },
      {
        userId,
        relatedEntityType: 'alert',
        relatedEntityId: alert._id.toString(),
      }
    );
  }

  /**
   * 记录用户操作日志
   * @param {String} action - 操作类型
   * @param {String} userId - 用户ID
   * @param {Object} details - 详细信息
   * @returns {Promise<Object>} 创建的日志对象
   */
  async logUserAction(action, userId, details = {}) {
    return this.info(`用户操作: ${action}`, 'user_action', details, {
      userId,
      relatedEntityType: 'user',
      relatedEntityId: userId,
    });
  }

  /**
   * 记录系统异常
   * @param {Error} error - 错误对象
   * @param {String} source - 错误来源
   * @param {Object} details - 详细信息
   * @returns {Promise<Object>} 创建的日志对象
   */
  async logSystemError(error, source, details = {}) {
    return this.error(
      `系统错误: ${error.message}`,
      source,
      {
        ...details,
        stack: error.stack,
      },
      {
        relatedEntityType: 'system',
      }
    );
  }

  /**
   * 获取日志列表
   * @param {Object} query - 查询条件
   * @param {Object} options - 分页和排序选项
   * @returns {Promise<Object>} 日志列表和分页信息
   */
  async getLogs(query = {}, options = {}) {
    const { page = 1, limit = 20, sort = { timestamp: -1 } } = options;
    const skip = (page - 1) * limit;

    try {
      const [logs, total] = await Promise.all([
        Log.find(query).sort(sort).skip(skip).limit(limit).lean(),
        Log.countDocuments(query),
      ]);

      return {
        logs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('获取日志列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取单个日志详情
   * @param {String} id - 日志ID
   * @returns {Promise<Object>} 日志对象
   */
  async getLogById(id) {
    try {
      const log = await Log.findById(id).lean();
      if (!log) {
        throw new Error('日志不存在');
      }
      return log;
    } catch (error) {
      console.error('获取日志详情失败:', error);
      throw error;
    }
  }

  /**
   * 删除日志
   * @param {String} id - 日志ID
   * @returns {Promise<Boolean>} 是否删除成功
   */
  async deleteLog(id) {
    try {
      const result = await Log.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('删除日志失败:', error);
      throw error;
    }
  }

  /**
   * 获取日志统计数据
   * @param {Object} query - 查询条件
   * @param {String} timeField - 时间字段
   * @param {String} interval - 时间间隔 (day, hour)
   * @param {Date} startDate - 开始日期
   * @param {Date} endDate - 结束日期
   * @returns {Promise<Array>} 统计数据
   */
  async getLogStats(query = {}, timeField = 'timestamp', interval = 'day', startDate, endDate) {
    const timeQuery = {};

    if (startDate || endDate) {
      timeQuery[timeField] = {};
      if (startDate) timeQuery[timeField].$gte = startDate;
      if (endDate) timeQuery[timeField].$lte = endDate;
    }

    const finalQuery = { ...query, ...timeQuery };

    let groupBy;
    if (interval === 'hour') {
      groupBy = {
        year: { $year: `$${timeField}` },
        month: { $month: `$${timeField}` },
        day: { $dayOfMonth: `$${timeField}` },
        hour: { $hour: `$${timeField}` },
      };
    } else {
      // 默认按天分组
      groupBy = {
        year: { $year: `$${timeField}` },
        month: { $month: `$${timeField}` },
        day: { $dayOfMonth: `$${timeField}` },
      };
    }

    try {
      const stats = await Log.aggregate([
        { $match: finalQuery },
        {
          $group: {
            _id: groupBy,
            count: { $sum: 1 },
            infoCount: {
              $sum: { $cond: [{ $eq: ['$level', 'info'] }, 1, 0] },
            },
            warningCount: {
              $sum: { $cond: [{ $eq: ['$level', 'warning'] }, 1, 0] },
            },
            errorCount: {
              $sum: { $cond: [{ $eq: ['$level', 'error'] }, 1, 0] },
            },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } },
      ]);

      // 格式化结果
      return stats.map((item) => {
        let date;
        if (interval === 'hour') {
          date = new Date(item._id.year, item._id.month - 1, item._id.day, item._id.hour);
        } else {
          date = new Date(item._id.year, item._id.month - 1, item._id.day);
        }

        return {
          date: date.toISOString(),
          count: item.count,
          infoCount: item.infoCount,
          warningCount: item.warningCount,
          errorCount: item.errorCount,
        };
      });
    } catch (error) {
      console.error('获取日志统计数据失败:', error);
      throw error;
    }
  }
}

module.exports = new LogService();
