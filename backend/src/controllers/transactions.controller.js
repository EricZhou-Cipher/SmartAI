import Transaction from '../models/Transaction.js';

// 模拟交易数据（用于演示，无 MongoDB 时使用）
const mockTransactions = [
  {
    _id: 'tx_1',
    hash: '0x7a2d8d9e5f3e1b2c8a7f6d4e3c2b1a9f8e7d6c5b',
    blockchain: 'Ethereum',
    fromAddress: '0x8b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
    toAddress: '0x5e9f8d7c6b5a4e3d2c1b0a9f8e7d6c5b4a3f2e1d',
    amount: 1.5,
    amountUSD: 2750.25,
    fee: 0.002,
    timestamp: new Date('2023-06-15T10:30:00Z'),
    blockNumber: 17500000,
    status: 'confirmed',
    riskScore: 25,
    riskLevel: 'low',
    tags: ['defi', 'swap'],
    metadata: { gasPrice: '20 gwei', gasLimit: 21000 },
  },
  {
    _id: 'tx_2',
    hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    blockchain: 'Ethereum',
    fromAddress: '0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1',
    toAddress: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0',
    amount: 0.75,
    amountUSD: 1375.12,
    fee: 0.001,
    timestamp: new Date('2023-06-16T14:45:00Z'),
    blockNumber: 17500100,
    status: 'confirmed',
    riskScore: 65,
    riskLevel: 'medium',
    tags: ['exchange', 'withdrawal'],
    metadata: { gasPrice: '25 gwei', gasLimit: 21000 },
  },
  {
    _id: 'tx_3',
    hash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
    blockchain: 'Bitcoin',
    fromAddress: 'bc1q9h5yjfnmn984ct2hfgjkl3mxwrw9j8a7sdx9v',
    toAddress: 'bc1q8z7n6c5x4v3m2l1k0j9g8h7f6d5s4a3w2e1r',
    amount: 0.05,
    amountUSD: 1500.0,
    fee: 0.0005,
    timestamp: new Date('2023-06-17T09:15:00Z'),
    blockNumber: 790000,
    status: 'confirmed',
    riskScore: 85,
    riskLevel: 'high',
    tags: ['mixer', 'suspicious'],
    metadata: { confirmations: 6 },
  },
];

// 检查 MongoDB 是否可用
const useRealDB = process.env.USE_REAL_DB === 'true';

// @desc    获取所有交易
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
  try {
    const {
      blockchain,
      riskLevel,
      fromAddress,
      toAddress,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sort = '-timestamp',
    } = req.query;

    // 构建查询条件
    const query = {};

    if (blockchain) {
      query.blockchain = blockchain;
    }

    if (riskLevel) {
      query.riskLevel = riskLevel;
    }

    if (fromAddress) {
      query.fromAddress = fromAddress;
    }

    if (toAddress) {
      query.toAddress = toAddress;
    }

    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.timestamp = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.timestamp = { $lte: new Date(endDate) };
    }

    if (useRealDB) {
      // 分页
      const skip = (page - 1) * limit;

      // 执行查询
      const transactions = await Transaction.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      // 获取总数
      const total = await Transaction.countDocuments(query);

      res.status(200).json({
        success: true,
        count: transactions.length,
        total,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
        data: transactions,
      });
    } else {
      // 使用模拟数据
      let filteredTransactions = [...mockTransactions];

      // 应用过滤条件
      if (blockchain) {
        filteredTransactions = filteredTransactions.filter((tx) => tx.blockchain === blockchain);
      }

      if (riskLevel) {
        filteredTransactions = filteredTransactions.filter((tx) => tx.riskLevel === riskLevel);
      }

      if (fromAddress) {
        filteredTransactions = filteredTransactions.filter((tx) => tx.fromAddress === fromAddress);
      }

      if (toAddress) {
        filteredTransactions = filteredTransactions.filter((tx) => tx.toAddress === toAddress);
      }

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        filteredTransactions = filteredTransactions.filter(
          (tx) => tx.timestamp >= start && tx.timestamp <= end
        );
      } else if (startDate) {
        const start = new Date(startDate);
        filteredTransactions = filteredTransactions.filter((tx) => tx.timestamp >= start);
      } else if (endDate) {
        const end = new Date(endDate);
        filteredTransactions = filteredTransactions.filter((tx) => tx.timestamp <= end);
      }

      // 排序
      if (sort === '-timestamp') {
        filteredTransactions.sort((a, b) => b.timestamp - a.timestamp);
      } else if (sort === 'timestamp') {
        filteredTransactions.sort((a, b) => a.timestamp - b.timestamp);
      }

      // 分页
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

      res.status(200).json({
        success: true,
        count: paginatedTransactions.length,
        total: filteredTransactions.length,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(filteredTransactions.length / parseInt(limit)),
        },
        data: paginatedTransactions,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message,
    });
  }
};

// @desc    获取单个交易
// @route   GET /api/transactions/:id
// @access  Private
export const getTransaction = async (req, res) => {
  try {
    if (useRealDB) {
      const transaction = await Transaction.findById(req.params.id);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: '未找到交易',
        });
      }

      res.status(200).json({
        success: true,
        data: transaction,
      });
    } else {
      // 使用模拟数据
      const transaction = mockTransactions.find((tx) => tx._id === req.params.id);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: '未找到交易',
        });
      }

      res.status(200).json({
        success: true,
        data: transaction,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message,
    });
  }
};

// @desc    创建交易
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res) => {
  try {
    // 添加用户ID到请求体
    req.body.user = req.user.id;

    if (useRealDB) {
      // 检查交易哈希是否已存在
      const existingTransaction = await Transaction.findOne({ hash: req.body.hash });

      if (existingTransaction) {
        return res.status(400).json({
          success: false,
          message: '交易哈希已存在',
        });
      }

      // 创建交易
      const transaction = await Transaction.create(req.body);

      res.status(201).json({
        success: true,
        data: transaction,
      });
    } else {
      // 使用模拟数据
      const { hash } = req.body;

      // 检查交易哈希是否已存在
      const existingTransaction = mockTransactions.find((tx) => tx.hash === hash);

      if (existingTransaction) {
        return res.status(400).json({
          success: false,
          message: '交易哈希已存在',
        });
      }

      // 创建新交易
      const newTransaction = {
        _id: `tx_${mockTransactions.length + 1}`,
        ...req.body,
        timestamp: req.body.timestamp || new Date(),
        status: req.body.status || 'confirmed',
        riskScore: req.body.riskScore || Math.floor(Math.random() * 100),
        riskLevel: req.body.riskLevel || 'low',
      };

      // 根据风险分数设置风险等级（如果未提供）
      if (!req.body.riskLevel) {
        if (newTransaction.riskScore > 70) {
          newTransaction.riskLevel = 'high';
        } else if (newTransaction.riskScore > 30) {
          newTransaction.riskLevel = 'medium';
        }
      }

      mockTransactions.push(newTransaction);

      res.status(201).json({
        success: true,
        data: newTransaction,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message,
    });
  }
};

// @desc    更新交易
// @route   PUT /api/transactions/:id
// @access  Private/Admin
export const updateTransaction = async (req, res) => {
  try {
    if (useRealDB) {
      let transaction = await Transaction.findById(req.params.id);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: '未找到交易',
        });
      }

      // 更新交易
      transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        success: true,
        data: transaction,
      });
    } else {
      // 使用模拟数据
      const transactionIndex = mockTransactions.findIndex((tx) => tx._id === req.params.id);

      if (transactionIndex === -1) {
        return res.status(404).json({
          success: false,
          message: '未找到交易',
        });
      }

      // 更新交易
      const updatedTransaction = {
        ...mockTransactions[transactionIndex],
        ...req.body,
      };

      mockTransactions[transactionIndex] = updatedTransaction;

      res.status(200).json({
        success: true,
        data: updatedTransaction,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message,
    });
  }
};

// @desc    删除交易
// @route   DELETE /api/transactions/:id
// @access  Private/Admin
export const deleteTransaction = async (req, res) => {
  try {
    if (useRealDB) {
      const transaction = await Transaction.findById(req.params.id);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: '未找到交易',
        });
      }

      await transaction.deleteOne();

      res.status(200).json({
        success: true,
        data: {},
      });
    } else {
      // 使用模拟数据
      const transactionIndex = mockTransactions.findIndex((tx) => tx._id === req.params.id);

      if (transactionIndex === -1) {
        return res.status(404).json({
          success: false,
          message: '未找到交易',
        });
      }

      // 删除交易
      mockTransactions.splice(transactionIndex, 1);

      res.status(200).json({
        success: true,
        data: {},
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message,
    });
  }
};
