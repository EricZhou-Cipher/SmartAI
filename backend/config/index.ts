import { Logger } from '../utils/logger';
import { Config, defaultConfig, validateConfig } from './default';
import { developmentConfig } from './development';
import { productionConfig } from './production';
import { PipelineConfig } from '../pipeline/pipelineConfig';

export * from './default';

export async function loadConfig(logger: Logger): Promise<Config> {
  try {
    const env = process.env.NODE_ENV || 'development';
    logger.info(`Loading configuration for environment: ${env}`);

    // 根据环境加载配置
    const envConfig = env === 'production' ? productionConfig : developmentConfig;

    // 合并配置
    const config: Config = {
      ...defaultConfig,
      ...envConfig,
      pipeline: defaultConfig.pipeline // 使用默认的 pipeline 配置
    };

    // 验证配置
    validateConfig(config);

    logger.info('Configuration loaded successfully');
    return config;
  } catch (error) {
    logger.error('Failed to load configuration', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
} 