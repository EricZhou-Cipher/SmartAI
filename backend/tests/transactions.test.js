import request from 'supertest';
import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import express from 'express';
import transactionRoutes from '../src/api/transactions.js';
import * as transactionController from '../src/controllers/transactions.controller.js';

// 模拟中间件
jest.mock('../src/middleware/authMiddleware.js', () => ({
  protect: (req, res, next) => {
    req.user = { id: 'test-user-id', role: 'user' };
    next();
  },
  authorize: () => (req, res, next) => {
    next();
  },
}));

// 模拟控制器方法
jest.mock('../src/controllers/transactions.controller.js');

// 创建测试应用
const app = express();
app.use(express.json());
app.use('/api/transactions', transactionRoutes);

describe('交易 API 测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('GET /api/transactions', () => {
    it('应该返回交易列表', async () => {
      // 模拟控制器响应
      transactionController.getTransactions.mockImplementation((req, res) => {
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
              blockchain: 'Ethereum',
              fromAddress: '0xabc',
              toAddress: '0xdef',
              amount: 1.5,
            },
            {
              _id: 'tx_2',
              hash: '0x456',
              blockchain: 'Ethereum',
              fromAddress: '0xghi',
              toAddress: '0xjkl',
              amount: 2.5,
            },
          ],
        });
      });

      const res = await request(app).get('/api/transactions');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toHaveLength(2);
      expect(transactionController.getTransactions).toHaveBeenCalled();
    });
  });

  describe('GET /api/transactions/:id', () => {
    it('应该返回单个交易', async () => {
      // 模拟控制器响应
      transactionController.getTransaction.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            _id: 'tx_1',
            hash: '0x123',
            blockchain: 'Ethereum',
            fromAddress: '0xabc',
            toAddress: '0xdef',
            amount: 1.5,
          },
        });
      });

      const res = await request(app).get('/api/transactions/tx_1');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('hash', '0x123');
      expect(transactionController.getTransaction).toHaveBeenCalled();
    });
  });

  describe('POST /api/transactions', () => {
    it('应该创建新交易', async () => {
      // 模拟控制器响应
      transactionController.createTransaction.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: {
            _id: 'tx_new',
            hash: '0x789',
            blockchain: 'Ethereum',
            fromAddress: '0xabc',
            toAddress: '0xdef',
            amount: 3.0,
          },
        });
      });

      const res = await request(app).post('/api/transactions').send({
        hash: '0x789',
        blockchain: 'Ethereum',
        fromAddress: '0xabc',
        toAddress: '0xdef',
        amount: 3.0,
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('hash', '0x789');
      expect(transactionController.createTransaction).toHaveBeenCalled();
    });
  });

  describe('PUT /api/transactions/:id', () => {
    it('应该更新交易', async () => {
      // 模拟控制器响应
      transactionController.updateTransaction.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            _id: 'tx_1',
            hash: '0x123',
            blockchain: 'Ethereum',
            fromAddress: '0xabc',
            toAddress: '0xdef',
            amount: 5.0, // 更新后的金额
          },
        });
      });

      const res = await request(app).put('/api/transactions/tx_1').send({
        amount: 5.0,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('amount', 5.0);
      expect(transactionController.updateTransaction).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    it('应该删除交易', async () => {
      // 模拟控制器响应
      transactionController.deleteTransaction.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {},
        });
      });

      const res = await request(app).delete('/api/transactions/tx_1');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(transactionController.deleteTransaction).toHaveBeenCalled();
    });
  });
});
