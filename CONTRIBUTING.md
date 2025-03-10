# 贡献指南

感谢您对 ChainIntelAI 项目的关注！我们欢迎各种形式的贡献，包括但不限于代码贡献、文档改进、问题报告和功能建议。本指南将帮助您了解如何参与项目开发。

## 行为准则

参与本项目的所有贡献者都应遵循以下行为准则：

- 尊重所有项目参与者，不论其经验水平、性别、性取向、残疾状况、外表、种族或宗教信仰
- 使用包容性语言，避免冒犯性或排他性表达
- 接受建设性批评，将重点放在改进代码和项目上
- 以社区的最佳利益为出发点行事

## 如何贡献

### 报告问题

如果您发现了 bug 或有功能建议，请通过 GitHub Issues 提交。提交问题时，请包含以下信息：

1. 问题的简短描述
2. 重现步骤（如适用）
3. 预期行为与实际行为
4. 环境信息（操作系统、Node.js 版本等）
5. 相关的日志或截图

### 提交代码

1. Fork 项目仓库
2. 创建您的特性分支：`git checkout -b feature/amazing-feature`
3. 提交您的更改：`git commit -m 'Add some amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 创建 Pull Request

### Pull Request 流程

1. 确保您的代码符合项目的代码风格
2. 更新文档以反映您的更改（如适用）
3. 添加或更新测试以覆盖您的更改
4. 确保所有测试都能通过
5. 提交 Pull Request 并填写相关信息

## 开发环境设置

请参考 [README.md](README.md) 中的开发指南部分，了解如何设置开发环境。

## 代码风格

本项目使用 ESLint 和 Prettier 来保持代码风格的一致性。在提交代码前，请确保运行以下命令：

```bash
yarn lint
```

## 测试

所有新功能和 bug 修复都应包含测试。请确保您的代码通过所有现有测试，并为新功能添加适当的测试。

运行测试：

```bash
yarn test
```

检查测试覆盖率：

```bash
yarn test:coverage
```

## 文档

如果您的更改影响了用户体验或 API，请更新相应的文档。文档位于 `docs/` 目录中。

## 分支策略

- `main`: 稳定版本分支，只接受经过充分测试的合并请求
- `develop`: 开发分支，新功能和 bug 修复应基于此分支创建
- `feature/*`: 特性分支，用于开发新功能
- `bugfix/*`: 修复分支，用于修复 bug
- `release/*`: 发布分支，用于准备新版本发布

## 版本控制

本项目遵循 [语义化版本控制](https://semver.org/lang/zh-CN/) 规范。

## 发布流程

1. 从 `develop` 分支创建 `release/x.y.z` 分支
2. 在发布分支上进行最终测试和修复
3. 将发布分支合并到 `main` 分支
4. 在 `main` 分支上创建版本标签
5. 将 `main` 分支的更改合并回 `develop` 分支

## 联系方式

如果您有任何问题或需要帮助，请通过以下方式联系我们：

- GitHub Issues
- 电子邮件：[your-email@example.com](mailto:your-email@example.com)

感谢您的贡献！
