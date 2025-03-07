import { 
  defaultConfig, 
  getRiskLevel,
  getNotificationChannels,
  RiskLevel,
  validateConfig
} from '../../pipeline/pipelineConfig';

describe('PipelineConfig', () => {
  describe('config validation', () => {
    test('should validate default config', () => {
      expect(() => validateConfig(defaultConfig)).not.toThrow();
    });

    test('should reject invalid risk thresholds', () => {
      const invalidConfig = {
        ...defaultConfig,
        notification: {
          ...defaultConfig.notification,
          riskThresholds: {
            medium: -0.1, // < 0
            high: 1.5, // > 1
            critical: 2.0 // > 1
          }
        }
      };

      expect(() => validateConfig(invalidConfig)).toThrow();
    });

    test('should reject invalid AI config', () => {
      const invalidConfig = {
        ...defaultConfig,
        ai: {
          ...defaultConfig.ai,
          mode: 'invalid' as any,
          temperature: 3.0 // > 2
        }
      };

      expect(() => validateConfig(invalidConfig)).toThrow();
    });

    test('should handle missing optional fields', () => {
      const minimalConfig = {
        ...defaultConfig,
        monitoring: {
          enabled: true,
          metricsPort: 9090,
          metricsInterval: 15,
          webhooks: {}
        }
      };

      expect(() => validateConfig(minimalConfig)).not.toThrow();
    });
  });

  describe('getRiskLevel', () => {
    test('should return correct risk levels', () => {
      expect(getRiskLevel(0.9, defaultConfig)).toBe(RiskLevel.CRITICAL);
      expect(getRiskLevel(0.7, defaultConfig)).toBe(RiskLevel.HIGH);
      expect(getRiskLevel(0.4, defaultConfig)).toBe(RiskLevel.MEDIUM);
      expect(getRiskLevel(0.2, defaultConfig)).toBe(RiskLevel.LOW);
    });

    test('should handle boundary values', () => {
      expect(getRiskLevel(0.9, defaultConfig)).toBe(RiskLevel.CRITICAL);
      expect(getRiskLevel(0.7, defaultConfig)).toBe(RiskLevel.HIGH);
      expect(getRiskLevel(0.4, defaultConfig)).toBe(RiskLevel.MEDIUM);
      expect(getRiskLevel(0, defaultConfig)).toBe(RiskLevel.LOW);
      expect(getRiskLevel(1, defaultConfig)).toBe(RiskLevel.CRITICAL);
    });
  });

  describe('getNotificationChannels', () => {
    test('should return correct channels for risk levels', () => {
      expect(getNotificationChannels(0.9, defaultConfig))
        .toEqual(['slack', 'dingtalk', 'feishu']);
      
      expect(getNotificationChannels(0.7, defaultConfig))
        .toEqual(['slack', 'dingtalk']);
      
      expect(getNotificationChannels(0.4, defaultConfig))
        .toEqual(['slack']);
        
      expect(getNotificationChannels(0.2, defaultConfig))
        .toEqual([]);
    });

    test('should handle custom channel configuration', () => {
      const customConfig = {
        ...defaultConfig,
        notification: {
          ...defaultConfig.notification,
          channels: {
            low: ['log'],
            medium: ['sms'],
            high: ['email'],
            critical: ['all']
          }
        }
      };

      expect(getNotificationChannels(0.9, customConfig))
        .toEqual(['all']);
      
      expect(getNotificationChannels(0.7, customConfig))
        .toEqual(['email']);
      
      expect(getNotificationChannels(0.4, customConfig))
        .toEqual(['sms']);
        
      expect(getNotificationChannels(0.2, customConfig))
        .toEqual(['log']);
    });
  });

  describe('defaultConfig', () => {
    it('should have valid monitoring configuration', () => {
      expect(defaultConfig.monitoring).toBeDefined();
      expect(defaultConfig.monitoring.enabled).toBe(true);
      expect(defaultConfig.monitoring.metricsPort).toBe(9090);
      expect(defaultConfig.monitoring.metricsInterval).toBe(15);
      expect(defaultConfig.monitoring.webhooks).toBeDefined();
    });

    it('should have valid notification configuration', () => {
      expect(defaultConfig.notification).toBeDefined();
      expect(defaultConfig.notification.riskThresholds).toBeDefined();
      expect(defaultConfig.notification.riskThresholds.medium).toBe(0.4);
      expect(defaultConfig.notification.riskThresholds.high).toBe(0.7);
      expect(defaultConfig.notification.riskThresholds.critical).toBe(0.9);
      
      expect(defaultConfig.notification.channels).toBeDefined();
      expect(defaultConfig.notification.channels.low).toEqual([]);
      expect(defaultConfig.notification.channels.medium).toEqual(['slack']);
      expect(defaultConfig.notification.channels.high).toEqual(['slack', 'dingtalk']);
      expect(defaultConfig.notification.channels.critical).toEqual(['slack', 'dingtalk', 'feishu']);
    });

    it('should have valid profile configuration', () => {
      expect(defaultConfig.profile).toBeDefined();
      expect(defaultConfig.profile.cacheTTL).toBe(3600);
      expect(defaultConfig.profile.forceRefreshRiskScore).toBe(0.8);
    });

    it('should have valid AI configuration', () => {
      expect(defaultConfig.ai).toBeDefined();
      expect(defaultConfig.ai.mode).toBe('api');
      expect(defaultConfig.ai.provider).toBe('openai');
      expect(defaultConfig.ai.model).toBe('gpt-4');
      expect(defaultConfig.ai.maxTokens).toBe(2048);
      expect(defaultConfig.ai.temperature).toBe(0.7);
    });

    it('should have valid retry configuration', () => {
      expect(defaultConfig.maxRetries).toBe(3);
      expect(defaultConfig.retryDelay).toBe(1000);
    });
  });

  describe('RiskLevel', () => {
    it('should have all required risk levels', () => {
      expect(RiskLevel.LOW).toBe('low');
      expect(RiskLevel.MEDIUM).toBe('medium');
      expect(RiskLevel.HIGH).toBe('high');
      expect(RiskLevel.CRITICAL).toBe('critical');
    });
  });
}); 