import { Config } from './default';

export const productionConfig: Partial<Config> = {
  database: {
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017/chainintel_prod',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 20
    }
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10)
  },
  ai: {
    mode: 'api',
    provider: 'openai',
    model: 'gpt-4',
    maxTokens: 2048,
    temperature: 0.7
  },
  monitoring: {
    enabled: true,
    metricsPort: parseInt(process.env.METRICS_PORT || '9090', 10),
    metricsInterval: parseInt(process.env.METRICS_INTERVAL || '15', 10),
    metricsPrefix: 'chainintel_prod',
    metricsBuckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60]
  }
}; 