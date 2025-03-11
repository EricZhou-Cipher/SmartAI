import mongoose from 'mongoose';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

/**
 * 指数退避重试连接数据库
 * @param {number} retryCount - 当前重试次数
 * @param {number} maxRetries - 最大重试次数
 * @param {number} initialDelay - 初始延迟时间（毫秒）
 * @param {number} maxDelay - 最大延迟时间（毫秒）
 * @returns {Promise<boolean>} - 连接成功返回true，失败返回false
 */
const connectWithRetry = async (
  retryCount = 0,
  maxRetries = 5,
  initialDelay = 1000,
  maxDelay = 30000
) => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/chainintelai';

    console.log(`尝试连接MongoDB: ${mongoURI.replace(/\/\/([^:]+):[^@]+@/, '//***:***@')}`);

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 超时时间5秒
    });

    console.log(`MongoDB连接成功: ${conn.connection.host}`);
    return true;
  } catch (error) {
    if (retryCount >= maxRetries) {
      console.error(`MongoDB连接失败，已达到最大重试次数(${maxRetries}): ${error.message}`);
      return false;
    }

    // 计算下一次重试的延迟时间（指数退避）
    const delay = Math.min(initialDelay * Math.pow(2, retryCount), maxDelay);

    console.error(`MongoDB连接失败(${retryCount + 1}/${maxRetries}): ${error.message}`);
    console.log(`将在${delay / 1000}秒后重试...`);

    // 等待一段时间后重试
    await new Promise((resolve) => setTimeout(resolve, delay));

    // 递归重试
    return connectWithRetry(retryCount + 1, maxRetries, initialDelay, maxDelay);
  }
};

/**
 * 检查MongoDB连接状态
 * @returns {boolean} - 连接状态
 */
const checkConnection = () => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

/**
 * 获取MongoDB连接详细信息
 * @returns {Object} - 连接信息
 */
const getConnectionInfo = () => {
  if (!checkConnection()) {
    return {
      connected: false,
      host: null,
      name: null,
      port: null,
    };
  }

  const { host, port, name } = mongoose.connection;
  return {
    connected: true,
    host,
    name,
    port,
  };
};

/**
 * 关闭MongoDB连接
 * @returns {Promise<void>}
 */
const closeConnection = async () => {
  if (checkConnection()) {
    await mongoose.connection.close();
    console.log('MongoDB连接已关闭');
  }
};

export { connectWithRetry, checkConnection, getConnectionInfo, closeConnection };
