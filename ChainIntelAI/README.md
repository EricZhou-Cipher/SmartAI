# ChainIntelAI - 区块链智能分析平台

![ChainIntelAI Logo](https://via.placeholder.com/800x200?text=ChainIntelAI)

ChainIntelAI 是一个高级区块链交易监控和风险分析平台，利用人工智能技术实时检测可疑交易和潜在威胁。该平台专为区块链安全团队、交易所和金融机构设计，提供全面的链上活动监控和风险评估解决方案。

## 🌟 核心功能

- **实时交易监控**：监控多链交易活动，实时捕获异常行为
- **AI 风险分析**：使用机器学习模型评估交易风险，识别潜在威胁
- **地址画像**：构建地址行为画像，追踪历史活动模式
- **多渠道告警**：支持 Slack、Feishu、DingTalk 等多种通知渠道
- **可扩展架构**：模块化设计，支持自定义规则和分析器

## 🏗️ 系统架构

ChainIntelAI 采用模块化架构设计，主要包含以下组件：

### 事件处理管道 (Pipeline)

- **EventNormalizer**: 标准化来自不同链的事件数据
- **EventPipeline**: 协调整个事件处理流程
- **PipelineMonitor**: 监控管道性能和健康状况
- **PipelineConfig**: 管理管道配置和参数

### 风险分析引擎 (Analyzer)

- **RiskAnalyzer**: 核心风险评估组件
- **RiskPatternAnalyzer**: 基于模式识别的风险分析
- **MLModel**: 机器学习模型集成
- **MEVDetector**: MEV 交易检测
- **TimeSeriesAnalyzer**: 时间序列分析

### 地址画像系统 (Profiling)

- **AddressProfiler**: 构建和维护地址行为画像
- **ProfileUpdater**: 更新地址画像信息

### 通知系统 (Notifier)

- **NotificationRouter**: 通知路由和分发
- **SlackClient**: Slack 集成
- **FeishuClient**: 飞书集成
- **DingTalkClient**: 钉钉集成

### 数据存储 (Database)

- **MongoDB**: 持久化存储
- **Redis**: 缓存和队列
- **DAO 层**: 数据访问对象

### 监控系统 (Monitoring)

- **PipelineMonitor**: 管道性能监控
- **Prometheus 集成**: 指标收集
- **Grafana 仪表盘**: 可视化监控

## 🚀 快速开始

### 环境要求

- Node.js v16+
- MongoDB v4.4+
- Redis v6+

### 本地启动指南

1. **克隆仓库**

```bash
git clone https://github.com/EricZhou-Cipher/ChainIntelAI.git
cd ChainIntelAI
```

2. **安装依赖**

```bash
# 安装后端依赖
yarn install

# 安装前端依赖
cd frontend
yarn install
cd ..
```

3. **配置环境变量**

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件，填入必要的配置
```

4. **启动服务**

```bash
# 启动后端服务
yarn start

# 在另一个终端启动前端服务
cd frontend
yarn dev
```

5. **访问应用**

- 后端 API: http://localhost:3000
- 前端界面: http://localhost:80
- API 文档: http://localhost:3000/api-docs

### Docker 部署方式

1. **克隆仓库**

```bash
git clone https://github.com/EricZhou-Cipher/ChainIntelAI.git
cd ChainIntelAI
```

2. **配置环境变量**

```bash
cp .env.example .env
# 编辑 .env 文件
```

3. **使用 Docker Compose 启动**

```bash
docker-compose up -d
```

4. **访问应用**

- 前端界面: http://localhost:80
- 后端 API: http://localhost:3000

详细的部署指南请参考 [DEPLOYMENT.md](DEPLOYMENT.md)。

### CI/CD 运行方式

本项目使用 GitHub Actions 进行持续集成和部署。CI/CD 流程配置在 `.github/workflows/ci.yml` 文件中。

**CI 流程**:

1. 代码推送到 GitHub 仓库
2. GitHub Actions 自动运行测试
3. 生成测试覆盖率报告
4. 检查覆盖率是否达到阈值
5. 构建 Docker 镜像

**手动触发 CI**:

1. 在 GitHub 仓库页面，点击 "Actions" 标签
2. 选择 "CI" 工作流
3. 点击 "Run workflow" 按钮
4. 选择分支并点击 "Run workflow"

## 📊 测试覆盖率

项目当前测试覆盖率：

- **语句覆盖率**: 55.66%
- **分支覆盖率**: 35.12%
- **函数覆盖率**: 51.08%
- **行覆盖率**: 56.72%

运行测试：

```bash
# 运行所有测试
yarn test

# 查看测试覆盖率
yarn test:coverage
```

## 📁 项目结构

```
ChainIntelAI/
├── backend/                # 后端服务
│   ├── src/                # 源代码
│   │   ├── analyzer/       # 风险分析引擎
│   │   ├── config/         # 配置管理
│   │   ├── database/       # 数据库访问层
│   │   ├── monitoring/     # 监控系统
│   │   ├── notifier/       # 通知系统
│   │   ├── pipeline/       # 事件处理管道
│   │   ├── profiling/      # 地址画像系统
│   │   ├── tests/          # 测试文件
│   │   ├── types/          # 类型定义
│   │   └── utils/          # 工具函数
│   ├── docs/               # 文档
│   ├── hardhat/            # 智能合约开发环境
│   └── jest.setup.js       # Jest 测试配置
├── frontend/               # 前端应用
│   ├── app/                # Next.js 应用
│   ├── public/             # 静态资源
│   └── package.json        # 前端依赖
├── docker-compose.yml      # Docker Compose 配置
├── .github/                # GitHub Actions 配置
├── .env.example            # 环境变量示例
└── README.md               # 项目说明
```

## 📝 API 文档

API 文档使用 Swagger 生成，可在开发环境中访问：

```
http://localhost:3000/api-docs
```

## 🔧 配置

ChainIntelAI 支持多种配置选项，可通过环境变量或配置文件进行设置：

- **数据库连接**：MongoDB 和 Redis 连接配置
- **区块链节点**：支持的区块链和节点 URL
- **通知渠道**：Slack、Feishu、DingTalk 等配置
- **风险分析参数**：风险评分阈值和规则配置

详细配置请参考 `docs/configuration.md`。

## 🤝 贡献指南

我们欢迎社区贡献！如果您想参与项目开发，请遵循以下步骤：

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

详细的贡献指南请参考 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 📄 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。

## 📞 联系方式

- **项目维护者**: Eric Zhou
- **GitHub**: [EricZhou-Cipher](https://github.com/EricZhou-Cipher)
- **Email**: [your-email@example.com](mailto:your-email@example.com)

---

© 2025 ChainIntelAI. All Rights Reserved.

## �� 测试框架

ChainIntelAI 采用全面的测试策略，确保系统的稳定性和可靠性：

### 测试类型

- **单元测试**：测试单个函数和组件的功能
- **集成测试**：测试多个组件之间的交互
- **端到端测试**：测试完整的 API 流程
- **性能测试**：测试 API 在负载下的表现

### 运行测试

```bash
# 运行所有测试
cd backend
yarn test

# 运行端到端测试
yarn test:e2e

# 运行负载测试
yarn test:load

# 使用Docker运行测试
yarn test:docker
```

### CI/CD 集成

所有测试已集成到 GitHub Actions 工作流程中，每次代码提交和拉取请求都会自动运行测试。

详细的测试文档可在 `backend/TESTING.md` 中找到。
