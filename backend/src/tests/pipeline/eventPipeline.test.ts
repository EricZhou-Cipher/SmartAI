import { EventPipeline } from '../../pipeline/eventPipeline';
import { EventNormalizer } from '../../pipeline/eventNormalizer';
import { NormalizedEvent } from '../../types/events';
import { PipelineMonitor } from '../../pipeline/pipelineMonitor';
import { riskAnalyzer } from '../../analyzer/riskAnalyzer';
import { NotificationRouter } from '../../notifier/notificationRouter';
import { defaultConfig } from '../../pipeline/pipelineConfig';
import { parseUnits } from 'ethers';
import { EventType } from '../../types/events';
import { addressProfiler } from '../../profiling/addressProfiler';

// 设置测试环境
process.env.NODE_ENV = 'test';

jest.mock('../../pipeline/eventNormalizer');
jest.mock('../../pipeline/pipelineMonitor');
jest.mock('../../analyzer/riskAnalyzer');
jest.mock('../../notifier/notificationRouter');
jest.mock('../../profiling/addressProfiler');

describe('EventPipeline', () => {
  let pipeline: EventPipeline;
  let normalizer: jest.Mocked<EventNormalizer>;
  let monitor: jest.Mocked<PipelineMonitor>;
  let analyzer: typeof riskAnalyzer;
  let notifier: jest.Mocked<NotificationRouter>;

  beforeEach(() => {
    normalizer = new EventNormalizer({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any) as jest.Mocked<EventNormalizer>;
    monitor = new PipelineMonitor(defaultConfig, {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any) as jest.Mocked<PipelineMonitor>;
    analyzer = riskAnalyzer;
    notifier = new NotificationRouter() as jest.Mocked<NotificationRouter>;

    // Mock analyzer and notifier methods
    analyzer.analyze = jest.fn().mockResolvedValue({
      score: 0.5,
      level: 'medium',
      factors: ['test factor'],
      features: [],
    });
    notifier.route = jest.fn().mockResolvedValue(undefined);

    // Mock addressProfiler
    addressProfiler.getProfile = jest.fn().mockResolvedValue({
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      category: 'normal',
      riskScore: 0.1,
      tags: [],
      transactions: 10,
      firstSeen: new Date(),
      lastSeen: new Date(),
    });

    // Mock monitor methods
    monitor.recordEvent = jest.fn();
    monitor.recordRiskLevel = jest.fn();
    monitor.recordProfileLatency = jest.fn();
    monitor.recordRiskAnalysisLatency = jest.fn();
    monitor.recordNotificationLatency = jest.fn();

    // Mock normalizer methods
    normalizer.normalizeEvent = jest.fn();

    // Create pipeline with mock logger
    const mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      setTraceId: jest.fn(),
      getTraceId: jest.fn().mockReturnValue('test-trace-id'),
      setDefaultContext: jest.fn(),
    };

    pipeline = new EventPipeline(defaultConfig, mockLogger as any);
  });

  describe('processEvent', () => {
    const mockEvent = {
      blockTimestamp: 1678901234,
      transactionHash: '0x123',
      from: '0xabcdef1234567890abcdef1234567890abcdef12',
      to: '0xdefabc1234567890defabc1234567890defabc12',
      value: parseUnits('1', 18).toString(),
    };

    it('should process valid event successfully', async () => {
      // 简化测试，只测试基本功能
      await expect(pipeline.processEvent({ ...mockEvent, chainId: 1 })).resolves.not.toThrow();
    });

    it('should handle invalid events', async () => {
      await expect(pipeline.processEvent(null)).rejects.toThrow();
    });
  });
});
