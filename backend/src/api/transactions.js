import express from 'express';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactions.controller.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// 获取所有交易 / 创建新交易
router.route('/').get(protect, getTransactions).post(protect, createTransaction);

// 获取单个交易 / 更新交易 / 删除交易
router
  .route('/:id')
  .get(protect, getTransaction)
  .put(protect, authorize('admin'), updateTransaction)
  .delete(protect, authorize('admin'), deleteTransaction);

export default router;
