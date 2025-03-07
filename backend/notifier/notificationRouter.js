import { Counter, Histogram } from "prom-client";
import logger from "../config/logger.js";
import { rateLimiter } from "./rateLimiter.js";
import {
  riskLevelChannels,
  eventTemplates,
  receivers,
  batchRules,
  emergencyRules,
} from "./notificationRules.js";

// Prometheus指标
const notificationCounter = new Counter({
  name: "notification_total_count",
  help: "通知总发送数",
  labelNames: ["risk_level", "event_type", "channel"],
});

const filteredCounter = new Counter({
  name: "notification_filtered_count",
  help: "被策略过滤的通知数",
  labelNames: ["reason"],
});

const channelCounter = new Counter({
  name: "notification_channel_count",
  help: "各渠道发送数",
  labelNames: ["channel"],
});

const deliveryTimeHistogram = new Histogram({
  name: "notification_delivery_time_seconds",
  help: "通知发送耗时分布",
  labelNames: ["channel"],
});

class NotificationRouter {
  constructor() {
    // 批量操作缓存
    this.batchOperations = new Map();
  }

  // 路由通知
  async route(event, profile, riskAnalysis) {
    const startTime = Date.now();

    try {
      // 1. 确定事件类型和风险等级
      const eventType = this._getEventType(event);
      const riskLevel = this._getRiskLevel(riskAnalysis);

      // 2. 检查是否需要合并批量操作
      if (eventType === "BATCH_OPERATION") {
        const shouldBatch = this._handleBatchOperation(event);
        if (shouldBatch) {
          logger.info("批量操作已缓存,等待合并", {
            operator: event.from,
            txHash: event.txHash,
          });
          return;
        }
      }

      // 3. 获取通知模板
      const template = eventTemplates[eventType];
      if (!template) {
        logger.warn("未找到事件类型的通知模板", { eventType });
        filteredCounter.inc({ reason: "no_template" });
        return;
      }

      // 4. 确定目标接收人
      const targetReceivers = this._getTargetReceivers(event, riskLevel);
      if (targetReceivers.length === 0) {
        logger.info("没有匹配的接收人", { eventType, riskLevel });
        filteredCounter.inc({ reason: "no_receiver" });
        return;
      }

      // 5. 检查是否触发紧急提醒
      const isEmergency = this._checkEmergency(event, profile, riskAnalysis);

      // 6. 遍历接收人发送通知
      for (const receiver of targetReceivers) {
        const channels = this._getNotificationChannels(receiver, riskLevel);

        for (const channel of channels) {
          // 检查频率限制(紧急情况下忽略频控)
          if (
            !isEmergency &&
            !rateLimiter.canSendNotification(receiver.id, channel, riskLevel)
          ) {
            continue;
          }

          // 渲染通知内容
          const content = this._renderTemplate(template, {
            ...event,
            riskLevel,
            riskAnalysis: riskAnalysis.summary,
          });

          // 发送通知
          await this._sendNotification(channel, receiver, content);

          // 更新指标
          const duration = (Date.now() - startTime) / 1000;
          notificationCounter.inc({
            risk_level: riskLevel,
            event_type: eventType,
            channel,
          });
          channelCounter.inc({ channel });
          deliveryTimeHistogram.observe({ channel }, duration);

          // 记录日志
          logger.info("通知发送成功", {
            receiver: receiver.id,
            channel,
            eventType,
            riskLevel,
            isEmergency,
            duration: `${duration}s`,
          });
        }
      }
    } catch (error) {
      logger.error("通知发送失败", error);
      throw error;
    }
  }

  // 获取事件类型
  _getEventType(event) {
    if (event.batchOperation) {
      return "BATCH_OPERATION";
    }
    if (event.method) {
      return "CONTRACT_INTERACTION";
    }
    return "TRANSFER";
  }

  // 获取风险等级
  _getRiskLevel(riskAnalysis) {
    const score = riskAnalysis.score;
    if (score >= 80) return "HIGH";
    if (score >= 50) return "MEDIUM";
    return "LOW";
  }

  // 处理批量操作
  _handleBatchOperation(event) {
    const now = Date.now();
    const operator = event.from;

    // 获取操作者的批量操作缓存
    let operations = this.batchOperations.get(operator) || {
      firstSeen: now,
      operations: [],
    };

    // 清理过期操作
    if (now - operations.firstSeen > batchRules.windowMs) {
      operations = {
        firstSeen: now,
        operations: [],
      };
    }

    // 添加新操作
    operations.operations.push(event);

    // 检查是否需要合并
    if (operations.operations.length >= batchRules.minOperations) {
      if (operations.operations.length >= batchRules.maxOperations) {
        // 达到最大合并数,触发通知
        this._sendBatchNotification(operator, operations.operations);
        this.batchOperations.delete(operator);
        return false;
      }
      // 继续累积
      this.batchOperations.set(operator, operations);
      return true;
    }

    // 更新缓存
    this.batchOperations.set(operator, operations);
    return true;
  }

  // 发送批量操作通知
  _sendBatchNotification(operator, operations) {
    // TODO: 实现批量通知逻辑
  }

  // 获取目标接收人
  _getTargetReceivers(event, riskLevel) {
    return Object.entries(receivers)
      .filter(([_, receiver]) => {
        const subs = receiver.subscriptions;

        // 检查链是否匹配
        const chainMatch =
          subs.chains.includes("*") ||
          subs.chains.includes(event.chainId.toString());

        // 检查风险等级是否匹配
        const riskMatch = subs.riskLevels.includes(riskLevel);

        // 检查事件类型是否匹配
        const eventType = this._getEventType(event);
        const eventMatch =
          subs.eventTypes.includes("*") || subs.eventTypes.includes(eventType);

        return chainMatch && riskMatch && eventMatch;
      })
      .map(([id, receiver]) => ({ id, ...receiver }));
  }

  // 获取通知渠道
  _getNotificationChannels(receiver, riskLevel) {
    // 合并默认渠道和接收人配置的渠道
    const defaultChannels = riskLevelChannels[riskLevel] || [];
    const receiverChannels = Object.keys(receiver.channels);

    return defaultChannels.filter((channel) =>
      receiverChannels.includes(channel)
    );
  }

  // 检查是否触发紧急提醒
  _checkEmergency(event, profile, riskAnalysis) {
    // 检查风险分数
    if (riskAnalysis.score >= emergencyRules.riskScoreThreshold) {
      return true;
    }

    // 检查金额阈值
    const amountThreshold = emergencyRules.amountThreshold[event.chainId];
    if (amountThreshold && event.value && event.value >= amountThreshold) {
      return true;
    }

    return false;
  }

  // 渲染通知模板
  _renderTemplate(template, data) {
    let content = template.template;

    // 简单的模板替换
    for (const [key, value] of Object.entries(data)) {
      content = content.replace(new RegExp(`{{${key}}}`, "g"), value);
    }

    return content;
  }

  // 发送通知
  async _sendNotification(channel, receiver, content) {
    // TODO: 实现具体的通知发送逻辑
    // 这里应该调用不同渠道的通知服务
    switch (channel) {
      case "telegram":
        // await telegramBot.sendMessage(receiver.channels.telegram, content);
        break;
      case "discord":
        // await discordBot.sendMessage(receiver.channels.discord, content);
        break;
      case "email":
        // await emailService.send(receiver.channels.email, content);
        break;
      default:
        logger.warn("未知的通知渠道", { channel });
    }
  }

  // 清理过期的批量操作缓存
  cleanup() {
    const now = Date.now();

    for (const [operator, data] of this.batchOperations.entries()) {
      if (now - data.firstSeen > batchRules.windowMs) {
        // 如果有累积的操作,发送通知
        if (data.operations.length > 0) {
          this._sendBatchNotification(operator, data.operations);
        }
        this.batchOperations.delete(operator);
      }
    }
  }
}

// 导出单例
export const notificationRouter = new NotificationRouter();

// 定期清理批量操作缓存
setInterval(() => {
  notificationRouter.cleanup();
}, 60 * 1000); // 每分钟清理一次
