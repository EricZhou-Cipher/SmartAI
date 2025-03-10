#!/bin/bash

# 运行所有测试的脚本
# 使用方法: ./run-all-tests.sh [--ci]

# 检查是否在CI环境中运行
CI_MODE=false
if [ "$1" == "--ci" ]; then
  CI_MODE=true
  echo "在CI环境中运行测试..."
else
  echo "在本地环境中运行测试..."
fi

# 设置颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# 创建结果目录
RESULTS_DIR="./test-results"
mkdir -p $RESULTS_DIR

# 获取当前时间戳
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# 运行单元测试和集成测试
echo -e "${YELLOW}运行单元测试和集成测试...${NC}"
if [ "$CI_MODE" == "true" ]; then
  yarn test:ci
else
  yarn test --coverage
fi

# 保存测试状态
TEST_STATUS=$?
if [ $TEST_STATUS -eq 0 ]; then
  echo -e "${GREEN}单元测试和集成测试通过!${NC}"
else
  echo -e "${RED}单元测试和集成测试失败!${NC}"
  exit $TEST_STATUS
fi

# 运行端到端测试
echo -e "${YELLOW}运行端到端测试...${NC}"
yarn test:e2e

# 保存测试状态
E2E_STATUS=$?
if [ $E2E_STATUS -eq 0 ]; then
  echo -e "${GREEN}端到端测试通过!${NC}"
else
  echo -e "${RED}端到端测试失败!${NC}"
  exit $E2E_STATUS
fi

# 如果不是在CI环境中，运行负载测试
if [ "$CI_MODE" == "false" ]; then
  echo -e "${YELLOW}运行负载测试...${NC}"
  
  # 启动API服务器（后台运行）
  echo "启动API服务器..."
  yarn build
  yarn start &
  API_PID=$!
  
  # 等待API服务器启动
  echo "等待API服务器启动..."
  sleep 10
  
  # 运行负载测试
  yarn test:load
  
  # 保存测试状态
  LOAD_STATUS=$?
  
  # 关闭API服务器
  echo "关闭API服务器..."
  kill $API_PID
  
  if [ $LOAD_STATUS -eq 0 ]; then
    echo -e "${GREEN}负载测试通过!${NC}"
  else
    echo -e "${RED}负载测试失败!${NC}"
    exit $LOAD_STATUS
  fi
fi

echo -e "${GREEN}所有测试通过!${NC}"
exit 0 