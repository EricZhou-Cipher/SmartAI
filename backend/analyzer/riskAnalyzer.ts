import { RiskAnalysis, RiskLevel, NormalizedEvent } from '../types/events';
import { EnhancedRiskAnalysis } from '../types/riskAnalysis';
import { AddressProfile } from '../types/profile';

export const riskAnalyzer = {
  async analyze(event: NormalizedEvent, profile: AddressProfile): Promise<EnhancedRiskAnalysis> {
    // 基础风险评分
    let score = profile.riskScore;
    const factors: string[] = [];
    const features: Array<{ description: string; score: number }> = [];

    // 分析交易金额
    if (event.value) {
      const value = parseFloat(event.value);
      if (value > 1000) {
        score += 0.2;
        factors.push('大额交易');
        features.push({
          description: '交易金额超过1000',
          score: 0.2
        });
      }
    }

    // 分析合约调用
    if (event.type === 'contract_call') {
      score += 0.3;
      factors.push('合约调用');
      features.push({
        description: '涉及合约调用',
        score: 0.3
      });
    }

    // 确定风险等级
    const level = score >= 0.9 ? RiskLevel.CRITICAL :
      score >= 0.7 ? RiskLevel.HIGH :
        score >= 0.4 ? RiskLevel.MEDIUM : RiskLevel.LOW;

    // 确定处理动作
    const action = score >= 0.9 ? 'block' :
      score >= 0.7 ? 'alert' :
        score >= 0.4 ? 'monitor' : 'none';

    return {
      score,
      level,
      factors,
      features,
      aiAnalysis: {
        behaviorAnalysis: {
          pattern: 'normal',
          confidence: 0.8,
          details: {}
        },
        graphAnalysis: {
          centrality: 0.5,
          degree: 2,
          clustering: 0.3,
          paths: []
        },
        summary: `地址 ${event.from} 的风险评分为 ${score}，风险等级为 ${level}`
      },
      combinations: [{
        factors,
        score,
        description: `基于 ${factors.join('、')} 的综合分析`
      }],
      timestamp: Date.now(),
      action
    };
  }
}; 