import winston from 'winston';
import { format } from 'winston';
import { v4 as uuidv4 } from 'uuid';

export interface LoggerContext {
  traceId?: string;
  [key: string]: any;
}

export interface LoggerConfig {
  level?: string;
  format?: 'json' | 'text';
  timestampFormat?: string;
}

export class Logger {
  private logger: winston.Logger;
  private defaultContext: LoggerContext;

  constructor(options: LoggerConfig = {}) {
    const {
      level = 'info',
      format: logFormat = 'json',
      timestampFormat = 'YYYY-MM-DD HH:mm:ss.SSS'
    } = options;

    // 创建默认上下文
    this.defaultContext = {
      traceId: uuidv4()
    };

    // 创建日志格式
    const formats = [
      format.timestamp({
        format: timestampFormat
      }),
      format.errors({ stack: true })
    ];

    if (logFormat === 'json') {
      formats.push(format.json());
    } else {
      formats.push(
        format.printf(({ timestamp, level, message, traceId, ...meta }) => {
          const metaStr = Object.keys(meta).length
            ? ` ${JSON.stringify(meta)}`
            : '';
          return `${timestamp} [${level}] ${traceId ? `[${traceId}] ` : ''}${message}${metaStr}`;
        })
      );
    }

    // 创建日志记录器
    this.logger = winston.createLogger({
      level,
      format: format.combine(...formats),
      transports: [
        new winston.transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple()
          )
        })
      ]
    });
  }

  private formatMessage(message: string, context?: LoggerContext): winston.LogEntry {
    const traceId = context?.traceId || this.defaultContext.traceId;
    const meta = {
      ...this.defaultContext,
      ...context,
      traceId
    };

    return {
      level: 'info',
      message,
      ...meta
    };
  }

  error(message: string, context?: LoggerContext): void {
    this.logger.error(this.formatMessage(message, context));
  }

  warn(message: string, context?: LoggerContext): void {
    this.logger.warn(this.formatMessage(message, context));
  }

  info(message: string, context?: LoggerContext): void {
    this.logger.info(this.formatMessage(message, context));
  }

  debug(message: string, context?: LoggerContext): void {
    this.logger.debug(this.formatMessage(message, context));
  }

  setTraceId(traceId: string): void {
    this.defaultContext.traceId = traceId;
  }

  getTraceId(): string {
    return this.defaultContext.traceId || uuidv4();
  }
}

export const createLogger = (config: LoggerConfig): Logger => {
  return new Logger(config);
}; 