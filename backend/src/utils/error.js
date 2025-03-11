/**
 * 创建自定义错误
 * @param {number} statusCode - HTTP 状态码
 * @param {string} message - 错误消息
 * @returns {Error} - 自定义错误对象
 */
export const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * 错误处理中间件
 * @param {Error} err - 错误对象
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // 记录错误
  console.error(err);

  // Mongoose 错误处理
  if (err.name === 'CastError') {
    const message = '资源不存在';
    error = createError(404, message);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = createError(400, message);
  }

  if (err.code === 11000) {
    const message = '该字段值已存在';
    error = createError(400, message);
  }

  // 返回错误响应
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || '服务器错误',
  });
};
