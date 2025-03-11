import Address from '../models/Address.js';
import Transaction from '../models/Transaction.js';

// 模拟地址数据（用于演示，无 MongoDB 时使用）
const mockAddresses = [
  {
    _id: 'addr_1',
    address: '0x8b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
    blockchain: 'Ethereum',
    balance: 15.75,
    balanceUSD: 28875.25,
    transactionCount: 42,
    firstSeen: new Date('2022-03-15T08:30:00Z'),
    lastSeen: new Date('2023-06-15T10:30:00Z'),
    riskScore: 25,
    riskLevel: 'low',
    tags: ['defi', 'exchange'],
    category: 'wallet',
    metadata: { ens: 'alice.eth' },
    relatedAddresses: [
      {
        address: '0x5e9f8d7c6b5a4e3d2c1b0a9f8e7d6c5b4a3f2e1d',
        relationship: 'receiver',
        transactionCount: 12,
      },
    ],
  },
  {
    _id: 'addr_2',
    address: '0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1',
    blockchain: 'Ethereum',
    balance: 0.5,
    balanceUSD: 917.5,
    transactionCount: 15,
    firstSeen: new Date('2022-08-20T14:45:00Z'),
    lastSeen: new Date('2023-06-16T14:45:00Z'),
    riskScore: 65,
    riskLevel: 'medium',
    tags: ['defi'],
    category: 'contract',
    metadata: { contract: 'ERC20' },
    relatedAddresses: [
      {
        address: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0',
        relationship: 'contract',
        transactionCount: 15,
      },
    ],
  },
  {
    _id: 'addr_3',
    address: 'bc1q9h5yjfnmn984ct2hfgjkl3mxwrw9j8a7sdx9v',
    blockchain: 'Bitcoin',
    balance: 2.5,
    balanceUSD: 75000.0,
    transactionCount: 8,
    firstSeen: new Date('2022-12-10T09:15:00Z'),
    lastSeen: new Date('2023-06-17T09:15:00Z'),
    riskScore: 85,
    riskLevel: 'high',
    tags: ['mixer', 'suspicious'],
    category: 'other',
    metadata: { cluster: 'darknet_market' },
    relatedAddresses: [
      {
        address: 'bc1q8z7n6c5x4v3m2l1k0j9g8h7f6d5s4a3w2e1r',
        relationship: 'sender',
        transactionCount: 3,
      },
    ],
  },
];

// 检查 MongoDB 是否可用
const useRealDB = process.env.USE_REAL_DB === 'true';

// @desc    获取地址信息
// @route   GET /api/address/:address
// @access  Private
export const getAddress = async (req, res) => {
  try {
    const { blockchain = 'Ethereum' } = req.query;

    if (useRealDB) {
      // 查找地址
      let addressData = await Address.findOne({
        address: req.params.address,
        blockchain,
      });

      if (!addressData) {
        return res.status(404).json({
          success: false,
          message: '未找到地址信息',
        });
      }

      res.status(200).json({
        success: true,
        data: addressData,
      });
    } else {
      // 使用模拟数据
      const addressData = mockAddresses.find(
        (addr) => addr.address === req.params.address && addr.blockchain === blockchain
      );

      if (!addressData) {
        return res.status(404).json({
          success: false,
          message: '未找到地址信息',
        });
      }

      res.status(200).json({
        success: true,
        data: addressData,
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

// @desc    分析地址
// @route   POST /api/address/analyze
// @access  Private
export const analyzeAddress = async (req, res) => {
  try {
    const { address, blockchain = 'Ethereum' } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: '请提供地址',
      });
    }

    if (useRealDB) {
      // 检查地址是否已存在
      let addressData = await Address.findOne({ address, blockchain });

      // 如果地址不存在，创建新地址
      if (!addressData) {
        addressData = await Address.create({
          address,
          blockchain,
          user: req.user.id,
        });
      }

      // 模拟分析过程
      // 在实际应用中，这里应该调用区块链 API 或其他服务来获取地址信息
      const mockAnalysis = {
        balance: Math.random() * 100,
        balanceUSD: Math.random() * 10000,
        transactionCount: Math.floor(Math.random() * 1000),
        firstSeen: new Date(Date.now() - Math.random() * 31536000000), // 随机过去一年内的日期
        lastSeen: new Date(),
        riskScore: Math.floor(Math.random() * 100),
        tags: ['defi', 'exchange'],
        category: 'wallet',
      };

      // 根据风险分数设置风险等级
      if (mockAnalysis.riskScore > 70) {
        mockAnalysis.riskLevel = 'high';
      } else if (mockAnalysis.riskScore > 30) {
        mockAnalysis.riskLevel = 'medium';
      } else {
        mockAnalysis.riskLevel = 'low';
      }

      // 更新地址信息
      addressData = await Address.findOneAndUpdate({ address, blockchain }, mockAnalysis, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        success: true,
        data: addressData,
      });
    } else {
      // 使用模拟数据
      let addressData = mockAddresses.find(
        (addr) => addr.address === address && addr.blockchain === blockchain
      );

      // 如果地址不存在，创建新地址
      if (!addressData) {
        // 生成模拟分析数据
        const mockAnalysis = {
          _id: `addr_${mockAddresses.length + 1}`,
          address,
          blockchain,
          balance: Math.random() * 100,
          balanceUSD: Math.random() * 10000,
          transactionCount: Math.floor(Math.random() * 1000),
          firstSeen: new Date(Date.now() - Math.random() * 31536000000), // 随机过去一年内的日期
          lastSeen: new Date(),
          riskScore: Math.floor(Math.random() * 100),
          tags: ['defi', 'exchange'],
          category: 'wallet',
          metadata: {},
          relatedAddresses: [],
        };

        // 根据风险分数设置风险等级
        if (mockAnalysis.riskScore > 70) {
          mockAnalysis.riskLevel = 'high';
        } else if (mockAnalysis.riskScore > 30) {
          mockAnalysis.riskLevel = 'medium';
        } else {
          mockAnalysis.riskLevel = 'low';
        }

        mockAddresses.push(mockAnalysis);
        addressData = mockAnalysis;
      } else {
        // 更新现有地址的分析数据
        addressData.lastSeen = new Date();
        addressData.riskScore = Math.floor(Math.random() * 100);

        // 根据风险分数更新风险等级
        if (addressData.riskScore > 70) {
          addressData.riskLevel = 'high';
        } else if (addressData.riskScore > 30) {
          addressData.riskLevel = 'medium';
        } else {
          addressData.riskLevel = 'low';
        }
      }

      res.status(200).json({
        success: true,
        data: addressData,
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

// @desc    获取地址交易历史
// @route   GET /api/address/:address/transactions
// @access  Private
export const getAddressTransactions = async (req, res) => {
  try {
    const { blockchain = 'Ethereum', page = 1, limit = 10, sort = '-timestamp' } = req.query;

    const address = req.params.address;

    if (useRealDB) {
      // 构建查询条件
      const query = {
        $or: [{ fromAddress: address }, { toAddress: address }],
      };

      if (blockchain) {
        query.blockchain = blockchain;
      }

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
      // 从 mockTransactions 中筛选与该地址相关的交易
      const mockTransactions = [
        {
          _id: 'tx_1',
          hash: '0x7a2d8d9e5f3e1b2c8a7f6d4e3c2b1a9f8e7d6c5b',
          blockchain: 'Ethereum',
          fromAddress: '0x8b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
          toAddress: '0x5e9f8d7c6b5a4e3d2c1b0a9f8e7d6c5b4a3f2e1d',
          amount: 1.5,
          timestamp: new Date('2023-06-15T10:30:00Z'),
        },
        {
          _id: 'tx_2',
          hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
          blockchain: 'Ethereum',
          fromAddress: '0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1',
          toAddress: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0',
          amount: 0.75,
          timestamp: new Date('2023-06-16T14:45:00Z'),
        },
        {
          _id: 'tx_3',
          hash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
          blockchain: 'Bitcoin',
          fromAddress: 'bc1q9h5yjfnmn984ct2hfgjkl3mxwrw9j8a7sdx9v',
          toAddress: 'bc1q8z7n6c5x4v3m2l1k0j9g8h7f6d5s4a3w2e1r',
          amount: 0.05,
          timestamp: new Date('2023-06-17T09:15:00Z'),
        },
      ];

      let filteredTransactions = mockTransactions.filter(
        (tx) =>
          (tx.fromAddress === address || tx.toAddress === address) && tx.blockchain === blockchain
      );

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

// @desc    添加地址标签
// @route   POST /api/address/:address/tags
// @access  Private/Admin
export const addAddressTags = async (req, res) => {
  try {
    const { blockchain = 'Ethereum', tags } = req.body;

    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的标签数组',
      });
    }

    if (useRealDB) {
      // 查找地址
      let addressData = await Address.findOne({
        address: req.params.address,
        blockchain,
      });

      if (!addressData) {
        return res.status(404).json({
          success: false,
          message: '未找到地址信息',
        });
      }

      // 添加标签
      const updatedTags = [...new Set([...addressData.tags, ...tags])];

      // 更新地址
      addressData = await Address.findOneAndUpdate(
        { address: req.params.address, blockchain },
        { tags: updatedTags },
        { new: true }
      );

      res.status(200).json({
        success: true,
        data: addressData,
      });
    } else {
      // 使用模拟数据
      const addressIndex = mockAddresses.findIndex(
        (addr) => addr.address === req.params.address && addr.blockchain === blockchain
      );

      if (addressIndex === -1) {
        return res.status(404).json({
          success: false,
          message: '未找到地址信息',
        });
      }

      // 添加标签
      const existingTags = mockAddresses[addressIndex].tags || [];
      const updatedTags = [...new Set([...existingTags, ...tags])];

      // 更新地址
      mockAddresses[addressIndex].tags = updatedTags;

      res.status(200).json({
        success: true,
        data: mockAddresses[addressIndex],
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
