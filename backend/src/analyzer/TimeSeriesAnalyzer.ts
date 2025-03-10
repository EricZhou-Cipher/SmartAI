import { NormalizedEvent } from '../types/events';
import { logger } from '../utils/logger';

/**
 * 时间序列分析器
 * 负责分析交易时间序列并检测异常模式
 */
export class TimeSeriesAnalyzer {
  /**
   * 检测时间序列中的异常
   * @param events 交易事件数组
   * @returns 异常评分 (0-1)
   */
  static detectAnomalies(events: NormalizedEvent[]): number {
    if (events.length < 5) return 0.1;

    try {
      // 提取时间戳并排序
      const timestamps = events.map((event) => event.timestamp).sort((a, b) => a - b);

      // 计算时间间隔
      const intervals: number[] = [];
      for (let i = 1; i < timestamps.length; i++) {
        intervals.push(timestamps[i] - timestamps[i - 1]);
      }

      // 计算平均间隔和标准差
      const avgInterval = this.calculateMean(intervals);
      const stdDeviation = this.calculateStandardDeviation(intervals, avgInterval);

      // 计算变异系数 (标准差/平均值)
      const coefficientOfVariation = stdDeviation / avgInterval;

      // 检测异常模式
      let anomalyScore = 0.1;

      // 1. 检测极度规律的交易 (机器人特征)
      if (coefficientOfVariation < 0.1 && intervals.length > 5) {
        anomalyScore = 0.8; // 高度规律的交易模式
      }

      // 2. 检测突发交易 (短时间内大量交易)
      const burstThreshold = avgInterval * 0.2;
      const burstCount = intervals.filter((interval) => interval < burstThreshold).length;
      const burstRatio = burstCount / intervals.length;

      if (burstRatio > 0.7 && intervals.length > 5) {
        anomalyScore = Math.max(anomalyScore, 0.7);
      }

      // 3. 检测周期性模式 (可能是自动化脚本)
      const periodicityScore = this.detectPeriodicity(intervals);
      anomalyScore = Math.max(anomalyScore, periodicityScore);

      // 4. 检测异常的交易时间分布
      const timeDistributionScore = this.analyzeTimeDistribution(events);
      anomalyScore = Math.max(anomalyScore, timeDistributionScore);

      return anomalyScore;
    } catch (error) {
      logger.warn('时间序列分析失败', {
        error: error instanceof Error ? error.message : String(error),
      });
      return 0.2; // 默认低风险
    }
  }

  /**
   * 计算数组平均值
   * @param values 数值数组
   * @returns 平均值
   */
  private static calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  /**
   * 计算标准差
   * @param values 数值数组
   * @param mean 平均值
   * @returns 标准差
   */
  private static calculateStandardDeviation(values: number[], mean: number): number {
    if (values.length < 2) return 0;

    const squaredDifferences = values.map((value) => Math.pow(value - mean, 2));
    const variance = squaredDifferences.reduce((sum, value) => sum + value, 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * 检测时间间隔的周期性
   * @param intervals 时间间隔数组
   * @returns 周期性评分 (0-1)
   */
  private static detectPeriodicity(intervals: number[]): number {
    if (intervals.length < 10) return 0.1;

    // 简化的周期性检测：检查是否有重复的间隔模式
    const patternSize = 3; // 寻找3个间隔的重复模式
    let patternCount = 0;

    for (let i = 0; i <= intervals.length - patternSize * 2; i++) {
      const pattern = intervals.slice(i, i + patternSize);
      const nextPattern = intervals.slice(i + patternSize, i + patternSize * 2);

      // 检查两个模式是否相似
      const isPatternSimilar = this.arePatternsSimilar(pattern, nextPattern);
      if (isPatternSimilar) {
        patternCount++;
      }
    }

    // 计算周期性评分
    const maxPossiblePatterns = intervals.length - patternSize * 2 + 1;
    const periodicityRatio = patternCount / maxPossiblePatterns;

    if (periodicityRatio > 0.7) return 0.9;
    if (periodicityRatio > 0.5) return 0.7;
    if (periodicityRatio > 0.3) return 0.5;

    return 0.1;
  }

  /**
   * 检查两个模式是否相似
   * @param pattern1 模式1
   * @param pattern2 模式2
   * @returns 是否相似
   */
  private static arePatternsSimilar(pattern1: number[], pattern2: number[]): boolean {
    if (pattern1.length !== pattern2.length) return false;

    const tolerance = 0.2; // 允许20%的误差

    for (let i = 0; i < pattern1.length; i++) {
      const ratio = pattern1[i] / pattern2[i];
      if (ratio < 1 - tolerance || ratio > 1 + tolerance) {
        return false;
      }
    }

    return true;
  }

  /**
   * 分析交易时间分布
   * @param events 交易事件数组
   * @returns 时间分布异常评分 (0-1)
   */
  private static analyzeTimeDistribution(events: NormalizedEvent[]): number {
    if (events.length < 5) return 0.1;

    // 统计每个小时的交易数量
    const hourCounts = new Array(24).fill(0);

    events.forEach((event) => {
      const hour = new Date(event.timestamp * 1000).getHours();
      hourCounts[hour]++;
    });

    // 计算活跃小时数 (有交易的小时)
    const activeHours = hourCounts.filter((count) => count > 0).length;

    // 如果交易集中在少数几个小时，可能是异常
    if (activeHours <= 3 && events.length > 10) {
      return 0.7;
    }

    // 检查是否在深夜时段 (0-5点) 有大量交易
    const nightHoursTotal = hourCounts.slice(0, 5).reduce((sum, count) => sum + count, 0);
    const nightRatio = nightHoursTotal / events.length;

    if (nightRatio > 0.5 && events.length > 5) {
      return 0.8; // 深夜交易比例高
    }

    return 0.1;
  }
}
