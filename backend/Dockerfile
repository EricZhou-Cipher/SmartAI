FROM node:20

WORKDIR /app

# 安装依赖
COPY package.json yarn.lock ./
RUN yarn install

# 复制源代码
COPY . .

# 创建日志目录
RUN mkdir -p logs

# 设置环境变量
ENV NODE_ENV=production

# 启动命令
CMD ["node", "replayHistoricalEvents.js"] 