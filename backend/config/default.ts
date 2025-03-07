import { z } from 'zod';
import { PipelineConfig } from '../pipeline/pipelineConfig';

const ConfigSchema = z.object({
  database: z.object({
    url: z.string().url(),
    options: z.object({
      useNewUrlParser: z.boolean().default(true),
      useUnifiedTopology: z.boolean().default(true),
      maxPoolSize: z.number().positive().default(10)
    })
  }),
  redis: z.object({
    host: z.string().default('localhost'),
    port: z.number().positive().default(6379),
    password: z.string().optional(),
    db: z.number().nonnegative().default(0)
  }),
  ai: z.object({
    mode: z.enum(['local', 'api']).default('api'),
    provider: z.enum(['openai', 'gemini', 'claude']).default('openai'),
    model: z.string().default('gpt-4'),
    maxTokens: z.number().positive().default(2048),
    temperature: z.number().min(0).max(2).default(0.7),
    localModelPath: z.string().optional()
  }),
  monitoring: z.object({
    enabled: z.boolean().default(true),
    metricsPort: z.number().positive().default(9090),
    metricsInterval: z.number().positive().default(15),
    metricsPrefix: z.string().default('chainintel'),
    metricsBuckets: z.array(z.number()).default([0.1, 0.5, 1, 2, 5])
  }),
  pipeline: z.custom<PipelineConfig>()
});

export type Config = z.infer<typeof ConfigSchema>;

export const defaultConfig: Config = {
  database: {
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017/chainintel',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10
    }
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10)
  },
  ai: {
    mode: (process.env.AI_MODE || 'api') as 'local' | 'api',
    provider: (process.env.AI_PROVIDER || 'openai') as 'openai' | 'gemini' | 'claude',
    model: process.env.AI_MODEL || 'gpt-4',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2048', 10),
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    localModelPath: process.env.AI_LOCAL_MODEL_PATH
  },
  monitoring: {
    enabled: process.env.MONITORING_ENABLED !== 'false',
    metricsPort: parseInt(process.env.METRICS_PORT || '9090', 10),
    metricsInterval: parseInt(process.env.METRICS_INTERVAL || '15', 10),
    metricsPrefix: process.env.METRICS_PREFIX || 'chainintel',
    metricsBuckets: (process.env.METRICS_BUCKETS || '0.1,0.5,1,2,5')
      .split(',')
      .map(n => parseFloat(n))
  },
  pipeline: {} as PipelineConfig // 将由 pipeline 模块填充
};

export function validateConfig(config: Config): void {
  try {
    ConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join('\n');
      throw new Error(`Invalid configuration:\n${errors}`);
    }
    throw error;
  }
} 