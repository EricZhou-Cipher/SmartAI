# ChainIntel 后端

ChainIntel 是一个区块链智能监控平台的后端服务，提供 API 接口和数据处理功能。

## 功能特点

- RESTful API 接口
- 用户认证与授权
- 区块链交易监控
- 警报规则管理
- 通知系统
- 日志记录与分析
- WebSocket 实时通信

## 技术栈

- Node.js
- Express.js
- MongoDB
- Socket.IO
- JWT 认证
- Jest (测试)

## 开发环境设置

### 前提条件

- Node.js 18+
- MongoDB 6+
- Yarn 或 npm

### 安装依赖

```bash
yarn install
# 或
npm install
```

### 环境变量

创建一个 `.env` 文件，并添加以下变量：

```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/chainintel
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### 启动开发服务器

```bash
yarn dev
# 或
npm run dev
```

服务器将在 [http://localhost:5001](http://localhost:5001) 上运行。

## API 文档

### 认证 API

- `POST /api/auth/register` - 注册新用户
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取当前用户信息

### 警报 API

- `GET /api/alerts` - 获取警报列表
- `GET /api/alerts/:id` - 获取警报详情
- `POST /api/alerts` - 创建新警报
- `PUT /api/alerts/:id` - 更新警报
- `DELETE /api/alerts/:id` - 删除警报

### 警报规则 API

- `GET /api/alert-rules` - 获取警报规则列表
- `GET /api/alert-rules/:id` - 获取警报规则详情
- `POST /api/alert-rules` - 创建新警报规则
- `PUT /api/alert-rules/:id` - 更新警报规则
- `DELETE /api/alert-rules/:id` - 删除警报规则

### 日志 API

- `GET /api/logs` - 获取日志列表
- `GET /api/logs/:id` - 获取日志详情
- `GET /api/logs/stats` - 获取日志统计信息

### 通知 API

- `GET /api/notifications` - 获取通知列表
- `GET /api/notifications/unread/count` - 获取未读通知数量
- `GET /api/notifications/:id` - 获取通知详情
- `PATCH /api/notifications/:id/read` - 标记通知为已读
- `PATCH /api/notifications/read-all` - 标记所有通知为已读
- `DELETE /api/notifications/:id` - 删除通知

## 测试

### 运行测试

```bash
yarn test
# 或
npm test
```

### 运行测试覆盖率报告

```bash
yarn test:coverage
# 或
npm run test:coverage
```

## 项目结构

```
backend/
├── src/
│   ├── config/           # 配置文件
│   ├── controllers/      # API 控制器
│   ├── middleware/       # 中间件
│   ├── models/           # 数据模型
│   ├── routes/           # API 路由
│   ├── services/         # 业务逻辑服务
│   ├── utils/            # 工具函数
│   ├── app.js            # Express 应用
│   └── server.js         # 服务器入口
├── tests/                # 测试文件
├── .env                  # 环境变量
└── package.json          # 项目依赖
```

## 与前端集成

后端通过 RESTful API 和 WebSocket 与前端通信。确保前端应用配置了正确的 API URL。

## 构建生产版本

```bash
yarn build
# 或
npm run build
```

## 部署

构建完成后，可以使用以下命令启动生产服务器：

```bash
yarn start
# 或
npm start
```

## 贡献指南

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

[MIT](LICENSE)
