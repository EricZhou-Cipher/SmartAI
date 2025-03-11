# ChainIntel AI

ChainIntel AI 是一个区块链智能监控平台，用于监控和分析区块链交易，提供警报和通知功能。

## 项目概述

ChainIntel AI 平台由前端和后端两部分组成，提供以下核心功能：

- 区块链交易实时监控
- 自定义警报规则
- 通知系统（邮件、系统内通知）
- 日志记录和分析
- 用户权限管理

## 项目结构

```
ChainIntelAI/
├── frontend/           # 前端应用 (Next.js)
└── backend/            # 后端服务 (Node.js/Express)
```

## 快速开始

### 前提条件

- Node.js 18+
- MongoDB 6+
- Yarn 或 npm

### 后端设置

1. 进入后端目录：

```bash
cd backend
```

2. 安装依赖：

```bash
yarn install
# 或
npm install
```

3. 创建 `.env` 文件并配置环境变量：

```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/chainintel
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

4. 启动开发服务器：

```bash
yarn dev
# 或
npm run dev
```

后端服务器将在 [http://localhost:5001](http://localhost:5001) 上运行。

### 前端设置

1. 进入前端目录：

```bash
cd frontend
```

2. 安装依赖：

```bash
yarn install
# 或
npm install
```

3. 创建 `.env.local` 文件并配置环境变量：

```
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
```

4. 启动开发服务器：

```bash
yarn dev
# 或
npm run dev
```

前端应用将在 [http://localhost:3000](http://localhost:3000) 上运行。

## 测试

### 后端测试

```bash
cd backend
yarn test
# 或
npm test
```

### 前端测试

```bash
cd frontend
yarn test
# 或
npm test
```

## 部署

### 后端部署

```bash
cd backend
yarn build
yarn start
# 或
npm run build
npm start
```

### 前端部署

```bash
cd frontend
yarn build
yarn start
# 或
npm run build
npm start
```

## 详细文档

- [前端文档](./frontend/README.md)
- [后端文档](./backend/README.md)

## 贡献指南

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

[MIT](LICENSE)
