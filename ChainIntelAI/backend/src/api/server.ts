import express, { Request, Response, NextFunction } from 'express';
import { EventPipeline } from '../pipeline/eventPipeline';
import { Logger } from '../utils/logger';
import { RiskLevel, RiskAnalysis } from '../types/events';
import { loadConfig } from '../pipeline/pipelineConfig';
import { performanceMonitor, getMetrics } from '../monitoring/performanceMonitor';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';

// 创建一个logger实例
const logger = new Logger();

// 创建Express应用
const app = express();

// 异步初始化配置和事件处理管道
let pipeline: EventPipeline;

async function initializePipeline() {
  try {
    const config = await loadConfig(logger);
    pipeline = new EventPipeline(config, logger);
    logger.info('Pipeline initialized successfully');
  } catch (error: any) {
    logger.error('Failed to initialize pipeline', { error: error.message });
    process.exit(1);
  }
}

// 安全中间件
app.use(helmet());

// CORS中间件
app.use(cors());

// 压缩中间件
app.use(compression() as any);

// 性能监控中间件
app.use(performanceMonitor());

// 请求体解析中间件
app.use(express.json());

// 请求日志中间件
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    contentLength: req.get('content-length')
  });
  next();
});

// Prometheus指标端点
app.get('/metrics', async (req: Request, res: Response) => {
  res.set('Content-Type', 'text/plain');
  res.send(await getMetrics());
});

// 健康检查端点
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// 交易分析端点
app.post('/analyze', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { transaction } = req.body;

  if (!transaction) {
    return res.status(400).json({
      error: 'Missing transaction data'
    });
  }

  // 验证必要的参数
  if (!transaction.transactionHash || !transaction.from || !transaction.to) {
    return res.status(400).json({
      error: 'Missing required transaction fields (transactionHash, from, to)'
    });
  }

  try {
    // 处理交易
    const result: any = await pipeline.processEvent({
      transactionHash: transaction.transactionHash,
      from: transaction.from,
      to: transaction.to,
      value: transaction.value,
      data: transaction.data,
      chainId: transaction.chainId,
      type: transaction.type || 'TRANSFER',
      timestamp: transaction.timestamp || Math.floor(Date.now() / 1000),
      traceId: transaction.transactionHash
    });

    // 计算处理时间
    const processingTimeMs = Date.now() - startTime;

    // 返回风险分析结果
    if (result && typeof result === 'object' && 'riskAnalysis' in result) {
      const { score, level, factors } = result.riskAnalysis;
      
      const response: any = {
        transactionHash: transaction.transactionHash,
        riskScore: score,
        riskLevel: level,
        processingTimeMs
      };
      
      // 只有在高风险时才返回风险因素
      if (level === RiskLevel.HIGH || level === RiskLevel.CRITICAL) {
        response.riskFactors = factors;
      }
      
      return res.status(200).json(response);
    } else {
      return res.status(200).json({
        transactionHash: transaction.transactionHash,
        riskScore: 0,
        riskLevel: RiskLevel.LOW,
        processingTimeMs,
        message: 'No risk analysis available'
      });
    }
  } catch (error: any) {
    logger.error('Error processing transaction', {
      error: error.message,
      transactionHash: transaction.transactionHash
    });
    
    return res.status(500).json({
      error: 'Failed to process transaction',
      message: error.message
    });
  }
});

// 批量分析端点
app.post('/analyze/batch', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { transactions } = req.body;

  if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
    return res.status(400).json({
      error: 'Missing or invalid transactions array'
    });
  }

  // 限制批量处理的交易数量
  const maxBatchSize = 500;
  if (transactions.length > maxBatchSize) {
    return res.status(400).json({
      error: `Batch size exceeds maximum limit of ${maxBatchSize} transactions`
    });
  }

  try {
    // 并行处理所有交易
    const results = await Promise.all(
      transactions.map(async (transaction) => {
        try {
          // 验证必要的参数
          if (!transaction.transactionHash || !transaction.from || !transaction.to) {
            return {
              transactionHash: transaction.transactionHash || 'unknown',
              error: 'Missing required transaction fields'
            };
          }

          // 处理交易
          const result: any = await pipeline.processEvent({
            transactionHash: transaction.transactionHash,
            from: transaction.from,
            to: transaction.to,
            value: transaction.value,
            data: transaction.data,
            chainId: transaction.chainId,
            type: transaction.type || 'TRANSFER',
            timestamp: transaction.timestamp || Math.floor(Date.now() / 1000),
            traceId: transaction.transactionHash
          });

          // 返回风险分析结果
          if (result && typeof result === 'object' && 'riskAnalysis' in result) {
            const { score, level, factors } = result.riskAnalysis;
            
            const response: any = {
              transactionHash: transaction.transactionHash,
              riskScore: score,
              riskLevel: level
            };
            
            // 只有在高风险时才返回风险因素
            if (level === RiskLevel.HIGH || level === RiskLevel.CRITICAL) {
              response.riskFactors = factors;
            }
            
            return response;
          } else {
            return {
              transactionHash: transaction.transactionHash,
              riskScore: 0,
              riskLevel: RiskLevel.LOW,
              message: 'No risk analysis available'
            };
          }
        } catch (error: any) {
          logger.error('Error processing transaction in batch', {
            error: error.message,
            transactionHash: transaction.transactionHash
          });
          
          return {
            transactionHash: transaction.transactionHash || 'unknown',
            error: error.message
          };
        }
      })
    );

    // 计算处理时间
    const processingTimeMs = Date.now() - startTime;

    // 返回批量处理结果
    return res.status(200).json({
      results,
      count: results.length,
      processingTimeMs
    });
  } catch (error: any) {
    logger.error('Error processing batch transactions', { error: error.message });
    
    return res.status(500).json({
      error: 'Failed to process batch transactions',
      message: error.message
    });
  }
});

// 错误处理中间件
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 初始化管道并启动服务器
const PORT = process.env.PORT || 3000;

// 如果这个文件被直接运行（而不是被导入），则启动服务器
if (require.main === module) {
  initializePipeline().then(() => {
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  });
}

export { app, initializePipeline }; 