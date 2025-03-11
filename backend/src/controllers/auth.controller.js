import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { createError } from '../utils/error.js';

// 模拟用户数据（当数据库不可用时使用）
const mockUsers = [
  {
    _id: '60d0fe4f5311236168a109ca',
    name: '测试用户',
    email: 'test@example.com',
    role: 'user',
    password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LnCEGgglqK4LM9ggVxPeIRJHdNRaQSu', // 'password123'
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    _id: '60d0fe4f5311236168a109cb',
    name: '管理员',
    email: 'admin@example.com',
    role: 'admin',
    password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LnCEGgglqK4LM9ggVxPeIRJHdNRaQSu', // 'password123'
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
];

// 使用模拟数据查找用户
const findMockUserByEmail = (email) => {
  return mockUsers.find((user) => user.email === email);
};

// 使用模拟数据查找用户（通过ID）
const findMockUserById = (id) => {
  return mockUsers.find((user) => user._id === id);
};

/**
 * @desc    注册用户
 * @route   POST /api/auth/register
 * @access  公开
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 检查必填字段
    if (!name || !email || !password) {
      return next(createError(400, '请提供所有必填字段'));
    }

    // 检查邮箱格式
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return next(createError(400, '请提供有效的邮箱'));
    }

    // 检查密码长度
    if (password.length < 6) {
      return next(createError(400, '密码至少6个字符'));
    }

    // 检查用户是否已存在
    let existingUser;

    if (global.useMockData) {
      existingUser = findMockUserByEmail(email);

      if (existingUser) {
        return next(createError(400, '该邮箱已被注册'));
      }

      // 创建新用户（模拟）
      const bcrypt = await import('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: `user_${Date.now()}`,
        name,
        email,
        password: hashedPassword,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsers.push(newUser);

      // 生成 JWT
      const token = jwt.sign(
        { id: newUser._id, role: newUser.role },
        process.env.JWT_SECRET || 'your-jwt-secret',
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
      );

      // 返回响应
      return res.status(201).json({
        success: true,
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } else {
      // 使用真实数据库
      existingUser = await User.findOne({ email });

      if (existingUser) {
        return next(createError(400, '该邮箱已被注册'));
      }

      // 创建新用户
      const user = await User.create({
        name,
        email,
        password,
      });

      // 生成 JWT
      const token = user.getSignedJwtToken();

      // 返回响应
      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    用户登录
 * @route   POST /api/auth/login
 * @access  公开
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 检查必填字段
    if (!email || !password) {
      return next(createError(400, '请提供邮箱和密码'));
    }

    let user;
    let isMatch;

    if (global.useMockData) {
      // 使用模拟数据
      user = findMockUserByEmail(email);

      if (!user) {
        return next(createError(401, '无效的凭据'));
      }

      // 验证密码
      const bcrypt = await import('bcryptjs');
      isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return next(createError(401, '无效的凭据'));
      }

      // 生成 JWT
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || 'your-jwt-secret',
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
      );

      // 返回响应
      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      // 使用真实数据库
      user = await User.findOne({ email }).select('+password');

      if (!user) {
        return next(createError(401, '无效的凭据'));
      }

      // 验证密码
      isMatch = await user.matchPassword(password);

      if (!isMatch) {
        return next(createError(401, '无效的凭据'));
      }

      // 生成 JWT
      const token = user.getSignedJwtToken();

      // 返回响应
      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    获取当前用户信息
 * @route   GET /api/auth/me
 * @access  私有
 */
export const getMe = async (req, res, next) => {
  try {
    let user;

    if (global.useMockData) {
      // 使用模拟数据
      user = findMockUserById(req.user.id);

      if (!user) {
        return next(createError(404, '未找到用户'));
      }

      return res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      // 使用真实数据库
      user = await User.findById(req.user.id);

      if (!user) {
        return next(createError(404, '未找到用户'));
      }

      return res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    用户登出
 * @route   POST /api/auth/logout
 * @access  私有
 */
export const logout = async (req, res, next) => {
  try {
    // 在客户端，用户需要删除存储的令牌
    // 这里只是返回成功响应
    res.status(200).json({
      success: true,
      message: '登出成功',
    });
  } catch (err) {
    next(err);
  }
};
