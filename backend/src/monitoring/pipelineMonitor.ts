import { Registry, Histogram, Gauge, Counter } from 'prom-client';
import { MonitorConfig } from '../types/config';

export class PipelineMonitor {
  private registry: Registry;
  private prefix: string;

  // 画像加载耗时
  private profileLatency: Histogram;
  // 画像缓存命中率
  private profileCacheHits: Counter<string>;
  private profileCacheMisses: Counter<string>;
  private profileCacheHitRatio: Gauge<string>;
  // AI分析耗时
  private aiAnalysisLatency: Histogram;
  // 事件处理总量
  private eventProcessingTotal: Counter<string>;
  // 错误计数
  private errorTotal: Counter<string>;

  constructor(config: MonitorConfig) {
    this.registry = new Registry();
    this.prefix = config.metricsPrefix;

    // 初始化指标
    this.profileLatency = new Histogram({
      name: `${this.prefix}_profile_latency_seconds`,
      help: 'Address profile loading latency in seconds',
      buckets: config.buckets,
      registers: [this.registry],
    });

    this.profileCacheHits = new Counter({
      name: `${this.prefix}_profile_cache_hits_total`,
      help: 'Total number of profile cache hits',
      registers: [this.registry],
    });

    this.profileCacheMisses = new Counter({
      name: `${this.prefix}_profile_cache_misses_total`,
      help: 'Total number of profile cache misses',
      registers: [this.registry],
    });

    this.profileCacheHitRatio = new Gauge({
      name: `${this.prefix}_profile_cache_hit_ratio`,
      help: 'Profile cache hit ratio',
      registers: [this.registry],
      collect: () => {
        const hits = Number(this.profileCacheHits.get());
        const misses = Number(this.profileCacheMisses.get());
        const total = hits + misses;

        if (total > 0) {
          this.profileCacheHitRatio.set(hits / total);
        }
      },
    });

    this.aiAnalysisLatency = new Histogram({
      name: `${this.prefix}_ai_analysis_latency_seconds`,
      help: 'AI analysis latency in seconds',
      buckets: config.buckets,
      registers: [this.registry],
    });

    this.eventProcessingTotal = new Counter({
      name: `${this.prefix}_event_processing_total`,
      help: 'Total number of events processed',
      labelNames: ['status'],
      registers: [this.registry],
    });

    this.errorTotal = new Counter({
      name: `${this.prefix}_error_total`,
      help: 'Total number of errors',
      labelNames: ['type'],
      registers: [this.registry],
    });
  }

  // 记录画像加载耗时
  recordProfileLatency(durationMs: number): void {
    this.profileLatency.observe(durationMs / 1000);
  }

  // 记录缓存命中
  recordCacheHit(): void {
    this.profileCacheHits.inc();
  }

  // 记录缓存未命中
  recordCacheMiss(): void {
    this.profileCacheMisses.inc();
  }

  // 记录AI分析耗时
  recordAiAnalysisLatency(durationMs: number): void {
    this.aiAnalysisLatency.observe(durationMs / 1000);
  }

  // 记录事件处理
  recordEventProcessing(status: 'success' | 'error'): void {
    this.eventProcessingTotal.labels(status).inc();
  }

  // 记录错误
  recordError(type: string): void {
    this.errorTotal.labels(type).inc();
  }

  // 获取所有指标
  async getMetrics(): Promise<string> {
    return await this.registry.metrics();
  }
}
