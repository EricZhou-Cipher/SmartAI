import { Redis } from 'ioredis';
import { AddressProfiler } from '../../../profiling/addressProfiler';
import { Logger } from '../../../utils/logger';
import { ProfilerConfig } from '../../../types/config';
import { AddressProfile } from '../../../types/profile';

jest.mock('ioredis');
jest.mock('../../../utils/logger');

describe('AddressProfiler', () => {
  let profiler: AddressProfiler;
  let mockRedis: jest.Mocked<Redis>;
  let mockLogger: jest.Mocked<Logger>;
  let config: ProfilerConfig;

  const mockProfile: AddressProfile = {
    address: '0x123',
    riskScore: 75,
    lastUpdated: '2024-03-20T10:00:00Z',
    tags: ['exchange'],
    category: 'exchange',
    transactionCount: 1000,
    totalValue: '1000000',
    firstSeen: '2024-01-01T00:00:00Z',
    lastSeen: '2024-03-20T10:00:00Z',
    relatedAddresses: ['0x456', '0x789']
  };

  beforeEach(() => {
    mockRedis = new Redis() as jest.Mocked<Redis>;
    mockLogger = new Logger({
      level: 'info',
      format: 'json',
      timestampFormat: 'YYYY-MM-DD'
    }) as jest.Mocked<Logger>;

    config = {
      cacheTTL: 3600,
      fetchTimeout: 15000,
      fetchRetries: 3,
      minRetryDelay: 1000,
      maxRetryDelay: 5000,
      batchSize: 10
    };

    profiler = new AddressProfiler(mockRedis, mockLogger, config);

    // 清除所有mock
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('应该从缓存返回画像', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(mockProfile));

      const result = await profiler.getProfile('0x123', 'trace-123');

      expect(result).toEqual(mockProfile);
      expect(mockRedis.get).toHaveBeenCalledWith('profile:0x123');
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Cache hit for address 0x123',
        'trace-123'
      );
    });

    it('应该在缓存未命中时从API获取画像', async () => {
      mockRedis.get.mockResolvedValue(null);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockProfile)
      });

      const result = await profiler.getProfile('0x123', 'trace-123');

      expect(result).toEqual(mockProfile);
      expect(mockRedis.get).toHaveBeenCalledWith('profile:0x123');
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'profile:0x123',
        config.cacheTTL,
        JSON.stringify(mockProfile)
      );
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Cache miss for address 0x123',
        'trace-123'
      );
    });

    it('应该在API失败时重试', async () => {
      mockRedis.get.mockResolvedValue(null);
      const failedResponse = { ok: false, statusText: 'Internal Server Error' };
      const successResponse = {
        ok: true,
        json: () => Promise.resolve(mockProfile)
      };

      global.fetch = jest.fn()
        .mockResolvedValueOnce(failedResponse)
        .mockResolvedValueOnce(failedResponse)
        .mockResolvedValueOnce(successResponse);

      const result = await profiler.getProfile('0x123', 'trace-123');

      expect(result).toEqual(mockProfile);
      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(mockLogger.warn).toHaveBeenCalledTimes(2);
    });
  });

  describe('batchGetProfiles', () => {
    it('应该批量获取画像', async () => {
      const addresses = ['0x123', '0x456', '0x789'];
      mockRedis.get.mockResolvedValue(null);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockProfile)
      });

      const results = await profiler.batchGetProfiles(addresses, 'trace-123');

      expect(results.size).toBe(3);
      expect(mockRedis.get).toHaveBeenCalledTimes(3);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('应该处理批量获取中的错误', async () => {
      const addresses = ['0x123', '0x456'];
      mockRedis.get.mockResolvedValue(null);
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProfile)
        })
        .mockRejectedValueOnce(new Error('API Error'));

      const results = await profiler.batchGetProfiles(addresses, 'trace-123');

      expect(results.size).toBe(1);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to fetch profile for 0x456',
        'trace-123',
        { error: 'API Error' }
      );
    });
  });
}); 