import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';

// 导入数据库连接模块
import { connectWithRetry, checkConnection, getConnectionInfo } from './utils/connectDB.js';

// 导入路由
import authRoutes from './api/auth.js';
import userRoutes from './api/users.js';
import transactionRoutes from './api/transactions.js';
import addressRoutes from './api/address.js';
import alertRoutes from './api/alerts.js';
import logRoutes from './api/logs.js';
import notificationRoutes from './api/notifications.js';

// 导入错误处理中间件
import { errorHandler } from './utils/error.js';
import { apiLogger, errorLogger } from './middleware/logger.js';

// 加载环境变量
dotenv.config();

// 设置模拟数据模式
process.env.USE_REAL_DB = process.env.USE_REAL_DB || 'false';

// 创建 Express 应用
const app = express();
const httpServer = createServer(app);

// 配置Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

// 中间件
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 添加API日志中间件
app.use(apiLogger);

// 基础路由
app.get('/', (req, res) => {
  res.json({
    message: 'ChainIntelAI API 服务运行中',
    mode: process.env.USE_REAL_DB === 'true' ? '数据库模式' : '模拟数据模式',
    dbConnected: checkConnection(),
  });
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 数据库健康检查端点
app.get('/health/db', (req, res) => {
  const connectionInfo = getConnectionInfo();

  res.json({
    connected: connectionInfo.connected,
    mode: process.env.USE_REAL_DB === 'true' ? '数据库模式' : '模拟数据模式',
    details: connectionInfo,
    timestamp: new Date().toISOString(),
  });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/notifications', notificationRoutes);

// 静态文件服务
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
  });
}

// 错误处理中间件
app.use(errorLogger);
app.use(errorHandler);

// 端口设置
const PORT = process.env.PORT || 5000;

// 启动服务器
const startServer = async () => {
  try {
    // 尝试连接数据库，使用指数退避重试机制
    const dbConnected = await connectWithRetry();

    if (dbConnected) {
      process.env.USE_REAL_DB = 'true';
      global.useMockData = false;
      console.log('使用真实数据库模式');
    } else {
      process.env.USE_REAL_DB = 'false';
      global.useMockData = true;
      console.log('使用模拟数据模式');
    }

    // 启动服务器
    httpServer.listen(PORT, () => {
      console.log(`服务器运行在端口: ${PORT}`);
      console.log(`API文档: http://localhost:${PORT}/api-docs`);
      console.log(`健康检查: http://localhost:${PORT}/health`);
      console.log(`数据库状态: http://localhost:${PORT}/health/db`);
    });
  } catch (error) {
    console.error(`服务器启动错误: ${error.message}`);
    process.exit(1);
  }
};

startServer();

// 导出Socket.io实例，供其他模块使用
export { io };
