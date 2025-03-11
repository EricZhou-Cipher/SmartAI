import request from 'supertest';
import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import express from 'express';
import addressRoutes from '../src/api/address.js';
import * as addressController from '../src/controllers/address.controller.js';

// 模拟中间件
jest.mock('../src/middleware/authMiddleware.js', () => ({
  protect: (req, res, next) => {
    req.user = { id: 'test-user-id', role: 'admin' };
    next();
  },
  authorize: () => (req, res, next) => {
    next();
  },
}));

// 模拟控制器方法
jest.mock('../src/controllers/address.controller.js');

// 创建测试应用
const app = express();
app.use(express.json());
app.use('/api/address', addressRoutes);

describe('地址 API 测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('GET /api/address/:address', () => {
    it('应该返回地址信息', async () => {
      // 模拟控制器响应
      addressController.getAddress.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            _id: 'addr_1',
            address: '0xabc123',
            blockchain: 'Ethereum',
            balance: 10.5,
            transactionCount: 42,
            riskLevel: 'low',
          },
        });
      });

      const res = await request(app).get('/api/address/0xabc123');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('address', '0xabc123');
      expect(addressController.getAddress).toHaveBeenCalled();
    });
  });

  describe('POST /api/address/analyze', () => {
    it('应该分析地址并返回结果', async () => {
      // 模拟控制器响应
      addressController.analyzeAddress.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            _id: 'addr_1',
            address: '0xabc123',
            blockchain: 'Ethereum',
            balance: 10.5,
            transactionCount: 42,
            riskLevel: 'low',
            riskScore: 20,
          },
        });
      });

      const res = await request(app).post('/api/address/analyze').send({
        address: '0xabc123',
        blockchain: 'Ethereum',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('address', '0xabc123');
      expect(res.body.data).toHaveProperty('riskLevel');
      expect(addressController.analyzeAddress).toHaveBeenCalled();
    });
  });

  describe('GET /api/address/:address/transactions', () => {
    it('应该返回地址的交易历史', async () => {
      // 模拟控制器响应
      addressController.getAddressTransactions.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          count: 2,
          total: 2,
          pagination: {
            page: 1,
            limit: 10,
            totalPages: 1,
          },
          data: [
            {
              _id: 'tx_1',
              hash: '0x123',
              fromAddress: '0xabc123',
              toAddress: '0xdef456',
              amount: 1.5,
            },
            {
              _id: 'tx_2',
              hash: '0x456',
              fromAddress: '0xdef456',
              toAddress: '0xabc123',
              amount: 2.5,
            },
          ],
        });
      });

      const res = await request(app).get('/api/address/0xabc123/transactions');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toHaveLength(2);
      expect(addressController.getAddressTransactions).toHaveBeenCalled();
    });
  });

  describe('POST /api/address/:address/tags', () => {
    it('应该添加标签到地址', async () => {
      // 模拟控制器响应
      addressController.addAddressTags.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            _id: 'addr_1',
            address: '0xabc123',
            blockchain: 'Ethereum',
            tags: ['existing-tag', 'new-tag'],
          },
        });
      });

      const res = await request(app)
        .post('/api/address/0xabc123/tags')
        .send({
          tags: ['new-tag'],
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tags).toContain('new-tag');
      expect(res.body.data.tags).toContain('existing-tag');
      expect(addressController.addAddressTags).toHaveBeenCalled();
    });
  });
});
