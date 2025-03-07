import { EventNormalizer } from '../../src/pipeline/eventNormalizer';
import { NormalizedEvent } from '../../src/types/events';

describe('EventNormalizer', () => {
  let normalizer: EventNormalizer;

  beforeEach(() => {
    normalizer = new EventNormalizer();
  });

  describe('normalizeTransferEvent', () => {
    it('should normalize a transfer event correctly', () => {
      const rawEvent = {
        blockNumber: 123456,
        transactionHash: '0x123...',
        from: '0xabc...',
        to: '0xdef...',
        value: '1000000000000000000',
        tokenAddress: '0xtoken...',
      };

      const normalized = normalizer.normalizeTransferEvent(rawEvent);

      expect(normalized).toEqual({
        type: 'transfer',
        blockNumber: 123456,
        transactionHash: '0x123...',
        from: '0xabc...',
        to: '0xdef...',
        value: '1000000000000000000',
        tokenAddress: '0xtoken...',
        timestamp: expect.any(Number),
      });
    });
  });

  describe('normalizeContractCall', () => {
    it('should normalize a contract call event correctly', () => {
      const rawEvent = {
        blockNumber: 123456,
        transactionHash: '0x123...',
        from: '0xabc...',
        to: '0xdef...',
        methodName: 'transfer',
        methodSignature: 'transfer(address,uint256)',
        input: '0x...',
        output: '0x...',
      };

      const normalized = normalizer.normalizeContractCall(rawEvent);

      expect(normalized).toEqual({
        type: 'contract_call',
        blockNumber: 123456,
        transactionHash: '0x123...',
        from: '0xabc...',
        to: '0xdef...',
        methodName: 'transfer',
        methodSignature: 'transfer(address,uint256)',
        input: '0x...',
        output: '0x...',
        timestamp: expect.any(Number),
      });
    });
  });
}); 