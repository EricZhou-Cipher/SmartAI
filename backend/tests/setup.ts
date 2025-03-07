import { register } from 'prom-client';
import { Logger } from '../src/utils/logger.js';
import { AppConfig } from '../src/config.js';
import { RiskLevel } from '../src/types/events.js';

// 创建测试日志记录器
class TestLogger implements Logger {
  private traceId?: string;

  info(message: string, meta?: Record<string, any>): void {
    console.log(`[INFO] ${message}`, meta);
  }

  error(message: string, meta?: Record<string, any>): void {
    console.error(`[ERROR] ${message}`, meta);
  }

  warn(message: string, meta?: Record<string, any>): void {
    console.warn(`[WARN] ${message}`, meta);
  }

  debug(message: string, meta?: Record<string, any>): void {
    console.debug(`[DEBUG] ${message}`, meta);
  }

  setTraceId(traceId: string): void {
    this.traceId = traceId;
  }
}

export const testLogger = new TestLogger();

// 创建测试配置
export const testConfig: AppConfig = {
  pipeline: {
    riskAnalysis: {
      minScore: 0,
      maxScore: 1,
      thresholds: {
        [RiskLevel.LOW]: 0.3,
        [RiskLevel.MEDIUM]: 0.5,
        [RiskLevel.HIGH]: 0.7,
        [RiskLevel.CRITICAL]: 0.9
      }
    },
    eventProcessing: {
      batchSize: 100,
      maxConcurrent: 10,
      timeout: 30000,
      retryCount: 3,
      retryDelay: 1000
    },
    notification: {
      enabled: true,
      channels: ['slack', 'dingtalk', 'feishu'],
      minRiskLevel: RiskLevel.HIGH
    },
    monitoring: {
      enabled: true,
      metrics: ['risk_score', 'event_count', 'processing_time'],
      alertThresholds: {
        risk_score: 0.8,
        event_count: 1000,
        processing_time: 5000
      }
    }
  },
  profiler: {
    maxRetries: 3,
    retryDelay: 1000,
    backoff: 'EXPONENTIAL',
    timeout: 30000,
    batchSize: 100,
    maxConcurrent: 10
  },
  database: {
    url: 'mongodb://localhost:27017/chainintel_test',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  blockchain: {
    rpcUrl: 'http://localhost:8545',
    chainId: 1,
    confirmations: 12
  },
  api: {
    port: 3000,
    host: 'localhost',
    cors: true
  }
};

// 清理 Prometheus 指标
beforeAll(() => {
  register.clear();
});

// 设置测试超时
jest.setTimeout(30000);

// 全局测试设置
beforeAll(async () => {
  // 设置测试环境变量
  process.env.NODE_ENV = 'test';
  
  // 设置测试日志
  testLogger.info('Starting test suite');
});

afterAll(async () => {
  testLogger.info('Test suite completed');
});

// 每个测试用例的设置
beforeEach(() => {
  // 重置测试状态
  jest.clearAllMocks();
  
  // 设置新的 traceId
  testLogger.setTraceId(require('uuid').v4());
});

// 模拟控制台输出
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
  console.debug = jest.fn();
});

afterAll(() => {
  console = originalConsole;
});

beforeEach(() => {
  // 清除所有Prometheus指标
  register.clear();
});

afterAll(() => {
  // Clean up any remaining metrics
  register.clear();
});

// 扩展Jest的匹配器
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
}); 