import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/server.js';
import { connectWithRetry, closeConnection } from '../src/utils/connectDB.js';
import jwt from 'jsonwebtoken';

// 测试用户数据
const testUser = {
  _id: new mongoose.Types.ObjectId(),
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin',
};

// 生成测试用 JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

// 测试 token
let token;

beforeAll(async () => {
  await connectWithRetry();
  token = generateToken(testUser);
});

afterAll(async () => {
  await closeConnection();
});

describe('日志 API 测试', () => {
  // 测试获取日志列表
  test('获取日志列表 - 授权用户', async () => {
    const res = await request(app).get('/api/logs').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('items');
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  // 测试未授权访问
  test('获取日志列表 - 未授权', async () => {
    const res = await request(app).get('/api/logs');
    expect(res.status).toBe(401);
  });

  // 测试日志筛选
  test('获取日志列表 - 带筛选条件', async () => {
    const res = await request(app)
      .get('/api/logs?level=error&limit=5')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('items');
    expect(Array.isArray(res.body.data.items)).toBe(true);

    // 如果有错误日志，验证级别是否正确
    if (res.body.data.items.length > 0) {
      res.body.data.items.forEach((log) => {
        expect(log.level).toBe('error');
      });
    }
  });

  // 测试获取日志统计
  test('获取日志统计数据', async () => {
    const res = await request(app).get('/api/logs/stats').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('byLevel');
    expect(res.body.data.byLevel).toHaveProperty('info');
    expect(res.body.data.byLevel).toHaveProperty('warning');
    expect(res.body.data.byLevel).toHaveProperty('error');
  });

  // 测试创建日志
  test('创建日志', async () => {
    const newLog = {
      level: 'info',
      message: '测试日志消息',
      source: 'test',
      details: { test: true },
    };

    const res = await request(app)
      .post('/api/logs')
      .set('Authorization', `Bearer ${token}`)
      .send(newLog);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data).toHaveProperty('level', 'info');
    expect(res.body.data).toHaveProperty('message', '测试日志消息');
    expect(res.body.data).toHaveProperty('source', 'test');

    // 保存日志 ID 用于后续测试
    const logId = res.body.data._id;

    // 测试获取单个日志
    const getRes = await request(app)
      .get(`/api/logs/${logId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body).toHaveProperty('success', true);
    expect(getRes.body).toHaveProperty('data');
    expect(getRes.body.data).toHaveProperty('_id', logId);

    // 测试删除日志
    const deleteRes = await request(app)
      .delete(`/api/logs/${logId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body).toHaveProperty('success', true);
    expect(deleteRes.body).toHaveProperty('data');
    expect(deleteRes.body.data).toHaveProperty('deleted', true);
  });
});
