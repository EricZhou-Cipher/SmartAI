import express from 'express';
import { register, login, getMe, logout } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// 注册用户
router.post('/register', register);

// 用户登录
router.post('/login', login);

// 获取当前用户信息（需要认证）
router.get('/me', protect, getMe);

// 用户登出
router.post('/logout', protect, logout);

export default router;
