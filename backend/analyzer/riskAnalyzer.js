import { Counter, Histogram } from "prom-client";
import { ethers } from "ethers";
import logger from "../config/logger.js";
import {
  riskWeights,
  riskThresholds,
  riskTags,
  combinationRules,
  aiConfig,
  riskLevels,
} from "./riskRules.js";

// Prometheus指标
const analysisCounter = new Counter({
  name: "risk_analysis_total_count",
  help: "风险分析总次数",
});

const analysisTimeHistogram = new Histogram({
  name: "risk_analysis_duration_seconds",
  help: "风险分析耗时分布",
});

const riskScoreHistogram = new Histogram({
  name: "risk_score_distribution",
  help: "风险评分分布",
  buckets: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
});

const riskPointCounter = new Counter({
  name: "risk_point_occurrence_count",
  help: "风险点触发次数",
  labelNames: ["risk_point"],
});

class RiskAnalyzer {
  constructor() {
    // 加载AI模型
    this.loadAIModels();
  }

  // 加载AI模型
  async loadAIModels() {
    try {
      // TODO: 实现AI模型加载逻辑
      // this.textSummarizer = await loadModel(aiConfig.textSummarizer.modelPath);
      // this.behaviorModel = await loadModel(aiConfig.behaviorSequence.modelPath);
      // this.graphModel = await loadModel(aiConfig.transactionGraph.modelPath);
      logger.info("AI模型加载成功");
    } catch (error) {
      logger.error("AI模型加载失败:", error);
      throw error;
    }
  }

  // 分析入口
  async analyze(event, profile, historicalEvents = []) {
    const startTime = Date.now();
    analysisCounter.inc();

    try {
      logger.info("开始风险分析", {
        txHash: event.txHash,
        address: event.from,
      });

      // 1. 规则引擎分析
      const ruleResults = await this._analyzeByRules(event, profile);

      // 2. AI模型分析
      const aiResults = await this._analyzeByAI(
        event,
        profile,
        historicalEvents
      );

      // 3. 合并分析结果
      const analysisResult = this._mergeResults(ruleResults, aiResults);

      // 4. 生成风险报告
      const report = this._generateReport(analysisResult);

      // 记录耗时
      const duration = (Date.now() - startTime) / 1000;
      analysisTimeHistogram.observe(duration);
      riskScoreHistogram.observe(report.riskScore);

      logger.info("风险分析完成", {
        txHash: event.txHash,
        riskScore: report.riskScore,
        riskLevel: report.riskLevel,
        duration: `${duration}s`,
      });

      return report;
    } catch (error) {
      logger.error("风险分析失败:", error);
      throw error;
    }
  }

  // 规则引擎分析
  async _analyzeByRules(event, profile) {
    const results = {
      flow: await this._analyzeFlowRisk(event, profile),
      behavior: await this._analyzeBehaviorRisk(event, profile),
      association: await this._analyzeAssociationRisk(event, profile),
      historical: await this._analyzeHistoricalRisk(profile),
    };

    // 检查组合规则
    const combinationResults = this._checkCombinationRules(results);

    return {
      ...results,
      combinations: combinationResults,
    };
  }

  // 分析资金流动风险
  async _analyzeFlowRisk(event, profile) {
    const risks = [];
    const weights = riskWeights.FLOW;

    // 检查大额转账
    const threshold = riskThresholds.largeTransferThresholds[event.chainId];
    if (
      threshold &&
      ethers.BigNumber.from(event.value).gte(ethers.utils.parseEther(threshold))
    ) {
      risks.push({
        type: "LARGE_TRANSFER",
        weight: weights.factors.LARGE_TRANSFER,
        details: {
          value: event.value,
          threshold: threshold,
        },
      });
      riskPointCounter.inc({ risk_point: "LARGE_TRANSFER" });
    }

    // 检查频繁转账
    const recentTxs = profile.stats.totalTxCount;
    if (recentTxs > riskThresholds.frequentTransferThresholds.txCount) {
      risks.push({
        type: "FREQUENT_TRANSFER",
        weight: weights.factors.FREQUENT_TRANSFER,
        details: {
          count: recentTxs,
          threshold: riskThresholds.frequentTransferThresholds.txCount,
        },
      });
      riskPointCounter.inc({ risk_point: "FREQUENT_TRANSFER" });
    }

    return {
      risks,
      score: this._calculateDimensionScore(risks, weights),
    };
  }

  // 分析行为风险
  async _analyzeBehaviorRisk(event, profile) {
    const risks = [];
    const weights = riskWeights.BEHAVIOR;

    // 检查合约交互
    if (event.method) {
      risks.push({
        type: "CONTRACT_INTERACTION",
        weight: weights.factors.CONTRACT_INTERACTION,
        details: {
          contract: event.to,
          method: event.method,
        },
      });
      riskPointCounter.inc({ risk_point: "CONTRACT_INTERACTION" });
    }

    // 检查批量操作
    if (event.batchOperation) {
      risks.push({
        type: "BATCH_OPERATION",
        weight: weights.factors.BATCH_OPERATION,
        details: {
          operationCount: event.batchOperation.length,
        },
      });
      riskPointCounter.inc({ risk_point: "BATCH_OPERATION" });
    }

    return {
      risks,
      score: this._calculateDimensionScore(risks, weights),
    };
  }

  // 分析关联风险
  async _analyzeAssociationRisk(event, profile) {
    const risks = [];
    const weights = riskWeights.ASSOCIATION;

    // 检查黑名单关联
    if (profile.riskFeatures.blacklistAssociation.score > 0) {
      risks.push({
        type: "BLACKLIST",
        weight: weights.factors.BLACKLIST,
        details: {
          score: profile.riskFeatures.blacklistAssociation.score,
          relatedAddresses:
            profile.riskFeatures.blacklistAssociation.relatedAddresses,
        },
      });
      riskPointCounter.inc({ risk_point: "BLACKLIST" });
    }

    return {
      risks,
      score: this._calculateDimensionScore(risks, weights),
    };
  }

  // 分析历史风险
  async _analyzeHistoricalRisk(profile) {
    const risks = [];
    const weights = riskWeights.HISTORICAL;

    // 检查账户年龄
    const accountAge = Date.now() - profile.firstSeen;
    if (accountAge < 24 * 60 * 60 * 1000) {
      // 24小时内
      risks.push({
        type: "NEW_ACCOUNT",
        weight: weights.factors.ACCOUNT_AGE,
        details: {
          age: accountAge,
        },
      });
      riskPointCounter.inc({ risk_point: "NEW_ACCOUNT" });
    }

    return {
      risks,
      score: this._calculateDimensionScore(risks, weights),
    };
  }

  // 检查组合规则
  _checkCombinationRules(results) {
    const triggeredRules = [];
    const allRisks = [
      ...results.flow.risks,
      ...results.behavior.risks,
      ...results.association.risks,
      ...results.historical.risks,
    ];

    // 检查每个组合规则
    for (const rule of combinationRules) {
      const matched = rule.conditions.every((condition) => {
        const count = allRisks.filter(
          (risk) => risk.type === condition.tag
        ).length;
        return count >= condition.count;
      });

      if (matched) {
        triggeredRules.push({
          name: rule.name,
          weight: rule.weight,
        });
        riskPointCounter.inc({ risk_point: rule.name });
      }
    }

    return triggeredRules;
  }

  // AI模型分析
  async _analyzeByAI(event, profile, historicalEvents) {
    // 1. 行为序列分析
    const behaviorAnalysis = await this._analyzeBehaviorSequence(
      profile,
      historicalEvents
    );

    // 2. 交易图谱分析
    const graphAnalysis = await this._analyzeTransactionGraph(
      event,
      historicalEvents
    );

    // 3. 生成风险描述
    const riskSummary = await this._generateRiskSummary(
      event,
      profile,
      behaviorAnalysis,
      graphAnalysis
    );

    return {
      behaviorAnalysis,
      graphAnalysis,
      summary: riskSummary,
    };
  }

  // 分析行为序列
  async _analyzeBehaviorSequence(profile, historicalEvents) {
    // TODO: 实现行为序列分析
    return {
      anomalyScore: 0,
      patterns: [],
    };
  }

  // 分析交易图谱
  async _analyzeTransactionGraph(event, historicalEvents) {
    // TODO: 实现交易图谱分析
    return {
      communityScore: 0,
      flowPatterns: [],
    };
  }

  // 生成风险描述
  async _generateRiskSummary(event, profile, behaviorAnalysis, graphAnalysis) {
    // TODO: 实现风险描述生成
    return "风险分析摘要";
  }

  // 合并分析结果
  _mergeResults(ruleResults, aiResults) {
    return {
      ruleResults,
      aiResults,
      timestamp: Date.now(),
    };
  }

  // 计算维度得分
  _calculateDimensionScore(risks, weights) {
    if (risks.length === 0) return 0;

    const totalScore = risks.reduce((sum, risk) => {
      return sum + risk.weight;
    }, 0);

    return Math.min(100, totalScore * 100);
  }

  // 生成风险报告
  _generateReport(analysisResult) {
    // 1. 计算总分
    const ruleResults = analysisResult.ruleResults;
    let totalScore = 0;

    // 基础维度得分
    totalScore += ruleResults.flow.score * riskWeights.FLOW.weight;
    totalScore += ruleResults.behavior.score * riskWeights.BEHAVIOR.weight;
    totalScore +=
      ruleResults.association.score * riskWeights.ASSOCIATION.weight;
    totalScore += ruleResults.historical.score * riskWeights.HISTORICAL.weight;

    // 组合规则加权
    if (ruleResults.combinations.length > 0) {
      const maxWeight = Math.max(
        ...ruleResults.combinations.map((rule) => rule.weight)
      );
      totalScore *= maxWeight;
    }

    // 确保分数在0-100之间
    totalScore = Math.min(100, Math.max(0, totalScore));

    // 2. 确定风险等级
    let riskLevel = "LOW";
    for (const [level, config] of Object.entries(riskLevels)) {
      if (totalScore >= config.minScore) {
        riskLevel = level;
      }
    }

    // 3. 收集风险点
    const riskPoints = [
      ...ruleResults.flow.risks,
      ...ruleResults.behavior.risks,
      ...ruleResults.association.risks,
      ...ruleResults.historical.risks,
    ].map((risk) => ({
      type: risk.type,
      description: riskTags[risk.type] || risk.type,
      details: risk.details,
    }));

    // 4. 生成报告
    return {
      riskScore: totalScore,
      riskLevel,
      riskPoints,
      aiAnalysis: {
        behaviorAnalysis: analysisResult.aiResults.behaviorAnalysis,
        graphAnalysis: analysisResult.aiResults.graphAnalysis,
        summary: analysisResult.aiResults.summary,
      },
      combinations: ruleResults.combinations,
      timestamp: analysisResult.timestamp,
      action: riskLevels[riskLevel].action,
    };
  }
}

// 导出单例
export const riskAnalyzer = new RiskAnalyzer();
