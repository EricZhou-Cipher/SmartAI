FROM node:18-alpine

# 安装 yarn
RUN apk add --no-cache yarn

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --production

COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"] 