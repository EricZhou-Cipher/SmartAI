#!/bin/bash

# Babel测试脚本
# 此脚本用于验证Babel是否正确安装和配置

echo "===== Babel测试脚本 ====="

# 检查Node.js和Yarn版本
echo "Node.js版本:"
node -v
echo "Yarn版本:"
yarn -v

# 检查Babel安装情况
echo -e "\n===== 检查Babel包安装情况 ====="
find node_modules -name "@babel" -type d | sort
find node_modules -name "babel-*" | sort

# 检查@babel/core版本
echo -e "\n===== @babel/core版本 ====="
if [ -d "node_modules/@babel/core" ]; then
  grep -A 5 "\"version\"" node_modules/@babel/core/package.json
else
  echo "@babel/core 未找到！"
  echo "尝试安装 @babel/core..."
  yarn add @babel/core --dev
fi

# 检查babel-jest版本
echo -e "\n===== babel-jest版本 ====="
if [ -d "node_modules/babel-jest" ]; then
  grep -A 5 "\"version\"" node_modules/babel-jest/package.json
else
  echo "babel-jest 未找到！"
  echo "尝试安装 babel-jest..."
  yarn add babel-jest --dev
fi

# 检查Babel配置
echo -e "\n===== Babel配置文件 ====="
if [ -f "babel.config.js" ]; then
  cat babel.config.js
else
  echo "babel.config.js 不存在！"
  echo "创建 babel.config.js..."
  cat > babel.config.js << 'EOL'
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' }, modules: 'commonjs' }],
    '@babel/preset-typescript'
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-transform-modules-commonjs'
  ],
  sourceType: 'unambiguous'
};
EOL
  echo "babel.config.js 已创建"
fi

# 尝试编译测试文件
echo -e "\n===== 测试Babel编译 ====="
TEST_FILE="src/tests/babel-test.js"

if [ ! -f "$TEST_FILE" ]; then
  echo "测试文件 $TEST_FILE 不存在！"
  exit 1
fi

echo "使用 babel-node 运行测试文件..."
if [ -f "node_modules/.bin/babel-node" ]; then
  NODE_PATH=. ./node_modules/.bin/babel-node $TEST_FILE
else
  echo "babel-node 不可用，尝试安装..."
  yarn add @babel/node --dev
  NODE_PATH=. ./node_modules/.bin/babel-node $TEST_FILE
fi

echo -e "\n===== 使用 babel-cli 编译测试文件 ====="
if [ -f "node_modules/.bin/babel" ]; then
  ./node_modules/.bin/babel $TEST_FILE --out-file babel-test.compiled.js
  echo "编译后的文件:"
  cat babel-test.compiled.js
else
  echo "babel-cli 不可用，尝试安装..."
  yarn add @babel/cli --dev
  ./node_modules/.bin/babel $TEST_FILE --out-file babel-test.compiled.js
  echo "编译后的文件:"
  cat babel-test.compiled.js
fi

echo -e "\n===== Babel测试完成 =====" 