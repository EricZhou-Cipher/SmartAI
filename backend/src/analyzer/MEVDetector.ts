import { NormalizedEvent, EventType } from '../types/events';
import { logger } from '../utils/logger';

/**
 * MEV (Maximal Extractable Value) 检测器
 * 负责检测链上的 MEV 行为，如三明治攻击、套利等
 */
export class MEVDetector {
  // MEV 相关的合约方法特征
  private static MEV_METHOD_SIGNATURES = [
    'swapExactTokensForTokens',
    'swapTokensForExactTokens',
    'swap',
    'flashLoan',
    'flash',
  ];

  // 已知的 MEV 机器人地址
  private static KNOWN_MEV_BOTS = [
    '0x000000000000084e91743124a982076c59f10084', // MEV-Bot
    '0x0000000000007f150bd6f54c40a34d7c3d5e9f56', // MEV-Bot
    '0x00000000000000adc04c56bf30ac9d3c0aaf14dc', // Flashbots
  ];

  /**
   * 检测交易是否为 MEV 行为
   * @param event 当前交易事件
   * @param recentEvents 最近交易事件
   * @returns 是否为 MEV 行为
   */
  static async detect(event: NormalizedEvent, recentEvents: NormalizedEvent[]): Promise<boolean> {
    try {
      // 1. 检查是否为已知 MEV 机器人地址
      if (this.isKnownMEVBot(event.from)) {
        logger.info('检测到已知 MEV 机器人地址', {
          traceId: event.traceId,
          address: event.from,
        });
        return true;
      }

      // 2. 检查是否使用 MEV 相关方法
      if (event.methodName && this.isMEVMethod(event.methodName)) {
        logger.info('检测到 MEV 相关方法调用', {
          traceId: event.traceId,
          method: event.methodName,
        });
        return true;
      }

      // 3. 检测三明治攻击模式
      if (recentEvents.length >= 3 && this.detectSandwichPattern(event, recentEvents)) {
        logger.info('检测到三明治攻击模式', {
          traceId: event.traceId,
        });
        return true;
      }

      // 4. 检测高频交易模式 (短时间内多次交易)
      if (this.detectHighFrequencyPattern(event, recentEvents)) {
        logger.info('检测到高频交易模式', {
          traceId: event.traceId,
        });
        return true;
      }

      return false;
    } catch (error) {
      logger.warn('MEV 检测失败', {
        traceId: event.traceId,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * 检查地址是否为已知 MEV 机器人
   * @param address 地址
   * @returns 是否为 MEV 机器人
   */
  private static isKnownMEVBot(address: string): boolean {
    return this.KNOWN_MEV_BOTS.some((bot) => bot.toLowerCase() === address.toLowerCase());
  }

  /**
   * 检查方法是否为 MEV 相关方法
   * @param methodName 方法名
   * @returns 是否为 MEV 相关方法
   */
  private static isMEVMethod(methodName: string): boolean {
    return this.MEV_METHOD_SIGNATURES.some((sig) =>
      methodName.toLowerCase().includes(sig.toLowerCase())
    );
  }

  /**
   * 检测三明治攻击模式
   * 三明治攻击通常是指在大额交易前后进行小额交易，从中获利
   * @param event 当前交易事件
   * @param recentEvents 最近交易事件
   * @returns 是否为三明治攻击
   */
  private static detectSandwichPattern(
    event: NormalizedEvent,
    recentEvents: NormalizedEvent[]
  ): boolean {
    if (!event.value || recentEvents.length < 3) return false;

    try {
      // 按时间排序
      const sortedEvents = [...recentEvents, event].sort((a, b) => a.timestamp - b.timestamp);

      // 寻找可能的三明治模式
      for (let i = 1; i < sortedEvents.length - 1; i++) {
        const before = sortedEvents[i - 1];
        const target = sortedEvents[i];
        const after = sortedEvents[i + 1];

        // 检查是否同一发送方在目标交易前后都有交易
        if (
          before.from === after.from &&
          before.from !== target.from &&
          before.type === EventType.CONTRACT_CALL &&
          after.type === EventType.CONTRACT_CALL
        ) {
          // 检查时间间隔是否足够短 (30秒内)
          const timeBeforeTarget = target.timestamp - before.timestamp;
          const timeAfterTarget = after.timestamp - target.timestamp;

          if (timeBeforeTarget < 30 && timeAfterTarget < 30) {
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * 检测高频交易模式
   * @param event 当前交易事件
   * @param recentEvents 最近交易事件
   * @returns 是否为高频交易
   */
  private static detectHighFrequencyPattern(
    event: NormalizedEvent,
    recentEvents: NormalizedEvent[]
  ): boolean {
    if (recentEvents.length < 5) return false;

    // 筛选出同一发送方的交易
    const senderEvents = recentEvents.filter((e) => e.from === event.from);

    // 如果短时间内有多笔交易
    if (senderEvents.length >= 5) {
      // 按时间排序
      const sortedEvents = senderEvents.sort((a, b) => a.timestamp - b.timestamp);

      // 计算最早和最晚交易的时间差
      const timeSpan = sortedEvents[sortedEvents.length - 1].timestamp - sortedEvents[0].timestamp;

      // 如果在60秒内有5笔以上交易，视为高频交易
      if (timeSpan <= 60 && sortedEvents.length >= 5) {
        return true;
      }
    }

    return false;
  }
}
