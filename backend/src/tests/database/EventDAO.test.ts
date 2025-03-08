/**
 * @file EventDAO单元测试
 * @description 测试EventDAO的所有核心方法，包括数据库操作与缓存逻辑
 */

import { EventDAO } from '@/database/dao/EventDAO';
import { EventRecord } from '@/database/models/EventRecord';
import { NormalizedEvent, EventType } from '@/types/events';
import { IEventRecord } from '@/database/models/EventRecord';
import { Document } from 'mongoose';
import { cache } from '@/database/redis';

// Mock EventRecord模型
jest.mock('@/database/models/EventRecord', () => ({
  EventRecord: {
    create: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

// Mock Redis缓存
jest.mock('@/database/redis', () => ({
  cache: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
}));

describe('EventDAO', () => {
  let mockEvent: NormalizedEvent;
  let mockEventRecord: IEventRecord & Document;

  beforeEach(() => {
    jest.clearAllMocks();

    mockEvent = {
      traceId: '0x123',
      chainId: 1,
      blockNumber: 12345,
      transactionHash: '0xabc',
      from: '0x123',
      to: '0x456',
      value: '1000000000000000000',
      timestamp: Math.floor(Date.now() / 1000),
      type: EventType.TRANSFER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockEventRecord = {
      traceId: mockEvent.traceId,
      event: mockEvent,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      $assertPopulated: jest.fn(),
      $clone: jest.fn(),
      $getAllSubdocs: jest.fn(),
      $ignore: jest.fn(),
      $isDefault: jest.fn(),
      $isDeleted: jest.fn(),
      $isEmpty: jest.fn(),
      $isValid: jest.fn(),
      $locals: {},
      $markValid: jest.fn(),
      $op: null,
      $parent: jest.fn(),
      $session: jest.fn(),
      $set: jest.fn(),
      collection: jest.fn(),
      db: jest.fn(),
      delete: jest.fn(),
      deleteOne: jest.fn(),
      depopulate: jest.fn(),
      directModifiedPaths: jest.fn(),
      equals: jest.fn(),
      errors: {},
      get: jest.fn(),
      getChanges: jest.fn(),
      increment: jest.fn(),
      init: jest.fn(),
      invalidate: jest.fn(),
      isDirectModified: jest.fn(),
      isDirectSelected: jest.fn(),
      isInit: jest.fn(),
      isModified: jest.fn(),
      isNew: false,
      isSelected: jest.fn(),
      markModified: jest.fn(),
      modifiedPaths: jest.fn(),
      overwrite: jest.fn(),
      populate: jest.fn(),
      populated: jest.fn(),
      remove: jest.fn(),
      replaceOne: jest.fn(),
      save: jest.fn(),
      schema: jest.fn(),
      set: jest.fn(),
      toJSON: jest.fn(),
      toObject: jest.fn(),
      unmarkModified: jest.fn(),
      update: jest.fn(),
      updateOne: jest.fn(),
      validate: jest.fn(),
      validateSync: jest.fn(),
      id: '123',
      _id: '123',
      $__: {
        activePaths: {
          paths: {},
          states: {},
        },
        adhocPaths: {},
        getters: {},
        modifiedPaths: {},
        saveError: null,
        validationError: null,
        version: null,
        selected: null,
        populated: null,
        wasPopulated: false,
        scope: null,
        session: null,
        pathsToScopes: {},
        cachedRequired: {},
        emitter: {
          _events: {},
          _eventsCount: 0,
          _maxListeners: 0,
        },
      },
      $isMongooseDocumentPrototype: true,
      $isMongooseDocument: true,
      $isDocument: true,
      $model: jest.fn(),
      $init: jest.fn(),
      $where: jest.fn(),
      $getPopulatedDocs: jest.fn(),
      $__init: jest.fn(),
      $__data: {},
      $__schema: {
        paths: {},
        aliases: {},
        subpaths: {},
        virtuals: {},
        singleNestedPaths: {},
        nested: {},
        tree: {},
        query: {},
        childSchemas: [],
        callQueue: [],
        _indexes: [],
        methods: {},
        statics: {},
        methodOptions: {},
        staticOptions: {},
        options: {},
      },
      $__getSchema: jest.fn(),
      $__setSchema: jest.fn(),
      $__path: jest.fn(),
    } as unknown as IEventRecord & Document;
  });

  afterAll(async () => {
    // 清理测试数据
    await EventDAO.deleteMany({});
  });

  describe('create', () => {
    it('应该成功创建新的事件记录', async () => {
      (EventRecord.create as jest.Mock).mockResolvedValue(mockEventRecord);
      (cache.set as jest.Mock).mockResolvedValue(undefined);

      const result = await EventDAO.create(mockEventRecord);

      expect(result).toBeDefined();
      expect(result.traceId).toBe(mockEvent.traceId);
      expect(result.event.transactionHash).toBe(mockEvent.transactionHash);
      expect(cache.set).toHaveBeenCalledWith(
        `event:${mockEventRecord.traceId}`,
        mockEventRecord,
        3600
      );
    });

    it('应该处理创建失败的情况', async () => {
      const error = new Error('数据库错误');
      (EventRecord.create as jest.Mock).mockRejectedValue(error);

      await expect(EventDAO.create(mockEventRecord)).rejects.toThrow(error);
    });
  });

  describe('findByTraceId', () => {
    it('如果缓存中存在则应返回缓存的事件记录', async () => {
      (cache.get as jest.Mock).mockResolvedValue(mockEventRecord);

      const result = await EventDAO.findByTraceId(mockEventRecord.traceId);

      expect(cache.get).toHaveBeenCalledWith(`event:${mockEventRecord.traceId}`);
      expect(EventRecord.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(mockEventRecord);
    });

    it('如果缓存中不存在则应从数据库获取并缓存', async () => {
      (cache.get as jest.Mock).mockResolvedValue(null);
      (EventRecord.findOne as jest.Mock).mockResolvedValue(mockEventRecord);
      (cache.set as jest.Mock).mockResolvedValue(undefined);

      const result = await EventDAO.findByTraceId(mockEventRecord.traceId);

      expect(cache.get).toHaveBeenCalledWith(`event:${mockEventRecord.traceId}`);
      expect(EventRecord.findOne).toHaveBeenCalledWith({ traceId: mockEventRecord.traceId });
      expect(cache.set).toHaveBeenCalledWith(
        `event:${mockEventRecord.traceId}`,
        mockEventRecord,
        3600
      );
      expect(result).toEqual(mockEventRecord);
    });

    it('如果记录不存在则应返回null', async () => {
      (cache.get as jest.Mock).mockResolvedValue(null);
      (EventRecord.findOne as jest.Mock).mockResolvedValue(null);

      const result = await EventDAO.findByTraceId('不存在的ID');

      expect(result).toBeNull();
    });
  });

  describe('findByTransactionHash', () => {
    it('应该通过交易哈希找到事件记录', async () => {
      (EventRecord.findOne as jest.Mock).mockResolvedValue(mockEventRecord);

      const result = await EventDAO.findByTransactionHash(mockEvent.transactionHash);

      expect(EventRecord.findOne).toHaveBeenCalledWith({
        'event.transactionHash': mockEvent.transactionHash,
      });
      expect(result).toEqual(mockEventRecord);
    });
  });

  describe('updateStatus', () => {
    it('应该更新事件状态并刷新缓存', async () => {
      const updatedRecord = { ...mockEventRecord, status: 'completed' as const };
      (EventRecord.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedRecord);
      (cache.set as jest.Mock).mockResolvedValue(undefined);

      const result = await EventDAO.updateStatus(mockEventRecord.traceId, 'completed');

      expect(EventRecord.findOneAndUpdate).toHaveBeenCalledWith(
        { traceId: mockEventRecord.traceId },
        { $set: { status: 'completed' } },
        { new: true }
      );
      expect(cache.set).toHaveBeenCalledWith(
        `event:${mockEventRecord.traceId}`,
        updatedRecord,
        3600
      );
      expect(result).toEqual(updatedRecord);
    });
  });

  describe('updateRiskAnalysis', () => {
    it('应该更新风险分析结果并刷新缓存', async () => {
      const riskAnalysis = {
        score: 0.8,
        level: 'high' as const,
        factors: ['suspicious_pattern'],
        features: [
          {
            description: 'High value transfer',
            score: 0.8,
          },
        ],
        timestamp: Date.now(),
      };
      const updatedRecord = { ...mockEventRecord, riskAnalysis };
      (EventRecord.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedRecord);
      (cache.set as jest.Mock).mockResolvedValue(undefined);

      const result = await EventDAO.updateRiskAnalysis(mockEventRecord.traceId, riskAnalysis);

      expect(EventRecord.findOneAndUpdate).toHaveBeenCalledWith(
        { traceId: mockEventRecord.traceId },
        { $set: { riskAnalysis } },
        { new: true }
      );
      expect(cache.set).toHaveBeenCalledWith(
        `event:${mockEventRecord.traceId}`,
        updatedRecord,
        3600
      );
      expect(result).toEqual(updatedRecord);
    });
  });

  describe('delete', () => {
    it('应该删除事件记录并清除缓存', async () => {
      (EventRecord.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });
      (cache.del as jest.Mock).mockResolvedValue(undefined);

      const result = await EventDAO.delete(mockEventRecord.traceId);

      expect(EventRecord.deleteOne).toHaveBeenCalledWith({ traceId: mockEventRecord.traceId });
      expect(cache.del).toHaveBeenCalledWith(`event:${mockEventRecord.traceId}`);
      expect(result).toBe(true);
    });

    it('当没有记录被删除时应返回false', async () => {
      (EventRecord.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 0 });
      (cache.del as jest.Mock).mockResolvedValue(undefined);

      const result = await EventDAO.delete('不存在的ID');

      expect(result).toBe(false);
    });
  });

  describe('deleteMany', () => {
    it('应该批量删除事件记录', async () => {
      (EventRecord.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 5 });

      const result = await EventDAO.deleteMany({ status: 'completed' });

      expect(EventRecord.deleteMany).toHaveBeenCalledWith({ status: 'completed' });
      expect(result).toBe(5);
    });
  });
});
