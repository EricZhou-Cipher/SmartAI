import jwt from 'jsonwebtoken';
import { createError } from '../utils/error.js';
import User from '../models/User.js';

/**
 * 保护路由，确保用户已登录
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // 从请求头中获取令牌
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 检查令牌是否存在
    if (!token) {
      return next(createError(401, '未授权访问'));
    }

    try {
      // 验证令牌
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');

      // 将用户信息添加到请求对象
      if (global.useMockData) {
        // 使用模拟数据
        const mockUsers = [
          {
            _id: '60d0fe4f5311236168a109ca',
            name: '测试用户',
            email: 'test@example.com',
            role: 'user',
          },
          {
            _id: '60d0fe4f5311236168a109cb',
            name: '管理员',
            email: 'admin@example.com',
            role: 'admin',
          },
        ];

        const user = mockUsers.find((user) => user._id === decoded.id);

        if (!user) {
          return next(createError(401, '未授权访问'));
        }

        req.user = {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        };

        next();
      } else {
        // 使用真实数据库
        const user = await User.findById(decoded.id);

        if (!user) {
          return next(createError(401, '未授权访问'));
        }

        req.user = user;
        next();
      }
    } catch (err) {
      return next(createError(401, '未授权访问'));
    }
  } catch (err) {
    next(err);
  }
};

/**
 * 授权特定角色访问
 * @param  {...string} roles - 允许访问的角色
 * @returns {Function} - 中间件函数
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError(401, '未授权访问'));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError(403, '您无权访问此资源'));
    }

    next();
  };
};
