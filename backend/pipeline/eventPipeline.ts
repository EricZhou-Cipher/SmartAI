import { PipelineConfig } from './pipelineConfig';
import { PipelineMonitor } from './pipelineMonitor';
import { EventNormalizer } from './eventNormalizer';
import { riskAnalyzer } from '../analyzer/riskAnalyzer';
import { NotificationRouter } from '../notifier/notificationRouter';
import { Logger } from '../utils/logger';
import { addressProfiler } from '../profiling/addressProfiler';
import { generateTraceId } from '../utils/traceId';
import { RiskAnalysis, RiskLevel } from '../types/events';

export class EventPipeline {
  private config: PipelineConfig;
  private monitor: PipelineMonitor;
  private normalizer: EventNormalizer;
  private logger: Logger;

  constructor(config: PipelineConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
    this.monitor = new PipelineMonitor(config, logger);
    this.normalizer = new EventNormalizer(logger);
  }

  async processEvent(event: any): Promise<void> {
    const traceId = generateTraceId();
    const startTime = Date.now();

    try {
      // 记录事件
      this.monitor.recordEvent(event.type, traceId);

      // 规范化事件
      const normalizedEvent = await this.normalizer.normalizeEvent(event.chainId, event);

      // 获取地址画像
      const profileStartTime = Date.now();
      const profile = await addressProfiler.getProfile(normalizedEvent.from);
      this.monitor.recordProfileLatency((Date.now() - profileStartTime) / 1000, traceId);

      // 风险分析
      const analysisStartTime = Date.now();
      const riskAnalysis = await riskAnalyzer.analyze(normalizedEvent, profile);
      this.monitor.recordRiskAnalysisLatency((Date.now() - analysisStartTime) / 1000, traceId);

      // 记录风险等级
      this.monitor.recordRiskLevel(riskAnalysis.level, traceId);

      // 发送通知
      const notificationStartTime = Date.now();
      await this.sendNotifications(normalizedEvent, riskAnalysis);
      this.monitor.recordNotificationLatency((Date.now() - notificationStartTime) / 1000, traceId);

      // 记录总处理时间
      this.monitor.recordTotalLatency((Date.now() - startTime) / 1000, traceId);
    } catch (error) {
      this.monitor.recordError(error instanceof Error ? error.message : 'Unknown error', traceId);
      throw error;
    }
  }

  private async sendNotifications(event: any, riskAnalysis: RiskAnalysis): Promise<void> {
    const channels = this.getNotificationChannels(riskAnalysis.score);
    await NotificationRouter.send(event, riskAnalysis, channels);
  }

  private getNotificationChannels(score: number): string[] {
    return this.config.notification.channels[this.getRiskLevel(score)] || [];
  }

  private getRiskLevel(score: number): RiskLevel {
    if (score >= this.config.notification.riskThresholds.critical) {
      return RiskLevel.CRITICAL;
    }
    if (score >= this.config.notification.riskThresholds.high) {
      return RiskLevel.HIGH;
    }
    if (score >= this.config.notification.riskThresholds.medium) {
      return RiskLevel.MEDIUM;
    }
    return RiskLevel.LOW;
  }
}