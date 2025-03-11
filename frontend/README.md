# ChainIntel 前端

ChainIntel 是一个区块链智能监控平台，用于监控和分析区块链交易，提供警报和通知功能。

## 功能特点

- 实时监控区块链交易
- 自定义警报规则
- 通知系统（邮件、系统内通知）
- 日志记录和分析
- 用户权限管理

## 技术栈

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Socket.IO (实时通知)
- Jest & React Testing Library (测试)
- MSW (API 模拟)

## 开发环境设置

### 前提条件

- Node.js 18+
- Yarn 或 npm

### 安装依赖

```bash
yarn install
# 或
npm install
```

### 启动开发服务器

```bash
yarn dev
# 或
npm run dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 上运行。

## 测试

### 运行测试

```bash
yarn test
# 或
npm test
```

### 监视模式下运行测试

```bash
yarn test:watch
# 或
npm run test:watch
```

## 项目结构

```
frontend/
├── app/                  # Next.js 应用路由
│   ├── alerts/           # 警报相关页面
│   ├── dashboard/        # 仪表盘页面
│   ├── logs/             # 日志页面
│   ├── settings/         # 设置页面
│   └── layout.tsx        # 应用布局
├── components/           # 可复用组件
├── context/              # React 上下文
├── hooks/                # 自定义 React Hooks
├── lib/                  # 工具函数和库
├── public/               # 静态资源
├── styles/               # 全局样式
└── tests/                # 测试文件
    ├── components/       # 组件测试
    ├── context/          # 上下文测试
    ├── mocks/            # 测试模拟
    └── pages/            # 页面测试
```

## 与后端集成

前端通过 RESTful API 与后端通信，并使用 Socket.IO 进行实时通知。确保后端服务器在 `http://localhost:5001` 上运行，或者在环境变量中配置正确的 API URL。

## 环境变量

创建一个 `.env.local` 文件，并添加以下变量：

```
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
```

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
