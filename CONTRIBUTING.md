# 贡献指南

感谢您对 ChainIntelAI 项目的关注！本文档将指导您如何参与项目开发和贡献代码。

## 开发环境设置

### 必要条件

- Node.js >= 16
- TypeScript >= 4.5
- Yarn >= 1.22

### 本地开发

1. 克隆仓库

```bash
git clone https://github.com/your-org/ChainIntelAI.git
cd ChainIntelAI
```

2. 安装依赖

```bash
cd backend
yarn install
```

3. 运行测试

```bash
yarn test
```

## 代码质量要求

### TypeScript 规范

- 启用严格模式 (`strict: true`)
- 所有函数必须有类型声明
- 避免使用 `any` 类型
- 使用接口而不是类型别名

### 测试要求

1. 单元测试覆盖率要求：

   - Statements: ≥ 85%
   - Branches: ≥ 80%
   - Functions: ≥ 85%
   - Lines: ≥ 85%

2. 测试用例规范：

   - 描述清晰的测试名称
   - 完整的输入输出验证
   - 异常情况处理测试
   - 边界条件测试

3. 本地运行测试：

```bash
# 运行所有测试
yarn test

# 运行带覆盖率的测试
yarn test --coverage

# 运行特定测试文件
yarn test path/to/test.test.ts
```

### 代码风格

- 使用 ESLint 和 Prettier 进行代码格式化
- 提交前运行 `yarn lint` 检查代码风格
- 遵循项目现有的代码组织结构

## 提交规范

### 分支管理

- `main`: 主分支，保持稳定
- `feature/*`: 新功能开发
- `fix/*`: Bug 修复
- `docs/*`: 文档更新
- `test/*`: 测试相关

### Commit 消息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

类型（type）：

- feat: 新功能
- fix: Bug 修复
- docs: 文档更新
- test: 测试相关
- refactor: 代码重构
- style: 代码格式
- chore: 构建过程或辅助工具的变动

### Pull Request 流程

1. 创建功能分支

```bash
git checkout -b feature/your-feature
```

2. 开发并提交代码

```bash
git add .
git commit -m "feat(scope): your changes"
```

3. 推送到远程

```bash
git push origin feature/your-feature
```

4. 创建 Pull Request

   - 填写清晰的标题和描述
   - 关联相关 Issue
   - 等待 CI 检查通过
   - 请求代码审查

5. 合并要求
   - 所有测试通过
   - 覆盖率达标
   - 至少一个审查者批准
   - 无合并冲突

## CI/CD 流程

### 自动化测试

每次 PR 和推送到主分支时会自动运行：

1. 安装依赖
2. 运行所有测试
3. 检查覆盖率
4. 生成测试报告

### 覆盖率报告

1. 本地查看

```bash
yarn test --coverage
open backend/tests/coverage/lcov-report/index.html
```

2. CI 中查看
   - 访问 GitHub Actions
   - 下载 Artifacts 中的覆盖率报告

### 通知机制

测试结果会通过以下渠道通知：

- GitHub PR 状态更新
- Slack 通知（如果配置）
- 钉钉/飞书通知（如果配置）

## 文档维护

- 代码变更时更新相关文档
- 保持 README.md 最新
- 添加必要的注释和类型说明
- 更新 API 文档（如果有）

## 问题反馈

- 使用 GitHub Issues 报告问题
- 提供复现步骤和环境信息
- 标记适当的标签
- 关注问题的后续进展

## 联系方式

- 技术讨论：GitHub Discussions
- 即时通讯：Slack Channel
- 邮件列表：dev@chainintel.ai

感谢您的贡献！
