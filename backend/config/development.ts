import { Config } from './default';

export const developmentConfig: Partial<Config> = {
  database: {
    url: 'mongodb://localhost:27017/chainintel_dev',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 5
    }
  },
  redis: {
    host: 'localhost',
    port: 6379,
    db: 1
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
    metricsPort: 9090,
    metricsInterval: 15,
    metricsPrefix: 'chainintel_dev',
    metricsBuckets: [0.1, 0.5, 1, 2, 5]
  }
}; 