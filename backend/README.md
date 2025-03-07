# ChainIntelAI 事件回放工具

这是一个用于回放和分析区块链历史事件的工具，支持 ERC20 Transfer 事件的回放、分析和通知。

## 功能特点

- 支持指定区块范围的历史事件回放
- 自动解析和存储事件数据
- 集成 AI 风险分析
- 支持高风险事件通知（Telegram + Discord）
- 完整的日志记录
- 事件状态管理和重试机制
- 批量处理优化
- 多链支持（通过 chainId 区分）

## 安装依赖

```bash
yarn add ethers@6 winston mongoose dotenv fs-extra
```

## 配置说明

1. 复制环境变量示例文件：

```bash
cp .env.example .env
```

2. 修改 `.env` 文件中的配置项：

- 区块链节点地址
- 合约地址
- 数据库连接信息
- 通知系统配置
- AI 分析配置

## 使用方法

### 方式一：手动启动

1. 启动本地 Hardhat 节点：

```bash
cd hardhat
npx hardhat node
```

2. 运行事件回放工具：

```bash
node replayHistoricalEvents.js
```

### 方式二：使用 Docker Compose（推荐）

1. 创建 `docker-compose.yml` 文件：

```yaml
version: "3"
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password

  hardhat:
    build: ./hardhat
    ports:
      - "8545:8545"
    command: ["npx", "hardhat", "node"]
    depends_on:
      - mongodb

  replay:
    build: .
    command: ["node", "replayHistoricalEvents.js"]
    environment:
      - MONGODB_URI=mongodb://admin:password@mongodb:27017/chainintel
      - ETH_NODE_WSS=ws://hardhat:8545
    depends_on:
      - mongodb
      - hardhat

volumes:
  mongodb_data:
```

2. 创建 `Dockerfile`：

```dockerfile
FROM node:20

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

CMD ["node", "replayHistoricalEvents.js"]
```

3. 启动服务：

```bash
docker-compose up -d
```

## 配置项说明

### 区块链配置

- `ETH_NODE_WSS`: WebSocket 节点地址
- `ETH_NODE_HTTP`: HTTP 节点地址
- `CONTRACT_ADDRESS`: 目标合约地址

### 回放配置

- `REPLAY_START_BLOCK`: 起始区块号
- `REPLAY_END_BLOCK`: 结束区块号（latest 表示最新区块）
- `REPLAY_BATCH_SIZE`: 批量处理大小
- `REPLAY_MAX_RETRIES`: 最大重试次数
- `REPLAY_RETRY_DELAY`: 重试延迟（毫秒）

### 通知配置

- `TELEGRAM_BOT_TOKEN`: Telegram 机器人 Token
- `TELEGRAM_CHAT_ID`: Telegram 聊天 ID
- `DISCORD_WEBHOOK_URL`: Discord Webhook URL

### AI 分析配置

- `OPENAI_API_KEY`: OpenAI API Key
- `AI_MODEL`: AI 模型名称
- `AI_MAX_TOKENS`: 最大 Token 数
- `AI_TEMPERATURE`: AI 温度参数

## 日志说明

日志文件位于 `logs` 目录：

- `replay.log`: 回放过程日志
- `error.log`: 错误日志
- `combined.log`: 所有日志

## 事件数据结构

```javascript
{
    "chainId": "number",     // 链 ID
    "txHash": "string",      // 交易哈希
    "blockNumber": "number", // 区块号
    "from": "string",        // 发送方地址
    "to": "string",          // 接收方地址
    "amount": "string",      // 转账金额（ETH）
    "value": "string",       // 原始转账金额（Wei）
    "timestamp": "number",   // 区块时间戳
    "riskLevel": "string",   // 风险等级
    "source": "string"       // 事件来源（replay/realtime）
}
```

## 扩展说明

要支持其他类型的事件，需要：

1. 在 `config.js` 中添加新事件的 ABI
2. 创建新的事件处理器类
3. 在 `replayHistoricalEvents.js` 中添加新事件的处理逻辑

## ⚠️ 风险提示

1. **生产环境使用**

   - 不要在生产地址/主网直接回放，推荐先在测试网完整测试
   - 不要在公网节点跑事件回放，大批量历史查询很可能被 rate limit
   - 如果合约是自己写的，请确认事件是否含有危险信息（函数签名、权限等）

2. **数据安全**

   - 确保数据库访问权限正确配置
   - 定期备份重要数据
   - 监控磁盘空间使用情况

3. **资源使用**

   - 回放大量历史区块会占用较多内存和 CPU
   - 建议根据服务器配置调整 `REPLAY_BATCH_SIZE`
   - 监控系统资源使用情况

4. **网络连接**
   - 确保节点连接稳定
   - 配置合适的重试策略
   - 监控网络延迟和连接状态

## 注意事项

1. 确保数据库服务已启动
2. 确保区块链节点正常运行
3. 配置正确的通知系统 Token
4. 设置合适的 AI 分析参数
5. 定期检查日志文件大小
6. 监控系统资源使用情况

# ChainIntelAI Backend

## 功能特性

- 事件处理管道
- 地址画像分析
- 风险评估
- 多渠道通知

## 配置说明

### 画像服务配置

```env
# 画像API地址
PROFILE_API_URL=http://profile-api.example.com

# 缓存配置
PROFILE_CACHE_TTL=3600        # 缓存过期时间（秒）
PROFILE_BATCH_SIZE=10         # 批量查询大小

# 重试配置
PROFILE_FETCH_TIMEOUT=15000   # 查询超时时间（毫秒）
PROFILE_FETCH_RETRIES=3       # 重试次数
PROFILE_MIN_RETRY_DELAY=1000  # 最小重试延迟（毫秒）
PROFILE_MAX_RETRY_DELAY=5000  # 最大重试延迟（毫秒）
```

### 日志配置

```env
LOG_LEVEL=info    # debug, info, warn, error
LOG_FORMAT=json   # json, text
LOG_TIMESTAMP_FORMAT=YYYY-MM-DD HH:mm:ss.SSS
```

### 监控指标

所有指标以 `chainintel_` 为前缀

#### 画像服务指标

- `profile_latency_seconds`: 画像加载耗时（直方图）

  - buckets: [0.1, 0.5, 1, 2, 5]
  - 单位：秒

- `profile_cache_hits_total`: 缓存命中次数（计数器）
- `profile_cache_misses_total`: 缓存未命中次数（计数器）
- `profile_cache_hit_ratio`: 缓存命中率（仪表盘）
  - 范围：0-1
  - 自动计算：hits / (hits + misses)

#### AI 分析指标

- `ai_analysis_latency_seconds`: AI 分析耗时（直方图）
  - buckets: [0.1, 0.5, 1, 2, 5]
  - 单位：秒

#### 事件处理指标

- `event_processing_total`: 事件处理总量（计数器）

  - 标签：status=success|error

- `error_total`: 错误计数（计数器）
  - 标签：type=network|timeout|validation

## 日志格式

所有日志采用 JSON 格式，包含以下字段：

```json
{
  "timestamp": "2024-03-20T10:00:00.000Z",
  "level": "info",
  "message": "处理事件",
  "traceId": "trace-123",
  "meta": {
    "eventId": "evt-123",
    "duration": 150
  }
}
```

## 开发指南

### 安装依赖

```bash
yarn install
```

### 运行测试

```bash
# 运行所有测试
yarn test

# 运行单元测试
yarn test:unit

# 运行集成测试
yarn test:integration
```

### 构建

```bash
yarn build
```

### 启动服务

```bash
# 开发环境
yarn dev

# 生产环境
yarn start
```

## 监控面板

### Grafana 仪表盘

1. 画像服务面板

   - 加载耗时分布
   - 缓存命中率趋势
   - 错误率统计

2. AI 分析面板

   - 分析耗时分布
   - 风险等级分布
   - 模型调用统计

3. 事件处理面板
   - 处理量趋势
   - 错误分布
   - 处理延迟统计

### 告警规则

1. 画像服务

   - 加载耗时 P95 > 2s
   - 缓存命中率 < 50%
   - 错误率 > 5%

2. AI 分析

   - 分析耗时 P95 > 5s
   - 错误率 > 1%

3. 事件处理
   - 处理延迟 > 30s
   - 错误率 > 1%
   - 队列堆积 > 1000
