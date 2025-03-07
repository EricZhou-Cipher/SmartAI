import mongoose from "mongoose";

// 地址画像Schema
const AddressProfileSchema = new mongoose.Schema(
  {
    // 基础信息
    address: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
    },
    type: {
      type: String,
      enum: ["eoa", "contract", "unknown"],
      default: "unknown",
    },
    firstSeen: {
      type: Date,
      required: true,
    },
    lastSeen: {
      type: Date,
      required: true,
    },

    // 交互统计
    stats: {
      totalTxCount: { type: Number, default: 0 },
      uniqueAddressCount: { type: Number, default: 0 },
      contractInteractions: [
        {
          address: String,
          count: Number,
          lastInteraction: Date,
        },
      ],
      incomingTxCount: { type: Number, default: 0 },
      outgoingTxCount: { type: Number, default: 0 },
    },

    // 资金流动
    flows: {
      last24h: {
        inflow: { type: String, default: "0" }, // BigNumber字符串
        outflow: { type: String, default: "0" },
        netFlow: { type: String, default: "0" },
      },
      last7d: {
        inflow: { type: String, default: "0" },
        outflow: { type: String, default: "0" },
        netFlow: { type: String, default: "0" },
      },
      last30d: {
        inflow: { type: String, default: "0" },
        outflow: { type: String, default: "0" },
        netFlow: { type: String, default: "0" },
      },
    },

    // 风险特征
    riskFeatures: {
      // 蜜罐特征
      isHoneypot: { type: Boolean, default: false },
      honeypotConfidence: { type: Number, default: 0 },

      // 批量操作特征
      hasBatchOperations: { type: Boolean, default: false },
      batchTxCount: { type: Number, default: 0 },
      maxBatchSize: { type: Number, default: 0 },

      // 黑产关联
      blacklistAssociation: {
        score: { type: Number, default: 0 }, // 0-1
        relatedAddresses: [
          {
            address: String,
            txCount: Number,
            lastInteraction: Date,
          },
        ],
      },

      // 异常行为
      abnormalPatterns: [
        {
          type: String, // 异常类型
          confidence: Number, // 置信度
          lastSeen: Date,
          details: mongoose.Schema.Types.Mixed,
        },
      ],
    },

    // 风险评分(0-100)
    riskScore: {
      total: { type: Number, default: 0 },
      components: {
        flowScore: { type: Number, default: 0 },
        blacklistScore: { type: Number, default: 0 },
        behaviorScore: { type: Number, default: 0 },
        patternScore: { type: Number, default: 0 },
      },
    },

    // 元数据
    metadata: {
      version: { type: Number, default: 1 },
      lastUpdated: { type: Date, default: Date.now },
      updateCount: { type: Number, default: 0 },
      dataSource: { type: String, default: "chain" },
    },
  },
  {
    timestamps: true,
  }
);

// 索引
AddressProfileSchema.index({ "riskScore.total": -1 });
AddressProfileSchema.index({ "metadata.lastUpdated": -1 });
AddressProfileSchema.index({ "stats.totalTxCount": -1 });

// 虚拟字段:画像是否过期
AddressProfileSchema.virtual("isExpired").get(function () {
  const expiryTime = 24 * 60 * 60 * 1000; // 24小时
  return Date.now() - this.metadata.lastUpdated > expiryTime;
});

// 模型方法:更新画像
AddressProfileSchema.methods.updateProfile = function (updates) {
  Object.assign(this, updates);
  this.metadata.lastUpdated = new Date();
  this.metadata.updateCount += 1;
  return this.save();
};

const AddressProfile = mongoose.model("AddressProfile", AddressProfileSchema);

export default AddressProfile;
