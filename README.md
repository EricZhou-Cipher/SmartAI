# ChainIntelAI

🚀 AI 驱动的链上情报系统

技术栈：

- 🟡 Ethereum (Ethers.js)
- 🍃 MongoDB
- 🤖 OpenAI/Claude
- 🌐 Next.js + ECharts
- 📡 Telegram/Discord Bot

ChainIntelAI 是一个区块链交易智能分析平台，用于实时监控和分析链上交易，识别潜在风险。

## 功能特点

- 实时交易监控
- 智能风险分析
- 多维度画像分析
- 自动化风险预警
- 可配置的通知渠道

## 快速开始

### 环境要求

- Node.js >= 16
- TypeScript >= 4.5
- Yarn >= 1.22

### 安装依赖

```bash
cd backend
yarn install
```

### 运行测试

```bash
yarn test
```

### 启动服务

```bash
yarn start
```

## 测试覆盖率

项目已接入自动化测试覆盖率报告，可通过以下方式查看：

### 本地查看覆盖率

运行测试并生成覆盖率报告：

```bash
yarn test --coverage
```

覆盖率报告位置：

- HTML 报告：`/backend/tests/coverage/lcov-report/index.html`
- LCOV 报告：`/backend/tests/coverage/lcov.info`

### 覆盖率标准

项目设定了严格的测试覆盖率标准：

- Statements: ≥ 85%
- Branches: ≥ 80%
- Functions: ≥ 85%
- Lines: ≥ 85%

如果覆盖率未达标，CI 流程会自动失败。

## CI 自动化测试

项目配置了完整的 CI 自动化测试流程：

### 触发条件

- Push 到主分支
- Pull Request 到主分支

### CI 流程

1. 安装项目依赖
2. 运行全部测试
3. 生成覆盖率报告
4. 检查覆盖率是否达标
5. 上传测试报告到 Artifacts

### 通知机制

- 测试失败时自动发送通知
- 覆盖率未达标时发送警告
- 支持多种通知渠道（Slack/钉钉/飞书）

### 查看测试报告

1. 访问 GitHub Actions 页面
2. 选择对应的工作流运行记录
3. 在 Artifacts 中下载覆盖率报告

## 项目结构

```
backend/
├── pipeline/        # 核心管道处理
├── analyzer/        # 风险分析模块
├── notifier/        # 通知模块
├── utils/          # 工具函数
└── tests/          # 测试文件
    ├── unit/       # 单元测试
    ├── integration/# 集成测试
    └── coverage/   # 覆盖率报告
```

## 贡献指南

详细的开发和测试流程请参考 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 许可证

MIT License
