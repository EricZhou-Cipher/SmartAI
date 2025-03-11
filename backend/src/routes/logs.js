const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/logs
 * @desc    获取日志列表
 * @access  Private (Admin)
 */
router.get('/', authenticate, authorize(['admin']), logController.getLogs);

/**
 * @route   GET /api/logs/stats
 * @desc    获取日志统计数据
 * @access  Private (Admin)
 */
router.get('/stats', authenticate, authorize(['admin']), logController.getLogStats);

/**
 * @route   GET /api/logs/sources
 * @desc    获取日志来源列表
 * @access  Private (Admin)
 */
router.get('/sources', authenticate, authorize(['admin']), logController.getLogSources);

/**
 * @route   GET /api/logs/:id
 * @desc    获取日志详情
 * @access  Private (Admin)
 */
router.get('/:id', authenticate, authorize(['admin']), logController.getLogById);

/**
 * @route   DELETE /api/logs/:id
 * @desc    删除日志
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, authorize(['admin']), logController.deleteLog);

module.exports = router;
