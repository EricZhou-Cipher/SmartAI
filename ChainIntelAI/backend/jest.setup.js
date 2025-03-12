/**
 * Jest 设置文件
 * 用于配置测试环境
 */

// 设置超时时间
jest.setTimeout(30000);

// 处理未捕获的Promise错误
process.on('unhandledRejection', (error) => {
  console.error('未捕获的Promise错误:', error);
});

// 环境变量设置
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/chainintelai_test';
process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
process.env.REDIS_PORT = process.env.REDIS_PORT || '6379';

// 模拟 Redis 连接
jest.mock('./src/database/redis', () => ({
  redis: {
    on: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
  },
  cache: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
    exists: jest.fn().mockResolvedValue(false),
  },
}));

// 模拟 MongoDB 连接
jest.mock('mongoose', () => {
  const mongoose = jest.requireActual('mongoose');
  return {
    ...mongoose,
    connect: jest.fn().mockResolvedValue(undefined),
    connection: {
      ...mongoose.connection,
      on: jest.fn(),
      once: jest.fn(),
    },
  };
});

// 模拟 prom-client
jest.mock('prom-client', () => ({
  register: {
    metrics: jest.fn().mockResolvedValue(`
# HELP chainintel_events_total Total number of events processed
# TYPE chainintel_events_total counter
chainintel_events_total 0

# HELP chainintel_errors_total Total number of errors encountered
# TYPE chainintel_errors_total counter
chainintel_errors_total 0

# HELP chainintel_risk_levels_total Risk levels distribution
# TYPE chainintel_risk_levels_total counter
chainintel_risk_levels_total{level="low"} 0
chainintel_risk_levels_total{level="medium"} 0
chainintel_risk_levels_total{level="high"} 0

# HELP chainintel_latency_seconds Processing latency in seconds
# TYPE chainintel_latency_seconds histogram
chainintel_latency_seconds_bucket{le="0.1"} 0
chainintel_latency_seconds_bucket{le="0.5"} 0
chainintel_latency_seconds_bucket{le="1"} 0
chainintel_latency_seconds_bucket{le="2"} 0
chainintel_latency_seconds_bucket{le="5"} 0
chainintel_latency_seconds_bucket{le="+Inf"} 0
chainintel_latency_seconds_sum 0
chainintel_latency_seconds_count 0
`),
    contentType: 'text/plain',
    clear: jest.fn(),
  },
  Registry: jest.fn().mockImplementation(() => ({
    metrics: jest.fn().mockResolvedValue(`
# HELP chainintel_events_total Total number of events processed
# TYPE chainintel_events_total counter
chainintel_events_total 0

# HELP chainintel_errors_total Total number of errors encountered
# TYPE chainintel_errors_total counter
chainintel_errors_total 0

# HELP chainintel_risk_levels_total Risk levels distribution
# TYPE chainintel_risk_levels_total counter
chainintel_risk_levels_total{level="low"} 0
chainintel_risk_levels_total{level="medium"} 0
chainintel_risk_levels_total{level="high"} 0

# HELP chainintel_latency_seconds Processing latency in seconds
# TYPE chainintel_latency_seconds histogram
chainintel_latency_seconds_bucket{le="0.1"} 0
chainintel_latency_seconds_bucket{le="0.5"} 0
chainintel_latency_seconds_bucket{le="1"} 0
chainintel_latency_seconds_bucket{le="2"} 0
chainintel_latency_seconds_bucket{le="5"} 0
chainintel_latency_seconds_bucket{le="+Inf"} 0
chainintel_latency_seconds_sum 0
chainintel_latency_seconds_count 0
`),
    contentType: 'text/plain',
    clear: jest.fn(),
    registerMetric: jest.fn(),
    getMetricsAsJSON: jest.fn().mockReturnValue([
      {
        name: 'chainintel_events_total',
        help: 'Total number of events processed',
        type: 'counter',
        values: [],
      },
      {
        name: 'chainintel_errors_total',
        help: 'Total number of errors encountered',
        type: 'counter',
        values: [],
      },
      {
        name: 'chainintel_risk_levels_total',
        help: 'Risk levels distribution',
        type: 'counter',
        values: [],
      },
      {
        name: 'chainintel_latency_seconds',
        help: 'Processing latency in seconds',
        type: 'histogram',
        values: [],
      },
    ]),
  })),
  collectDefaultMetrics: jest.fn(),
  Counter: jest.fn().mockImplementation(() => ({
    inc: jest.fn(),
  })),
  Histogram: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
  })),
  Gauge: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    inc: jest.fn(),
    dec: jest.fn(),
  })),
}));

// 模拟 SlackClient
jest.mock('./src/notifier/slack', () => ({
  SlackClient: jest.fn().mockImplementation(() => ({
    chat: {
      postMessage: jest.fn().mockResolvedValue({ ok: true }),
    },
  })),
}));

// 模拟ethers库
jest.mock('ethers', () => {
  return {
    ...jest.requireActual('ethers'),
    providers: {
      JsonRpcProvider: jest.fn().mockImplementation(() => ({
        getNetwork: jest.fn().mockResolvedValue({ chainId: 1, name: 'mainnet' }),
        getBlockNumber: jest.fn().mockResolvedValue(1000000),
        getBlock: jest.fn().mockResolvedValue({
          number: 1000000,
          timestamp: Math.floor(Date.now() / 1000),
          hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        }),
        getTransaction: jest.fn().mockResolvedValue({
          hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          from: '0x1234567890123456789012345678901234567890',
          to: '0x0987654321098765432109876543210987654321',
          value: { toString: () => '1000000000000000000' },
        }),
      })),
    },
    Contract: jest.fn().mockImplementation(() => ({
      queryFilter: jest.fn().mockResolvedValue([]),
      filters: {},
    })),
  };
});

// 为测试准备清理
beforeAll(() => {
  // 在所有测试开始前执行
});

afterAll(() => {
  // 在所有测试结束后执行
});

// 测试间清理
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  // 清理可能的定时器、打开的连接等
  jest.clearAllTimers();
});

// 禁用控制台输出，但将错误保存到变量中以便检查
const consoleErrors = [];
console.error = (...args) => {
  consoleErrors.push(args);
};

const consoleWarnings = [];
console.warn = (...args) => {
  consoleWarnings.push(args);
};

// 在全局范围内提供一些帮助函数
global.testUtils = {
  consoleErrors,
  consoleWarnings,
  waitForPromises: () => new Promise((resolve) => setImmediate(resolve)),
};
