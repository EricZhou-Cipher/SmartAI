# ChainIntel AI CI/CD 部署指南

本文档提供了设置 ChainIntel AI 项目 CI/CD 流程的详细指南。

## 目录

1. [GitHub Actions 配置](#github-actions-配置)
2. [前端部署 (Vercel)](#前端部署-vercel)
3. [后端部署 (Docker & 服务器)](#后端部署-docker--服务器)
4. [MongoDB 数据库部署](#mongodb-数据库部署)
5. [环境变量配置](#环境变量配置)

## GitHub Actions 配置

ChainIntel AI 使用 GitHub Actions 进行自动化测试、构建和部署。配置文件位于 `.github/workflows/` 目录下：

- `frontend.yml`: 前端 CI/CD 流程
- `backend.yml`: 后端 CI/CD 流程
- `ci.yml`: 通用 CI 流程

### 配置 GitHub Secrets

在 GitHub 仓库中设置以下 secrets：

1. 进入 GitHub 仓库 -> Settings -> Secrets and variables -> Actions
2. 点击 "New repository secret" 添加以下 secrets：

#### 前端部署 Secrets

- `VERCEL_TOKEN`: Vercel API 令牌
- `VERCEL_ORG_ID`: Vercel 组织 ID
- `VERCEL_PROJECT_ID`: Vercel 项目 ID

#### 后端部署 Secrets

- `DOCKER_HUB_USERNAME`: Docker Hub 用户名
- `DOCKER_HUB_TOKEN`: Docker Hub 访问令牌
- `SERVER_HOST`: 服务器 IP 地址
- `SERVER_USER`: SSH 用户名
- `SERVER_PASSWORD`: SSH 密码
- `MONGO_URI`: MongoDB 连接 URI
- `JWT_SECRET`: JWT 密钥

## 前端部署 (Vercel)

### 获取 Vercel 配置信息

1. 登录 [Vercel](https://vercel.com/)
2. 创建新项目或选择现有项目
3. 获取 Vercel 配置信息：
   - 在 Vercel 控制台 -> Settings -> General -> Project ID 获取 `VERCEL_PROJECT_ID`
   - 在 Vercel 控制台 -> Settings -> General -> Your Account -> User ID 获取 `VERCEL_ORG_ID`
   - 在 Vercel 控制台 -> Settings -> Tokens 创建并获取 `VERCEL_TOKEN`

## 后端部署 (Docker & 服务器)

### Docker Hub 配置

1. 登录 [Docker Hub](https://hub.docker.com/)
2. 创建一个新的仓库 `chainintelai-backend`
3. 在个人设置中创建访问令牌 (Access Token)

### 服务器配置

在服务器上执行以下步骤：

1. 安装 Docker:

   ```bash
   sudo apt update && sudo apt install -y docker.io
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

2. 创建 `.env` 文件存储环境变量：

   ```bash
   touch .env
   ```

3. 编辑 `.env` 文件，添加必要的环境变量：
   ```
   MONGO_URI=mongodb://username:password@host:port/database
   JWT_SECRET=your_jwt_secret
   NODE_ENV=production
   ```

## MongoDB 数据库部署

### 选项 1: MongoDB Atlas (推荐)

1. 创建 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 账户
2. 创建新集群
3. 设置数据库用户和密码
4. 配置网络访问 (IP 白名单)
5. 获取连接字符串 (MONGO_URI)

### 选项 2: 自托管 MongoDB

在服务器上安装 MongoDB:

```bash
sudo apt update && sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

## 环境变量配置

### 前端环境变量

在 Vercel 项目设置中配置以下环境变量：

- `NEXT_PUBLIC_API_URL`: 后端 API 地址

### 后端环境变量

在服务器的 `.env` 文件中配置：

- `MONGO_URI`: MongoDB 连接字符串
- `JWT_SECRET`: JWT 密钥
- `NODE_ENV`: 环境 (production)
- 其他必要的环境变量

## 完整 CI/CD 流程

1. 开发者提交代码到 GitHub 仓库
2. GitHub Actions 自动触发：
   - 运行测试
   - 构建应用
   - 部署到相应环境
3. 前端自动部署到 Vercel
4. 后端自动构建 Docker 镜像并部署到服务器

## 故障排除

如果 CI/CD 流程失败，请检查：

1. GitHub Actions 日志中的错误信息
2. 确保所有 secrets 和环境变量正确配置
3. 检查服务器和数据库连接是否正常
4. 验证 Docker 镜像是否正确构建和推送
