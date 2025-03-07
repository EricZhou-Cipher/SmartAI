import { PipelineMonitor } from '../../pipeline/pipelineMonitor';
import { defaultConfig } from '../../pipeline/pipelineConfig';
import { RiskLevel } from '../../pipeline/pipelineConfig';
import { register } from 'prom-client';
import axios from 'axios';
import { WebClient as SlackClient } from '@slack/web-api';

jest.mock('@slack/web-api');
jest.mock('axios');

describe('PipelineMonitor', () => {
  let monitor: PipelineMonitor;
  let mockSlackPostMessage: jest.Mock;

  beforeEach(() => {
    register.clear(); // Clear Prometheus metrics
    mockSlackPostMessage = jest.fn().mockResolvedValue({ ok: true });
    
    (SlackClient as jest.Mock).mockImplementation(() => ({
      chat: {
        postMessage: mockSlackPostMessage
      }
    }));

    const configWithSlack = {
      ...defaultConfig,
      monitoring: {
        ...defaultConfig.monitoring,
        webhooks: {
          slack: 'test-token'
        }
      }
    };
    monitor = new PipelineMonitor(configWithSlack);
    jest.resetAllMocks();
  });

  describe('Metric Recording', () => {
    it('should record events', () => {
      expect(() => monitor.recordEvent('general')).not.toThrow();
    });

    it('should record profile latency', () => {
      expect(() => monitor.recordProfileLatency(0.5)).not.toThrow();
    });

    it('should throw error for negative latency', () => {
      expect(() => monitor.recordProfileLatency(-1)).toThrow('Latency cannot be negative');
    });

    it('should record risk analysis latency', () => {
      expect(() => monitor.recordRiskAnalysisLatency(1.2)).not.toThrow();
    });

    it('should record notification latency', () => {
      expect(() => monitor.recordNotificationLatency(0.3)).not.toThrow();
    });

    it('should record total latency', () => {
      expect(() => monitor.recordTotalLatency(2.5)).not.toThrow();
    });

    it('should record risk level', () => {
      expect(() => monitor.recordRiskLevel(RiskLevel.HIGH)).not.toThrow();
      expect(() => monitor.recordRiskLevel(RiskLevel.MEDIUM)).not.toThrow();
      expect(() => monitor.recordRiskLevel(RiskLevel.LOW)).not.toThrow();
    });
  });

  describe('High Risk Notifications', () => {
    const mockEvent = {
      chainId: 1,
      txHash: '0x123',
      from: '0xabc',
      to: '0xdef',
      timestamp: Math.floor(Date.now() / 1000)
    };

    it('should format alert message correctly', () => {
      const message = (monitor as any).formatAlertMessage(mockEvent, 0.85);
      expect(message).toContain('High Risk Event Detected');
      expect(message).toContain(mockEvent.txHash);
      expect(message).toContain(mockEvent.from);
      expect(message).toContain(mockEvent.to);
      expect(message).toContain('0.85');
    });

    it('should handle notification errors gracefully', async () => {
      mockSlackPostMessage.mockResolvedValueOnce({ ok: true });
      await expect(monitor.notifyHighRisk(mockEvent, 0.9)).resolves.not.toThrow();
      expect(mockSlackPostMessage).toHaveBeenCalled();
    });

    it('should handle notification failures gracefully', async () => {
      mockSlackPostMessage.mockRejectedValueOnce(new Error('API Error'));
      await expect(monitor.notifyHighRisk(mockEvent, 0.9)).resolves.not.toThrow();
    });
  });

  describe('metrics recording', () => {
    test('should record event counter', async () => {
      monitor.recordEvent('test');
      monitor.recordEvent('test');

      const metrics = await monitor.getMetrics();
      expect(metrics).toContain('pipeline_events_total');
    });

    test('should record latency histograms', async () => {
      monitor.recordProfileLatency(0.5);
      monitor.recordRiskAnalysisLatency(1.2);
      monitor.recordNotificationLatency(0.3);
      monitor.recordTotalLatency(2.0);

      const metrics = await monitor.getMetrics();
      expect(metrics).toContain('pipeline_processing_time_seconds_bucket');
    });

    test('should record risk levels', async () => {
      monitor.recordRiskLevel(RiskLevel.HIGH);
      monitor.recordRiskLevel(RiskLevel.MEDIUM);
      monitor.recordRiskLevel(RiskLevel.HIGH);

      const metrics = await monitor.getMetrics();
      expect(metrics).toContain('pipeline_risk_levels_total');
    });
  });

  describe('webhook notifications', () => {
    const mockEvent = {
      chainId: 1,
      txHash: '0x123',
      from: '0xabc',
      to: '0xdef',
      value: '1000000000000000000',
      timestamp: Math.floor(Date.now() / 1000)
    };

    beforeEach(() => {
      (SlackClient as jest.Mock).mockImplementation(() => ({
        chat: {
          postMessage: mockSlackPostMessage
        }
      }));
      (axios.post as jest.Mock).mockClear();
    });

    test('should send Slack notification', async () => {
      mockSlackPostMessage.mockResolvedValueOnce({ ok: true });
      await monitor.notifyHighRisk(mockEvent, 0.9);

      expect(mockSlackPostMessage).toHaveBeenCalledWith({
        channel: '#risk-alerts',
        text: expect.stringContaining('High Risk Event Detected')
      });
    });

    test('should send DingTalk notification', async () => {
      const customConfig = {
        ...defaultConfig,
        monitoring: {
          ...defaultConfig.monitoring,
          webhooks: {
            dingtalk: 'https://dingtalk-webhook.url'
          }
        }
      };
      
      const monitor = new PipelineMonitor(customConfig);
      await monitor.notifyHighRisk(mockEvent, 0.9);

      expect(axios.post).toHaveBeenCalledWith(
        'https://dingtalk-webhook.url',
        expect.objectContaining({
          msgtype: 'text',
          text: expect.objectContaining({
            content: expect.stringContaining('High Risk Event')
          })
        })
      );
    });

    test('should handle notification failures', async () => {
      mockSlackPostMessage.mockRejectedValueOnce(new Error('Failed'));
      await expect(monitor.notifyHighRisk(mockEvent, 0.9))
        .resolves.not.toThrow();
    });
  });

  describe('error handling', () => {
    test('should handle invalid metric values', () => {
      expect(() => monitor.recordProfileLatency(-1)).toThrow();
      expect(() => monitor.recordTotalLatency(NaN)).toThrow();
    });

    test('should handle missing webhook configs', async () => {
      const minimalConfig = {
        ...defaultConfig,
        monitoring: {
          ...defaultConfig.monitoring,
          webhooks: {}
        }
      };
      
      const monitor = new PipelineMonitor(minimalConfig);
      const mockEvent = {
        chainId: 1,
        txHash: '0x123',
        from: '0xabc',
        to: '0xdef',
        value: '1000000000000000000',
        timestamp: Math.floor(Date.now() / 1000)
      };
      await expect(monitor.notifyHighRisk(mockEvent, 0.9))
        .resolves.not.toThrow();
    });
  });

  it('should record and retrieve metrics correctly', () => {
    // Record some events
    monitor.recordEvent('transfer');
    monitor.recordEvent('contract_call');
    monitor.recordEvent('transfer');

    // Verify event counts
    expect(monitor.getEventCount('transfer')).toBe(2);
    expect(monitor.getEventCount('contract_call')).toBe(1);
  });

  it('should track processing time', async () => {
    monitor.startProcessing('tx1');
    await new Promise(resolve => setTimeout(resolve, 10)); // Wait 10ms
    monitor.endProcessing('tx1');
    const processingTime = monitor.getProcessingTime('tx1');
    
    expect(processingTime).toBeGreaterThan(0);
    expect(processingTime).toBeLessThan(1000); // Should be less than 1 second
  });

  it('should track error counts', () => {
    monitor.recordError('validation_error');
    monitor.recordError('api_error');
    monitor.recordError('validation_error');

    expect(monitor.getErrorCount('validation_error')).toBe(2);
    expect(monitor.getErrorCount('api_error')).toBe(1);
  });

  it('should track risk levels', () => {
    monitor.recordRiskLevel(RiskLevel.HIGH);
    monitor.recordRiskLevel(RiskLevel.MEDIUM);
    monitor.recordRiskLevel(RiskLevel.HIGH);

    const riskCounts = monitor.getRiskLevelCounts();
    expect(riskCounts[RiskLevel.HIGH]).toBe(2);
    expect(riskCounts[RiskLevel.MEDIUM]).toBe(1);
    expect(riskCounts[RiskLevel.LOW]).toBe(0);
  });

  it('should calculate average processing time', async () => {
    monitor.startProcessing('tx1');
    await new Promise(resolve => setTimeout(resolve, 10)); // Wait 10ms
    monitor.endProcessing('tx1');

    monitor.startProcessing('tx2');
    await new Promise(resolve => setTimeout(resolve, 20)); // Wait 20ms
    monitor.endProcessing('tx2');

    const avgTime = monitor.getAverageProcessingTime();
    expect(avgTime).toBeGreaterThan(0);
  });

  it('should reset metrics correctly', () => {
    monitor.recordEvent('transfer');
    monitor.recordError('validation_error');
    monitor.recordRiskLevel(RiskLevel.HIGH);

    monitor.reset();

    expect(monitor.getEventCount('transfer')).toBe(0);
    expect(monitor.getErrorCount('validation_error')).toBe(0);
    expect(monitor.getRiskLevelCounts()[RiskLevel.HIGH]).toBe(0);
  });

  it('should expose Prometheus metrics', async () => {
    monitor.recordEvent('transfer');
    monitor.recordError('validation_error');
    monitor.recordRiskLevel(RiskLevel.HIGH);

    const metrics = await monitor.getMetrics();
    expect(metrics).toContain('pipeline_events_total');
    expect(metrics).toContain('pipeline_errors_total');
    expect(metrics).toContain('pipeline_risk_levels_total');
    expect(metrics).toContain('pipeline_processing_time_seconds');
  });
}); 