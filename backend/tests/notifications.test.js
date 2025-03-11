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
// 测试通知 ID
let notificationId;

beforeAll(async () => {
  await connectWithRetry();
  token = generateToken(testUser);
});

afterAll(async () => {
  await closeConnection();
});

describe('通知 API 测试', () => {
  // 测试获取用户通知列表
  test('获取用户通知列表 - 授权用户', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('items');
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  // 测试未授权访问
  test('获取用户通知列表 - 未授权', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(401);
  });

  // 测试创建通知
  test('创建通知', async () => {
    const newNotification = {
      title: '测试通知',
      message: '这是一条测试通知消息',
      type: 'system',
      priority: 'medium',
      userId: testUser._id.toString(),
    };

    const res = await request(app)
      .post('/api/notifications')
      .set('Authorization', `Bearer ${token}`)
      .send(newNotification);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data).toHaveProperty('title', '测试通知');
    expect(res.body.data).toHaveProperty('message', '这是一条测试通知消息');
    expect(res.body.data).toHaveProperty('type', 'system');
    expect(res.body.data).toHaveProperty('priority', 'medium');
    expect(res.body.data).toHaveProperty('isRead', false);

    // 保存通知 ID 用于后续测试
    notificationId = res.body.data._id;
  });

  // 测试获取单个通知
  test('获取单个通知', async () => {
    // 确保有通知 ID
    expect(notificationId).toBeDefined();

    const res = await request(app)
      .get(`/api/notifications/${notificationId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('_id', notificationId);
    expect(res.body.data).toHaveProperty('title', '测试通知');
  });

  // 测试标记通知为已读
  test('标记通知为已读', async () => {
    // 确保有通知 ID
    expect(notificationId).toBeDefined();

    const res = await request(app)
      .patch(`/api/notifications/${notificationId}/read`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('_id', notificationId);
    expect(res.body.data).toHaveProperty('isRead', true);
  });

  // 测试获取未读通知数量
  test('获取未读通知数量', async () => {
    const res = await request(app)
      .get('/api/notifications/unread/count')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('count');
    expect(typeof res.body.data.count).toBe('number');
  });

  // 测试标记所有通知为已读
  test('标记所有通知为已读', async () => {
    const res = await request(app)
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('updated');
    expect(typeof res.body.data.updated).toBe('number');

    // 验证未读通知数量为0
    const countRes = await request(app)
      .get('/api/notifications/unread/count')
      .set('Authorization', `Bearer ${token}`);

    expect(countRes.status).toBe(200);
    expect(countRes.body.data.count).toBe(0);
  });

  // 测试删除通知
  test('删除通知', async () => {
    // 确保有通知 ID
    expect(notificationId).toBeDefined();

    const res = await request(app)
      .delete(`/api/notifications/${notificationId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('deleted', true);

    // 验证通知已被删除
    const getRes = await request(app)
      .get(`/api/notifications/${notificationId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.status).toBe(404);
  });
});
