/**
 * EventNormalizer Unit Tests
 * 
 * 测试目标：验证事件标准化逻辑的正确性
 * 覆盖范围：
 * 1. 基础事件标准化
 * 2. 地址格式验证
 * 3. 数值格式验证
 * 4. 合约调用解析
 * 5. 异常处理
 */

import { EventNormalizer, NormalizedEvent } from '../../../pipeline/eventNormalizer';
import { parseUnits } from 'ethers';
import { logger } from '../../../utils/logger';

jest.mock('../../../utils/logger');

describe('EventNormalizer', () => {
  let normalizer: EventNormalizer;

  beforeEach(() => {
    normalizer = new EventNormalizer();
    (logger.error as jest.Mock).mockClear();
  });

  describe('normalizeEvent', () => {
    it('should normalize transfer event correctly', async () => {
      const rawEvent = {
        blockNumber: 12345,
        blockTimestamp: Math.floor(Date.now() / 1000),
        transactionHash: '0x123',
        from: '0xabcdef1234567890abcdef1234567890abcdef12',
        to: '0xdefabc1234567890defabc1234567890defabc12',
        value: parseUnits('1', 18).toString(),
        nonce: 1,
        gasPrice: parseUnits('20', 9).toString(),
        gasLimit: '21000',
        input: '0x'
      };

      const result = await normalizer.normalizeEvent(1, rawEvent);

      expect(result).toMatchObject({
        chainId: 1,
        txHash: rawEvent.transactionHash,
        from: rawEvent.from.toLowerCase(),
        to: rawEvent.to.toLowerCase(),
        value: rawEvent.value,
        timestamp: rawEvent.blockTimestamp,
        rawEvent
      });
    });

    it('should normalize contract call event correctly', async () => {
      const rawEvent = {
        blockNumber: 12345,
        blockTimestamp: Math.floor(Date.now() / 1000),
        transactionHash: '0x123',
        from: '0xabcdef1234567890abcdef1234567890abcdef12',
        to: '0xdefabc1234567890defabc1234567890defabc12',
        value: '0',
        nonce: 1,
        gasPrice: parseUnits('20', 9).toString(),
        gasLimit: '150000',
        input: '0xa9059cbb000000000000000000000000defabc1234567890defabc1234567890defabc120000000000000000000000000000000000000000000000000de0b6b3a7640000'
      };

      const result = await normalizer.normalizeEvent(1, rawEvent);

      expect(result).toMatchObject({
        chainId: 1,
        txHash: rawEvent.transactionHash,
        from: rawEvent.from.toLowerCase(),
        to: rawEvent.to.toLowerCase(),
        value: rawEvent.value,
        timestamp: rawEvent.blockTimestamp,
        methodId: '0xa9059cbb',
        rawEvent
      });
    });

    it('should handle empty event', async () => {
      await expect(normalizer.normalizeEvent(1, null as any))
        .rejects.toThrow('Invalid event data');
      
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle missing required fields', async () => {
      const invalidEvent = {
        blockNumber: 12345,
        blockTimestamp: Math.floor(Date.now() / 1000),
        // missing transactionHash
        from: '0xabcdef1234567890abcdef1234567890abcdef12',
        value: '1000000000000000000'
      };

      await expect(normalizer.normalizeEvent(1, invalidEvent as any))
        .rejects.toThrow('Missing required fields');
      
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle invalid address format', async () => {
      const invalidEvent = {
        blockNumber: 12345,
        blockTimestamp: Math.floor(Date.now() / 1000),
        transactionHash: '0x123',
        from: 'invalid',
        to: '0xdefabc1234567890defabc1234567890defabc12',
        value: '1000000000000000000'
      };

      await expect(normalizer.normalizeEvent(1, invalidEvent))
        .rejects.toThrow('Invalid address format');
      
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle invalid value format', async () => {
      const invalidEvent = {
        blockNumber: 12345,
        blockTimestamp: Math.floor(Date.now() / 1000),
        transactionHash: '0x123',
        from: '0xabcdef1234567890abcdef1234567890abcdef12',
        to: '0xdefabc1234567890defabc1234567890defabc12',
        value: 'not a number'
      };

      await expect(normalizer.normalizeEvent(1, invalidEvent))
        .rejects.toThrow('Invalid value format');
      
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle extremely large values', async () => {
      const event = {
        blockNumber: 12345,
        blockTimestamp: Math.floor(Date.now() / 1000),
        transactionHash: '0x123',
        from: '0xabcdef1234567890abcdef1234567890abcdef12',
        to: '0xdefabc1234567890defabc1234567890defabc12',
        value: '115792089237316195423570985008687907853269984665640564039457584007913129639935', // max uint256
        nonce: 1,
        gasPrice: parseUnits('20', 9).toString(),
        gasLimit: '21000',
        input: '0x'
      };

      const result = await normalizer.normalizeEvent(1, event);
      expect(result.value).toBe(event.value);
    });

    it('should handle contract creation transaction', async () => {
      const event = {
        blockNumber: 12345,
        blockTimestamp: Math.floor(Date.now() / 1000),
        transactionHash: '0x123',
        from: '0xabcdef1234567890abcdef1234567890abcdef12',
        to: null, // contract creation
        value: '0',
        nonce: 1,
        gasPrice: parseUnits('20', 9).toString(),
        gasLimit: '1000000',
        input: '0x608060405234801561001057600080fd5b50610...' // contract bytecode
      };

      const result = await normalizer.normalizeEvent(1, event);
      expect(result.to).toBeNull();
      expect(result.isContractCreation).toBe(true);
    });

    it('should parse ERC20 transfer method correctly', async () => {
      const event = {
        blockNumber: 12345,
        blockTimestamp: Math.floor(Date.now() / 1000),
        transactionHash: '0x123',
        from: '0xabcdef1234567890abcdef1234567890abcdef12',
        to: '0xdefabc1234567890defabc1234567890defabc12', // token contract
        value: '0',
        nonce: 1,
        gasPrice: parseUnits('20', 9).toString(),
        gasLimit: '150000',
        input: '0xa9059cbb000000000000000000000000defabc1234567890defabc1234567890defabc120000000000000000000000000000000000000000000000000de0b6b3a7640000'
      };

      const result = await normalizer.normalizeEvent(1, event);
      expect(result.methodId).toBe('0xa9059cbb');
      expect(result.methodName).toBe('transfer');
      expect(result.parameters).toHaveLength(2);
    });

    it('should handle invalid method signature', async () => {
      const event = {
        blockNumber: 12345,
        blockTimestamp: Math.floor(Date.now() / 1000),
        transactionHash: '0x123',
        from: '0xabcdef1234567890abcdef1234567890abcdef12',
        to: '0xdefabc1234567890defabc1234567890defabc12',
        value: '0',
        nonce: 1,
        gasPrice: parseUnits('20', 9).toString(),
        gasLimit: '150000',
        input: '0xinvalid'
      };

      const result = await normalizer.normalizeEvent(1, event);
      expect(result.methodId).toBeUndefined();
      expect(result.methodName).toBeUndefined();
      expect(result.parameters).toBeUndefined();
    });
  });

  describe('validateAddress', () => {
    it('should validate correct addresses', () => {
      const address = '0xabcdef1234567890abcdef1234567890abcdef12';
      expect(() => normalizer['validateAddress'](address)).not.toThrow();
    });

    it('should reject invalid addresses', () => {
      const invalidAddresses = [
        'not an address',
        '0x123', // too short
        '0xGGGGGG1234567890abcdef1234567890abcdef12', // invalid chars
        null,
        undefined
      ];

      invalidAddresses.forEach(address => {
        expect(() => normalizer['validateAddress'](address as any))
          .toThrow('Invalid address format');
      });
    });
  });

  describe('validateValue', () => {
    it('should validate correct values', () => {
      const values = [
        '0',
        '1000000000000000000',
        parseUnits('1', 18).toString()
      ];

      values.forEach(value => {
        expect(() => normalizer['validateValue'](value)).not.toThrow();
      });
    });

    it('should reject invalid values', () => {
      const invalidValues = [
        'not a number',
        '-1000000000000000000',
        null,
        undefined
      ];

      invalidValues.forEach(value => {
        expect(() => normalizer['validateValue'](value as any))
          .toThrow('Invalid value format');
      });
    });
  });

  describe('parseMethodSignature', () => {
    it('should parse valid method signatures', () => {
      const input = '0xa9059cbb000000000000000000000000defabc1234567890defabc1234567890defabc120000000000000000000000000000000000000000000000000de0b6b3a7640000';
      const result = normalizer['parseMethodSignature'](input);

      expect(result).toMatchObject({
        methodId: '0xa9059cbb',
        methodName: 'transfer',
        parameters: expect.any(Array)
      });
    });

    it('should handle empty input', () => {
      const result = normalizer['parseMethodSignature']('0x');
      expect(result).toBeUndefined();
    });

    it('should handle invalid input', () => {
      const result = normalizer['parseMethodSignature']('invalid');
      expect(result).toBeUndefined();
    });
  });
}); 