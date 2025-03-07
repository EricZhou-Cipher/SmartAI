/**
 * RiskAnalyzer Unit Tests
 * 
 * 测试目标：验证风险分析逻辑的正确性
 * 覆盖范围：
 * 1. 基础风险分析
 * 2. 画像分析
 * 3. 行为模式分析
 * 4. AI模型调用
 * 5. 异常处理
 */

import { RiskAnalyzer, RiskAnalysis } from '../../../analyzer/riskAnalyzer';
import { NormalizedEvent } from '../../../pipeline/eventNormalizer';
import { AddressProfile } from '../../../types/profile';
import { logger } from '../../../utils/logger';
import { parseUnits } from 'ethers';
import { riskWeights, riskLevels } from '../../../analyzer/riskRules';

jest.mock('../../../utils/logger');
jest.mock('../../../services/aiService');

describe('RiskAnalyzer', () => {
  let analyzer: RiskAnalyzer;
  let mockEvent: NormalizedEvent;
  let mockProfile: AddressProfile;

  beforeEach(() => {
    analyzer = new RiskAnalyzer();
    
    // 准备基础测试数据
    mockEvent = {
      chainId: 1,
      txHash: '0x123',
      from: '0xabcdef1234567890abcdef1234567890abcdef12',
      to: '0xdefabc1234567890defabc1234567890defabc12',
      value: parseUnits('1', 18).toString(),
      timestamp: Math.floor(Date.now() / 1000),
      method: 'transfer',
      rawEvent: {}
    };

    mockProfile = {
      address: mockEvent.from,
      type: 'normal',
      riskScore: 0.2,
      tags: ['active_trader'],
      firstSeen: mockEvent.timestamp - 365 * 86400,
      lastSeen: mockEvent.timestamp,
      totalTxCount: 1000,
      totalValue: parseUnits('1000', 18).toString(),
      stats: {
        totalTxCount: 1000,
        totalValue: parseUnits('1000', 18).toString(),
        lastActivity: mockEvent.timestamp
      },
      riskFeatures: {
        blacklistAssociation: {
          score: 0,
          relatedAddresses: []
        }
      }
    };

    (logger.error as jest.Mock).mockClear();
  });

  describe('analyze', () => {
    it('should analyze normal transaction correctly', async () => {
      const result = await analyzer.analyze(mockEvent, mockProfile);

      expect(result).toMatchObject({
        riskScore: expect.any(Number),
        riskLevel: expect.any(String),
        riskPoints: expect.any(Array),
        aiAnalysis: expect.any(Object),
        timestamp: expect.any(Number)
      });

      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
      expect(Object.keys(riskLevels)).toContain(result.riskLevel);
    });

    it('should detect high risk for blacklisted addresses', async () => {
      mockProfile.riskFeatures.blacklistAssociation.score = 0.9;
      mockProfile.riskFeatures.blacklistAssociation.relatedAddresses = ['0xblacklisted'];

      const result = await analyzer.analyze(mockEvent, mockProfile);

      expect(result.riskScore).toBeGreaterThanOrEqual(70);
      expect(result.riskPoints).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'BLACKLIST'
          })
        ])
      );
    });

    it('should detect risk for large transfers', async () => {
      mockEvent.value = parseUnits('1000', 18).toString(); // 1000 ETH

      const result = await analyzer.analyze(mockEvent, mockProfile);

      expect(result.riskScore).toBeGreaterThanOrEqual(50);
      expect(result.riskPoints).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'LARGE_TRANSFER'
          })
        ])
      );
    });

    it('should detect risk for frequent transfers', async () => {
      mockProfile.stats.totalTxCount = 10000; // 大量交易

      const result = await analyzer.analyze(mockEvent, mockProfile);

      expect(result.riskPoints).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'FREQUENT_TRANSFER'
          })
        ])
      );
    });

    it('should detect risk for contract interactions', async () => {
      mockEvent = {
        ...mockEvent,
        to: '0xcontract1234567890contract1234567890contract12',
        method: 'transfer',
        parameters: ['0x1234', '1000000000000000000']
      };

      const result = await analyzer.analyze(mockEvent, mockProfile);

      expect(result.riskPoints).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'CONTRACT_INTERACTION'
          })
        ])
      );
    });

    it('should detect risk for new accounts', async () => {
      mockProfile.firstSeen = Math.floor(Date.now() / 1000) - 3600; // 1 hour old

      const result = await analyzer.analyze(mockEvent, mockProfile);

      expect(result.riskPoints).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'NEW_ACCOUNT'
          })
        ])
      );
    });

    it('should handle invalid event data', async () => {
      const invalidEvent = {
        ...mockEvent,
        value: 'invalid'
      } as NormalizedEvent;

      await expect(analyzer.analyze(invalidEvent, mockProfile)).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });

    it('should respect risk weights from configuration', async () => {
      // 触发多个风险因素
      mockProfile.riskFeatures.blacklistAssociation.score = 0.9;
      mockEvent.value = parseUnits('1000', 18).toString();
      mockProfile.stats.totalTxCount = 10000;

      const result = await analyzer.analyze(mockEvent, mockProfile);

      // 验证总分计算是否考虑了权重
      const expectedMinScore = 
        riskWeights.FLOW.weight * 100 + // 流动性风险
        riskWeights.ASSOCIATION.weight * 100; // 关联风险

      expect(result.riskScore).toBeGreaterThanOrEqual(expectedMinScore);
    });
  });
}); 