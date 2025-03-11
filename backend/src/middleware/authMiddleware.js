import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 模拟用户数据（用于演示，无 MongoDB 时使用）
const mockUsers = [
  {
    _id: 'admin_user_id',
    name: '管理员',
    email: 'admin@example.com',
    role: 'admin',
  },
  {
    _id: 'test_user_id',
    name: '测试用户',
    email: 'test@example.com',
    role: 'user',
  },
];

// 检查 MongoDB 是否可用
const useRealDB = process.env.USE_REAL_DB === 'true';

// 保护路由
export const protect = async (req, res, next) => {
  let token;

  // 检查请求头中的 Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // 从 Bearer token 中提取 token
    token = req.headers.authorization.split(' ')[1];
  }

  // 检查 token 是否存在
  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未授权访问',
    });
  }

  try {
    if (useRealDB) {
      // 验证 token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 将用户信息添加到请求对象
      req.user = await User.findById(decoded.id);
    } else {
      // 模拟验证 token（演示用）
      if (token === 'mock_token_for_demo') {
        // 使用模拟用户
        req.user = mockUsers[1]; // 测试用户
      } else if (token === 'mock_admin_token') {
        // 使用模拟管理员
        req.user = mockUsers[0]; // 管理员
      }
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '未授权访问',
    });
  }
};

// 授权角色
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '未授权访问',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '无权执行此操作',
      });
    }

    next();
  };
};
