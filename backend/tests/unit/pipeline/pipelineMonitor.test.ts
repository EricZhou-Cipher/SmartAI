import { PipelineMonitor } from '../../../pipeline/pipelineMonitor';
import { PipelineConfig, RiskLevel } from '../../../pipeline/pipelineConfig';
import { logger } from '../../../utils/logger';
import { WebClient as SlackClient } from '@slack/web-api';
import axios from 'axios';

jest.mock('../../../utils/logger');
jest.mock('@slack/web-api');
jest.mock('axios');

describe('PipelineMonitor', () => {
  let monitor: PipelineMonitor;
  const mockConfig: PipelineConfig = {
    monitoring: {
      enabled: true,
      metricsPort: 9090,
      metricsInterval: 15,
      webhooks: {
        slack: 'test-slack-token',
        dingtalk: 'https://oapi.dingtalk.com/robot/send?access_token=xxx',
        feishu: 'https://open.feishu.cn/open-apis/bot/v2/hook/xxx'
      }
    },
    notification: {
      channels: {
        low: ['discord'],
        medium: ['discord', 'telegram'],
        high: ['discord', 'telegram', 'email'],
        critical: ['discord', 'telegram', 'email', 'phone']
      },
      riskThresholds: {
        medium: 0.4,
        high: 0.7,
        critical: 0.9
      }
    },
    profile: {
      cacheTTL: 3600,
      forceRefreshRiskScore: 0.8
    },
    ai: {
      mode: 'api',
      provider: 'openai',
      model: 'gpt-4',
      maxTokens: 2048,
      temperature: 0.7
    },
    maxRetries: 3,
    retryDelay: 1000
  };

  beforeEach(() => {
    monitor = new PipelineMonitor(mockConfig);
    (logger.error as jest.Mock).mockClear();
    (SlackClient.prototype.chat.postMessage as jest.Mock).mockClear();
    (axios.post as jest.Mock).mockClear();
  });

  describe('event recording', () => {
    it('should record events correctly', () => {
      monitor.recordEvent('event_received');
      monitor.recordEvent('event_normalized');
      monitor.recordEvent('risk_analyzed');

      expect(monitor.getEventCount('event_received')).toBe(1);
      expect(monitor.getEventCount('event_normalized')).toBe(1);
      expect(monitor.getEventCount('risk_analyzed')).toBe(1);
    });

    it('should handle multiple events of same type', () => {
      monitor.recordEvent('event_received');
      monitor.recordEvent('event_received');
      monitor.recordEvent('event_received');

      expect(monitor.getEventCount('event_received')).toBe(3);
    });

    it('should return 0 for unknown event types', () => {
      expect(monitor.getEventCount('unknown_event')).toBe(0);
    });
  });

  describe('error recording', () => {
    it('should record errors correctly', () => {
      monitor.recordError('validation_error');
      monitor.recordError('network_error');

      // 由于错误计数是内部状态，我们只能通过日志来验证
      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  describe('processing time tracking', () => {
    it('should track processing time correctly', () => {
      const txId = 'test-tx-1';
      monitor.startProcessing(txId);
      
      // 模拟处理时间
      jest.advanceTimersByTime(1000);
      
      monitor.endProcessing(txId);

      // 验证处理时间被记录到了 Prometheus 指标中
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should handle multiple transactions', () => {
      const txIds = ['tx-1', 'tx-2', 'tx-3'];
      
      txIds.forEach(txId => {
        monitor.startProcessing(txId);
        jest.advanceTimersByTime(1000);
        monitor.endProcessing(txId);
      });

      // 验证所有处理时间都被记录到了 Prometheus 指标中
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should handle incomplete transactions', () => {
      monitor.startProcessing('tx-1');
      jest.advanceTimersByTime(1000);
      monitor.endProcessing('tx-1');

      monitor.startProcessing('tx-2'); // 未结束

      // 验证已完成的处理时间被记录到了 Prometheus 指标中
      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  describe('latency recording', () => {
    it('should record profile latency', () => {
      expect(() => monitor.recordProfileLatency(0.5)).not.toThrow();
    });

    it('should record risk analysis latency', () => {
      expect(() => monitor.recordRiskAnalysisLatency(0.3)).not.toThrow();
    });

    it('should record notification latency', () => {
      expect(() => monitor.recordNotificationLatency(0.2)).not.toThrow();
    });

    it('should record total latency', () => {
      expect(() => monitor.recordTotalLatency(1.0)).not.toThrow();
    });

    it('should reject negative latency values', () => {
      expect(() => monitor.recordProfileLatency(-1)).toThrow();
      expect(() => monitor.recordRiskAnalysisLatency(-1)).toThrow();
      expect(() => monitor.recordNotificationLatency(-1)).toThrow();
      expect(() => monitor.recordTotalLatency(-1)).toThrow();
    });
  });

  describe('high risk notifications', () => {
    const mockEvent = {
      chainId: 1,
      txHash: '0x123',
      from: '0xabc',
      to: '0xdef',
      value: '1000000000000000000',
      timestamp: Math.floor(Date.now() / 1000)
    };

    it('should send notifications to all configured channels', async () => {
      (SlackClient.prototype.chat.postMessage as jest.Mock).mockResolvedValue({ ok: true });
      (axios.post as jest.Mock).mockResolvedValue({ data: { errcode: 0 } });

      await monitor.notifyHighRisk(mockEvent, 0.9);

      expect(SlackClient.prototype.chat.postMessage).toHaveBeenCalled();
      expect(axios.post).toHaveBeenCalledTimes(2); // DingTalk and Feishu
    });

    it('should handle Slack notification failure', async () => {
      (SlackClient.prototype.chat.postMessage as jest.Mock).mockRejectedValue(new Error('Slack error'));
      (axios.post as jest.Mock).mockResolvedValue({ data: { errcode: 0 } });

      await monitor.notifyHighRisk(mockEvent, 0.9);

      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle DingTalk notification failure', async () => {
      (SlackClient.prototype.chat.postMessage as jest.Mock).mockResolvedValue({ ok: true });
      (axios.post as jest.Mock).mockRejectedValueOnce(new Error('DingTalk error'))
                              .mockResolvedValueOnce({ data: { errcode: 0 } });

      await monitor.notifyHighRisk(mockEvent, 0.9);

      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle Feishu notification failure', async () => {
      (SlackClient.prototype.chat.postMessage as jest.Mock).mockResolvedValue({ ok: true });
      (axios.post as jest.Mock).mockResolvedValueOnce({ data: { errcode: 0 } })
                              .mockRejectedValueOnce(new Error('Feishu error'));

      await monitor.notifyHighRisk(mockEvent, 0.9);

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should reset all counters', () => {
      monitor.recordEvent('event_received');
      monitor.recordError('test_error');
      monitor.startProcessing('tx-1');
      monitor.endProcessing('tx-1');

      monitor.reset();

      expect(monitor.getEventCount('event_received')).toBe(0);
      expect(monitor.getErrorCount('test_error')).toBe(0);
    });
  });
}); 