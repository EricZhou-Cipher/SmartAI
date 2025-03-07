import winston from "winston";
import "winston-daily-rotate-file";
import path from "path";

// 日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// 日志文件配置
const fileTransport = new winston.transports.DailyRotateFile({
  filename: path.join("logs", "%DATE%-combined.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
  level: "info",
});

// 错误日志文件配置
const errorFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join("logs", "%DATE%-error.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
  level: "error",
});

// 创建日志记录器
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  defaultMeta: { service: "chain-intel" },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    fileTransport,
    errorFileTransport,
  ],
});

// 导出日志记录器
export default logger;
