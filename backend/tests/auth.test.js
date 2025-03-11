import request from 'supertest';
import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import express from 'express';
import authRoutes from '../src/api/auth.js';
import User from '../src/models/User.js';

// 模拟 User 模型
jest.mock('../src/models/User.js', () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
}));

// 模拟 JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'test-token'),
  verify: jest.fn(() => ({ id: 'test-id' })),
}));

// 创建测试应用
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('认证 API 测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('应该注册新用户并返回 token', async () => {
      // 模拟用户不存在
      User.findOne.mockResolvedValue(null);

      // 模拟用户创建
      const mockUser = {
        _id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        getSignedJwtToken: jest.fn().mockReturnValue('test-token'),
      };
      User.create.mockResolvedValue(mockUser);

      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBe('test-token');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user).toHaveProperty('name');
      expect(res.body.user).toHaveProperty('email');
    });

    it('应该返回 400 如果用户已存在', async () => {
      // 模拟用户已存在
      User.findOne.mockResolvedValue({ email: 'test@example.com' });

      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('用户已存在');
    });
  });

  describe('POST /api/auth/login', () => {
    it('应该登录用户并返回 token', async () => {
      // 模拟用户存在
      const mockUser = {
        _id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        matchPassword: jest.fn().mockResolvedValue(true),
        getSignedJwtToken: jest.fn().mockReturnValue('test-token'),
      };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBe('test-token');
      expect(res.body.user).toHaveProperty('id');
    });

    it('应该返回 401 如果凭据无效', async () => {
      // 模拟用户存在但密码不匹配
      const mockUser = {
        matchPassword: jest.fn().mockResolvedValue(false),
      };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('无效的凭据');
    });
  });
});
