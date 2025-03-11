import express from 'express';
import {
  getAddress,
  analyzeAddress,
  getAddressTransactions,
  addAddressTags,
} from '../controllers/address.controller.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    获取地址信息
// @route   GET /api/address/:address
// @access  Private
router.get('/:address', protect, getAddress);

// @desc    分析地址
// @route   POST /api/address/analyze
// @access  Private
router.post('/analyze', protect, analyzeAddress);

// @desc    获取地址交易历史
// @route   GET /api/address/:address/transactions
// @access  Private
router.get('/:address/transactions', protect, getAddressTransactions);

// @desc    添加地址标签
// @route   POST /api/address/:address/tags
// @access  Private/Admin
router.post('/:address/tags', protect, authorize('admin'), addAddressTags);

export default router;
