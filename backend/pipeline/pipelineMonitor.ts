import { Counter, Histogram, Registry, Gauge } from 'prom-client';
import { WebClient as SlackClient } from '@slack/web-api';
import axios from 'axios';
import { PipelineConfig, getRiskLevel } from './pipelineConfig';
import { Logger } from '../utils/logger';
import { NormalizedEvent } from '../types/events';
import { RiskAnalysis, RiskLevel } from '../types/events';

export class PipelineMonitor {
  private config: PipelineConfig;
  private logger: Logger;
  private registry: Registry;
  private eventCounter: Counter;
  private errorCounter: Counter;
  private latencyHistogram: Histogram;
  private riskLevelCounter: Counter;

  // 事件处理指标
  private riskLevelCounterTotal: Counter<string>;

  // 处理时间指标
  private profileLatencyHistogram: Histogram<string>;
  private riskAnalysisLatencyHistogram: Histogram<string>;
  private notificationLatencyHistogram: Histogram<string>;
  private totalLatencyHistogram: Histogram<string>;

  // 缓存指标
  private profileCacheHits: Counter<string>;
  private profileCacheMisses: Counter<string>;
  private profileCacheHitRatio: Gauge<string>;

  // Webhook clients
  private slackClient?: SlackClient;
  private dingTalkUrl?: string;
  private feishuUrl?: string;

  constructor(config: PipelineConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
    this.registry = new Registry();

    // 初始化指标
    this.eventCounter = new Counter({
      name: 'chainintel_events_total',
      help: 'Total number of events processed',
      labelNames: ['type', 'trace_id']
    });

    this.errorCounter = new Counter({
      name: 'chainintel_errors_total',
      help: 'Total number of errors',
      labelNames: ['error', 'trace_id']
    });

    this.latencyHistogram = new Histogram({
      name: 'chainintel_latency_seconds',
      help: 'Event processing latency in seconds',
      labelNames: ['operation', 'trace_id'],
      buckets: [0.1, 0.5, 1, 2, 5, 10]
    });

    this.riskLevelCounter = new Counter({
      name: 'chainintel_risk_levels_total',
      help: 'Total number of risk levels',
      labelNames: ['level', 'trace_id']
    });

    // 注册指标
    this.registry.registerMetric(this.eventCounter);
    this.registry.registerMetric(this.errorCounter);
    this.registry.registerMetric(this.latencyHistogram);
    this.registry.registerMetric(this.riskLevelCounter);

    // 初始化事件指标
    this.riskLevelCounterTotal = new Counter({
      name: 'chainintel_risk_levels_total',
      help: 'Total number of risk levels detected',
      labelNames: ['risk_level'],
      registers: [this.registry]
    });

    // 初始化处理时间指标
    this.profileLatencyHistogram = new Histogram({
      name: 'chainintel_profile_latency_seconds',
      help: 'Time taken to fetch address profiles',
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.registry]
    });

    this.riskAnalysisLatencyHistogram = new Histogram({
      name: 'chainintel_risk_analysis_latency_seconds',
      help: 'Time taken for risk analysis',
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.registry]
    });

    this.notificationLatencyHistogram = new Histogram({
      name: 'chainintel_notification_latency_seconds',
      help: 'Time taken to send notifications',
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.registry]
    });

    this.totalLatencyHistogram = new Histogram({
      name: 'chainintel_total_latency_seconds',
      help: 'Total event processing time',
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.registry]
    });

    // 初始化缓存指标
    this.profileCacheHits = new Counter({
      name: 'chainintel_profile_cache_hits_total',
      help: 'Total number of profile cache hits',
      registers: [this.registry]
    });

    this.profileCacheMisses = new Counter({
      name: 'chainintel_profile_cache_misses_total',
      help: 'Total number of profile cache misses',
      registers: [this.registry]
    });

    this.profileCacheHitRatio = new Gauge({
      name: 'chainintel_profile_cache_hit_ratio',
      help: 'Profile cache hit ratio',
      registers: [this.registry],
      collect: () => {
        const hits = Number(this.profileCacheHits.get());
        const misses = Number(this.profileCacheMisses.get());
        const total = hits + misses;
        
        if (total > 0) {
          this.profileCacheHitRatio.set(hits / total);
        }
      }
    });

    // Initialize webhook clients
    if (config.monitoring.webhooks.slack) {
      this.slackClient = new SlackClient(config.monitoring.webhooks.slack);
    }
    this.dingTalkUrl = config.monitoring.webhooks.dingtalk;
    this.feishuUrl = config.monitoring.webhooks.feishu;
  }

  recordEvent(type: string, traceId: string): void {
    this.eventCounter.inc({ type, trace_id: traceId });
  }

  recordError(error: string, traceId: string): void {
    this.errorCounter.inc({ error, trace_id: traceId });
  }

  recordProfileLatency(seconds: number, traceId: string): void {
    this.latencyHistogram.observe({ operation: 'profile', trace_id: traceId }, seconds);
  }

  recordRiskAnalysisLatency(seconds: number, traceId: string): void {
    this.latencyHistogram.observe({ operation: 'risk_analysis', trace_id: traceId }, seconds);
  }

  recordNotificationLatency(seconds: number, traceId: string): void {
    this.latencyHistogram.observe({ operation: 'notification', trace_id: traceId }, seconds);
  }

  recordTotalLatency(seconds: number, traceId: string): void {
    this.latencyHistogram.observe({ operation: 'total', trace_id: traceId }, seconds);
  }

  recordRiskLevel(level: string, traceId: string): void {
    this.riskLevelCounter.inc({ level, trace_id: traceId });
  }

  async getMetrics(): Promise<string> {
    return await this.registry.metrics();
  }

  // Webhook notification methods
  async notifyHighRisk(event: NormalizedEvent, riskAnalysis: RiskAnalysis): Promise<void> {
    const message = this.formatAlertMessage(event, riskAnalysis);
    
    try {
      await Promise.all([
        this.notifySlack(message),
        this.notifyDingTalk(message),
        this.notifyFeishu(message)
      ]);
    } catch (error) {
      this.logger.error('Failed to send webhook notifications', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async notifySlack(message: string): Promise<void> {
    if (this.slackClient) {
      await this.slackClient.chat.postMessage({
        channel: '#risk-alerts',
        text: message
      });
    }
  }

  private async notifyDingTalk(message: string): Promise<void> {
    if (this.dingTalkUrl) {
      await axios.post(this.dingTalkUrl, {
        msgtype: 'text',
        text: { content: message }
      });
    }
  }

  private async notifyFeishu(message: string): Promise<void> {
    if (this.feishuUrl) {
      await axios.post(this.feishuUrl, {
        msg_type: 'text',
        content: { text: message }
      });
    }
  }

  private formatAlertMessage(event: NormalizedEvent, riskAnalysis: RiskAnalysis): string {
    return `🚨 High Risk Event Detected!\n\n` +
           `Chain: ${event.chainId}\n` +
           `Transaction: ${event.transactionHash}\n` +
           `From: ${event.from}\n` +
           `To: ${event.to}\n` +
           `Value: ${event.value}\n` +
           `Risk Level: ${riskAnalysis.level}\n` +
           `Risk Score: ${(riskAnalysis.score * 100).toFixed(1)}%\n` +
           `Time: ${new Date(event.timestamp * 1000).toISOString()}\n\n` +
           `Features:\n${riskAnalysis.features.map(f => `- ${f.description}: ${f.score}`).join('\n')}`;
  }
} 