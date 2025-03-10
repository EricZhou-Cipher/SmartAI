/**
 * Jest 设置文件
 * 用于配置测试环境
 */

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

// 禁用控制台输出
console.log = jest.fn();
console.error = jest.fn();
console.warn = jest.fn();
