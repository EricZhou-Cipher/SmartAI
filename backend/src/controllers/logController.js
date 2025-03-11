const logService = require('../services/logService');

/**
 * 获取日志列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      level,
      source,
      startDate,
      endDate,
      relatedEntityType,
      relatedEntityId,
      search,
    } = req.query;

    // 构建查询条件
    const query = {};

    if (level) {
      query.level = level;
    }

    if (source) {
      query.source = source;
    }

    if (relatedEntityType) {
      query.relatedEntityType = relatedEntityType;
    }

    if (relatedEntityId) {
      query.relatedEntityId = relatedEntityId;
    }

    // 时间范围查询
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    // 搜索功能
    if (search) {
      query.$or = [
        { message: { $regex: search, $options: 'i' } },
        { 'details.stack': { $regex: search, $options: 'i' } },
      ];
    }

    // 获取日志列表
    const result = await logService.getLogs(query, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { timestamp: -1 },
    });

    // 记录API访问
    await logService.logApiAccess(req, '获取日志列表');

    res.json(result);
  } catch (error) {
    console.error('获取日志列表失败:', error);
    await logService.logSystemError(error, 'log_controller');
    res.status(500).json({ message: '获取日志列表失败', error: error.message });
  }
};

/**
 * 获取日志详情
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await logService.getLogById(id);

    // 记录API访问
    await logService.logApiAccess(req, `获取日志详情: ${id}`);

    res.json(log);
  } catch (error) {
    console.error('获取日志详情失败:', error);
    await logService.logSystemError(error, 'log_controller');
    res.status(404).json({ message: '获取日志详情失败', error: error.message });
  }
};

/**
 * 删除日志
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.deleteLog = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await logService.deleteLog(id);

    if (!result) {
      return res.status(404).json({ message: '日志不存在' });
    }

    // 记录用户操作
    if (req.user) {
      await logService.logUserAction('删除日志', req.user._id, { logId: id });
    }

    res.json({ message: '日志删除成功' });
  } catch (error) {
    console.error('删除日志失败:', error);
    await logService.logSystemError(error, 'log_controller');
    res.status(500).json({ message: '删除日志失败', error: error.message });
  }
};

/**
 * 获取日志统计数据
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getLogStats = async (req, res) => {
  try {
    const { level, source, startDate, endDate, interval = 'day', relatedEntityType } = req.query;

    // 构建查询条件
    const query = {};

    if (level) {
      query.level = level;
    }

    if (source) {
      query.source = source;
    }

    if (relatedEntityType) {
      query.relatedEntityType = relatedEntityType;
    }

    // 获取统计数据
    const stats = await logService.getLogStats(
      query,
      'timestamp',
      interval,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    // 记录API访问
    await logService.logApiAccess(req, '获取日志统计数据');

    res.json(stats);
  } catch (error) {
    console.error('获取日志统计数据失败:', error);
    await logService.logSystemError(error, 'log_controller');
    res.status(500).json({ message: '获取日志统计数据失败', error: error.message });
  }
};

/**
 * 获取日志来源列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getLogSources = async (req, res) => {
  try {
    const sources = await logService.getLogSources();
    res.json(sources);
  } catch (error) {
    console.error('获取日志来源列表失败:', error);
    await logService.logSystemError(error, 'log_controller');
    res.status(500).json({ message: '获取日志来源列表失败', error: error.message });
  }
};
