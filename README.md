# SmartAI - 区块链风险智能分析平台

![版本](https://img.shields.io/badge/版本-1.0.0-blue.svg)
![测试](https://img.shields.io/badge/测试-通过-green.svg)
![许可证](https://img.shields.io/badge/许可证-MIT-yellow.svg)

SmartAI 是一个区块链风险智能分析平台，专注于"聪明钱"识别、投资组合分析和风险评估。本平台帮助用户洞察市场中成功投资者的交易行为，并提供专业的加密资产风险分析。

## 🚀 功能亮点

- **聪明钱识别**：追踪和分析成功加密货币投资者的交易行为
- **投资组合分析**：提供详细的加密资产投资组合分析
- **风险评估**：评估不同加密资产和交易的风险度
- **交易模式分析**：识别常见交易模式并预测市场趋势

## 📋 项目架构

项目采用现代化全栈架构：

- **前端**：React + Next.js + Chakra UI
- **后端**：Node.js + Express + TypeScript
- **数据库**：MongoDB + Redis
- **区块链交互**：Web3.js + Ethers.js

## 🔧 快速开始

### 前提条件

- Node.js 16+
- Yarn
- Docker & Docker Compose (可选)

### 本地开发环境设置

1. 克隆仓库

   ```bash
   git clone https://github.com/EricZhou-Cipher/SmartAI.git
   cd SmartAI
   ```

2. 安装依赖

   ```bash
   yarn install
   ```

3. 设置环境变量

   ```bash
   cp .env.example .env
   # 编辑.env文件，填入必要的API密钥和配置
   ```

4. 启动开发服务器

   ```bash
   # 启动前端
   cd frontend
   yarn dev

   # 启动后端 (新终端)
   cd backend
   yarn dev
   ```

5. 使用 Docker 启动 (可选)
   ```bash
   docker-compose up -d
   ```

### 测试

```bash
# 运行所有测试
yarn test

# 运行前端测试
cd frontend && yarn test

# 运行后端测试
cd backend && yarn test
```

## 📚 项目文档

- [项目架构](docs/ARCHITECTURE.md) - 系统架构与组件交互
- [API 文档](docs/api.md) - API 端点与使用说明
- [配置指南](docs/configuration.md) - 环境配置与设置
- [CI/CD 文档](docs/CI_CD.md) - 持续集成与部署流程
- [快速入门](QUICKSTART.md) - 详细的项目启动指南
- [部署指南](DEPLOYMENT.md) - 生产环境部署步骤

## 📜 许可证

本项目采用 MIT 许可证 - 详情见[LICENSE](LICENSE)文件

---

© 2025 SmartAI. 保留所有权利。
