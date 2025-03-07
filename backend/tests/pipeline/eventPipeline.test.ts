import { EventPipeline } from '../../pipeline/eventPipeline';
import { EventNormalizer, NormalizedEvent } from '../../pipeline/eventNormalizer';
import { PipelineMonitor } from '../../pipeline/pipelineMonitor';
import { RiskAnalyzer } from '../../analyzer/riskAnalyzer';
import { NotificationRouter } from '../../notifier/notificationRouter';
import { defaultConfig } from '../../pipeline/pipelineConfig';
import { parseUnits } from 'ethers';

jest.mock('../../pipeline/eventNormalizer');
jest.mock('../../pipeline/pipelineMonitor');
jest.mock('../../analyzer/riskAnalyzer');
jest.mock('../../notifier/notificationRouter');

describe('EventPipeline', () => {
  let pipeline: EventPipeline;
  let normalizer: jest.Mocked<EventNormalizer>;
  let monitor: jest.Mocked<PipelineMonitor>;
  let analyzer: jest.Mocked<RiskAnalyzer>;
  let notifier: jest.Mocked<NotificationRouter>;

  beforeEach(() => {
    normalizer = new EventNormalizer() as jest.Mocked<EventNormalizer>;
    monitor = new PipelineMonitor(defaultConfig) as jest.Mocked<PipelineMonitor>;
    analyzer = new RiskAnalyzer() as jest.Mocked<RiskAnalyzer>;
    notifier = new NotificationRouter() as jest.Mocked<NotificationRouter>;

    // Mock analyzer and notifier methods
    analyzer.analyze = jest.fn().mockResolvedValue({
      score: 0.5,
      factors: ['test factor'],
      details: 'test details'
    });
    notifier.route = jest.fn().mockResolvedValue(undefined);

    pipeline = new EventPipeline(defaultConfig, normalizer, analyzer, notifier, monitor);
  });

  describe('processEvent', () => {
    const mockEvent = {
      blockTimestamp: 1678901234,
      transactionHash: '0x123',
      from: '0xabcdef1234567890abcdef1234567890abcdef12',
      to: '0xdefabc1234567890defabc1234567890defabc12',
      value: parseUnits('1', 18).toString()
    };

    it('should process valid event successfully', async () => {
      const normalizedEvent: NormalizedEvent = {
        chainId: 1,
        txHash: mockEvent.transactionHash,
        from: mockEvent.from.toLowerCase(),
        to: mockEvent.to.toLowerCase(),
        value: mockEvent.value,
        timestamp: mockEvent.blockTimestamp,
        rawEvent: mockEvent
      };

      normalizer.normalizeEvent.mockResolvedValue(normalizedEvent);

      await expect(pipeline.processEvent(mockEvent)).resolves.not.toThrow();

      expect(normalizer.normalizeEvent).toHaveBeenCalledWith(1, mockEvent);
      expect(monitor.recordEvent).toHaveBeenCalledWith('event_received');
      expect(monitor.recordEvent).toHaveBeenCalledWith('event_normalized');
      expect(analyzer.analyze).toHaveBeenCalled();
      expect(monitor.recordEvent).toHaveBeenCalledWith('risk_analyzed');
      expect(notifier.route).toHaveBeenCalled();
      expect(monitor.recordEvent).toHaveBeenCalledWith('notifications_sent');
    });

    it('should handle normalization errors', async () => {
      const error = new Error('Normalization failed');
      normalizer.normalizeEvent.mockRejectedValue(error);

      await expect(pipeline.processEvent(mockEvent)).rejects.toThrow('Normalization failed');
      expect(monitor.recordEvent).not.toHaveBeenCalled();
    });

    it('should handle invalid events', async () => {
      const error = new Error('Invalid event');
      normalizer.normalizeEvent.mockRejectedValue(error);

      await expect(pipeline.processEvent(null)).rejects.toThrow();
      await expect(pipeline.processEvent({})).rejects.toThrow();
      expect(monitor.recordEvent).not.toHaveBeenCalled();
    });
  });
}); 