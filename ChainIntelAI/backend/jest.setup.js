/**
 * Jest全局设置文件
 * 用于设置测试环境和全局配置
 */

console.log('Jest设置文件加载中...');

// 设置测试超时时间
jest.setTimeout(30000);

// 设置环境变量
process.env.NODE_ENV = 'test';

// 尝试预先加载关键依赖
try {
  // 预加载Babel插件模块，确保它在测试运行前可用
  const resolver = require('./babel-resolver');

  // 尝试预加载关键Babel模块
  Object.keys(resolver.moduleMap).forEach((moduleName) => {
    try {
      const modulePath = resolver.resolveModule(moduleName);
      console.log(`✅ 预加载模块: ${moduleName} 从 ${modulePath}`);
      require(modulePath);
    } catch (err) {
      console.warn(`⚠️ 无法预加载模块: ${moduleName}`, err.message);
      // 使用debugModulePaths查找可能的路径
      const possiblePath = resolver.debugModulePaths(moduleName);
      if (possiblePath) {
        console.log(`🔍 找到模块的可能路径: ${possiblePath}`);
        try {
          require(possiblePath);
          console.log(`✅ 成功从${possiblePath}加载${moduleName}`);
        } catch (loadErr) {
          console.warn(`⚠️ 从发现的路径加载失败: ${loadErr.message}`);
        }
      }
    }
  });

  // 特别确保@babel/plugin-transform-modules-commonjs已加载
  try {
    const plugin = require('@babel/plugin-transform-modules-commonjs');
    console.log('✅ 直接加载模块成功: @babel/plugin-transform-modules-commonjs');
  } catch (err) {
    console.warn('⚠️ 直接加载@babel/plugin-transform-modules-commonjs失败:', err.message);
  }
} catch (err) {
  console.warn('加载babel-resolver期间出错:', err.message);
}

// 处理未捕获的Promise错误
process.on('unhandledRejection', (error) => {
  console.error('未捕获的Promise错误:', error);
});

// 环境变量设置
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
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

// 全局模拟设置
global.console = {
  ...console,
  // 保持测试输出干净
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  // 但保留警告和错误以便调试
  warn: console.warn,
  error: console.error,
};

// 在测试之前进行清理
beforeAll(() => {
  // 在这里可以添加全局的 beforeAll 钩子
});

afterAll(() => {
  // 在这里可以添加全局的 afterAll 钩子
  // 例如关闭数据库连接等
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

// 全局清理
afterAll(async () => {
  // 确保所有异步操作完成
  await new Promise((resolve) => setTimeout(resolve, 500));
});
