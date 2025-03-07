import cron from "node-cron";
import logger from "../config/logger.js";
import { AddressProfile } from "./profileSchema.js";
import { addressProfiler } from "./addressProfiler.js";

class ProfileUpdater {
  constructor(config = {}) {
    this.config = {
      // 默认每天凌晨2点运行
      schedule: "0 2 * * *",
      // 每次更新最多处理的地址数
      batchLimit: 1000,
      // 更新阈值(超过24小时的画像)
      updateThreshold: 24 * 60 * 60 * 1000,
      ...config,
    };
  }

  // 启动定时更新
  start() {
    logger.info("启动画像更新任务", {
      schedule: this.config.schedule,
    });

    cron.schedule(this.config.schedule, async () => {
      try {
        await this.runUpdate();
      } catch (error) {
        logger.error("画像更新任务失败:", error);
      }
    });
  }

  // 执行更新
  async runUpdate() {
    const startTime = Date.now();

    try {
      // 1. 查找需要更新的地址
      const addresses = await this.findAddressesToUpdate();

      if (addresses.length === 0) {
        logger.info("没有需要更新的画像");
        return;
      }

      // 2. 批量更新画像
      const results = await addressProfiler.batchUpdateProfiles(addresses);

      // 3. 记录更新结果
      const duration = (Date.now() - startTime) / 1000;
      logger.info("画像更新任务完成", {
        total: results.total,
        success: results.success,
        failed: results.failed,
        duration: `${duration}秒`,
      });
    } catch (error) {
      logger.error("画像更新任务执行失败:", error);
      throw error;
    }
  }

  // 查找需要更新的地址
  async findAddressesToUpdate() {
    try {
      const updateThreshold = new Date(
        Date.now() - this.config.updateThreshold
      );

      // 查找过期的画像
      const profiles = await AddressProfile.find({
        "metadata.lastUpdated": { $lt: updateThreshold },
      })
        .sort({ "metadata.lastUpdated": 1 })
        .limit(this.config.batchLimit)
        .select("address");

      return profiles.map((p) => p.address);
    } catch (error) {
      logger.error("查找需要更新的地址失败:", error);
      throw error;
    }
  }

  // 手动触发更新
  async triggerUpdate() {
    logger.info("手动触发画像更新");
    return this.runUpdate();
  }
}

export const profileUpdater = new ProfileUpdater();
