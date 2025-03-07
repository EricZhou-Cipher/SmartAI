import { EventNormalizer } from '../../pipeline/eventNormalizer';
import { parseUnits } from 'ethers';

describe('EventNormalizer', () => {
  let normalizer: EventNormalizer;

  beforeEach(() => {
    normalizer = new EventNormalizer();
  });

  describe('transfer event normalization', () => {
    it('should normalize valid transfer event', async () => {
      const validEvent = {
        blockTimestamp: 1678901234,
        transactionHash: '0x123',
        from: '0xabcdef1234567890abcdef1234567890abcdef12',
        to: '0xdefabc1234567890defabc1234567890defabc12',
        value: parseUnits('1', 18).toString()
      };

      const normalized = await normalizer.normalizeEvent(1, validEvent);
      expect(normalized).toEqual({
        chainId: 1,
        txHash: '0x123',
        from: validEvent.from.toLowerCase(),
        to: validEvent.to.toLowerCase(),
        value: parseUnits('1', 18).toString(),
        timestamp: 1678901234,
        rawEvent: validEvent
      });
    });

    it('should handle zero value transfers', async () => {
      const zeroValueEvent = {
        blockTimestamp: 1678901234,
        transactionHash: '0x123',
        from: '0xabcdef1234567890abcdef1234567890abcdef12',
        to: '0xdefabc1234567890defabc1234567890defabc12',
        value: '0'
      };

      const normalized = await normalizer.normalizeEvent(1, zeroValueEvent);
      expect(normalized.value).toBe('0');
    });
  });

  describe('error handling', () => {
    it('should handle missing fields', async () => {
      const invalidEvent = {
        blockTimestamp: 1678901234,
        from: '0xabcdef1234567890abcdef1234567890abcdef12',
        value: parseUnits('1', 18).toString()
      };

      await expect(
        normalizer.normalizeEvent(1, invalidEvent)
      ).rejects.toThrow('Missing required fields');
    });

    it('should handle null event', async () => {
      await expect(
        normalizer.normalizeEvent(1, null)
      ).rejects.toThrow('Invalid event data');
    });

    it('should handle empty event', async () => {
      await expect(
        normalizer.normalizeEvent(1, {})
      ).rejects.toThrow('Missing required fields');
    });

    it('should handle invalid addresses', async () => {
      const invalidAddressEvent = {
        blockTimestamp: 1678901234,
        transactionHash: '0x123',
        from: 'invalid',
        to: '0xdefabc1234567890defabc1234567890defabc12',
        value: parseUnits('1', 18).toString()
      };

      await expect(
        normalizer.normalizeEvent(1, invalidAddressEvent)
      ).rejects.toThrow('Invalid address format');
    });

    it('should handle invalid value format', async () => {
      const invalidValueEvent = {
        blockTimestamp: 1678901234,
        transactionHash: '0x123',
        from: '0xabcdef1234567890abcdef1234567890abcdef12',
        to: '0xdefabc1234567890defabc1234567890defabc12',
        value: 'not a number'
      };

      await expect(
        normalizer.normalizeEvent(1, invalidValueEvent)
      ).rejects.toThrow('Invalid value format');
    });
  });
}); 