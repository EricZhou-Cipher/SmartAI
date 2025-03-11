const logService = require('../services/logService');

/**
 * API请求日志中间件
 * 记录所有API请求的访问日志
 */
const apiLogger = async (req, res, next) => {
  // 保存原始的响应结束方法
  const originalEnd = res.end;

  // 请求开始时间
  const startTime = Date.now();

  // 重写响应结束方法
  res.end = function (chunk, encoding) {
    // 恢复原始的结束方法
    res.end = originalEnd;

    // 调用原始的结束方法
    res.end(chunk, encoding);

    // 计算请求处理时间
    const responseTime = Date.now() - startTime;

    // 异步记录API访问日志
    (async () => {
      try {
        // 排除静态资源和健康检查请求
        if (
          req.path.startsWith('/api') &&
          !req.path.includes('/health') &&
          !req.path.includes('/metrics')
        ) {
          await logService.info(
            `API请求: ${req.method} ${req.path}`,
            'api_access',
            {
              method: req.method,
              path: req.path,
              query: req.query,
              params: req.params,
              statusCode: res.statusCode,
              responseTime: `${responseTime}ms`,
            },
            {
              ip: req.ip,
              userAgent: req.headers['user-agent'],
              userId: req.user ? req.user._id : null,
            }
          );
        }
      } catch (error) {
        console.error('记录API访问日志失败:', error);
      }
    })();
  };

  next();
};

/**
 * 错误日志中间件
 * 记录所有未捕获的错误
 */
const errorLogger = (err, req, res, next) => {
  // 异步记录错误日志
  (async () => {
    try {
      await logService.error(
        `API错误: ${err.message}`,
        'api_error',
        {
          method: req.method,
          path: req.path,
          query: req.query,
          params: req.params,
          stack: err.stack,
        },
        {
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          userId: req.user ? req.user._id : null,
          relatedEntityType: 'system',
        }
      );
    } catch (logError) {
      console.error('记录错误日志失败:', logError);
    }
  })();

  // 继续错误处理流程
  next(err);
};

module.exports = {
  apiLogger,
  errorLogger,
};
