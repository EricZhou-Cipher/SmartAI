/**
 * Babel解析器扩展文件
 * 用于在CI和测试环境中更精确地控制模块解析
 */

const path = require('path');
const fs = require('fs');

// 定义关键Babel模块的解析路径
const moduleMap = {
  '@babel/plugin-transform-modules-commonjs': path.resolve(
    __dirname,
    'node_modules/@babel/plugin-transform-modules-commonjs'
  ),
  '@babel/core': path.resolve(__dirname, 'node_modules/@babel/core'),
  '@babel/preset-env': path.resolve(__dirname, 'node_modules/@babel/preset-env'),
  '@babel/preset-typescript': path.resolve(__dirname, 'node_modules/@babel/preset-typescript'),
  'babel-jest': path.resolve(__dirname, 'node_modules/babel-jest'),
};

// 用于查找依赖的函数
function resolveModule(name) {
  if (moduleMap[name]) {
    if (fs.existsSync(moduleMap[name])) {
      return moduleMap[name];
    }
    console.warn(`已映射但路径不存在: ${name} -> ${moduleMap[name]}`);
  }

  try {
    return require.resolve(name, { paths: [__dirname, path.resolve(__dirname, 'node_modules')] });
  } catch (err) {
    console.error(`无法解析模块: ${name}`, err.message);
    throw err;
  }
}

// 帮助函数:列出模块可能的位置
function debugModulePaths(name) {
  const possiblePaths = [
    path.resolve(__dirname, 'node_modules', name),
    path.resolve(__dirname, 'node_modules', '@babel', name.replace('@babel/', '')),
    path.resolve(__dirname, '..', 'node_modules', name),
    path.resolve(__dirname, '..', 'node_modules', '@babel', name.replace('@babel/', '')),
    path.resolve(process.env.NODE_PATH || '', name),
  ];

  const existingPaths = possiblePaths.filter((p) => fs.existsSync(p));
  console.log(`模块 ${name} 可能的路径:`, existingPaths);

  return existingPaths.length > 0 ? existingPaths[0] : null;
}

// 导出助手函数
module.exports = {
  resolveModule,
  debugModulePaths,
  moduleMap,
};
