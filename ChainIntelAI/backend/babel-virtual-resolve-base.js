/**
 * Babel虚拟解析基础文件
 * 用于帮助Jest和Babel正确解析模块依赖
 */

const path = require('path');

// 定义模块解析路径
const moduleResolvers = {
  // 确保@babel模块可以被正确找到
  '@babel/plugin-transform-modules-commonjs': path.resolve(
    __dirname,
    'node_modules/@babel/plugin-transform-modules-commonjs'
  ),
  '@babel/core': path.resolve(__dirname, 'node_modules/@babel/core'),
  '@babel/preset-env': path.resolve(__dirname, 'node_modules/@babel/preset-env'),
  '@babel/preset-typescript': path.resolve(__dirname, 'node_modules/@babel/preset-typescript'),
  '@babel/plugin-transform-runtime': path.resolve(
    __dirname,
    'node_modules/@babel/plugin-transform-runtime'
  ),
  '@babel/plugin-proposal-class-properties': path.resolve(
    __dirname,
    'node_modules/@babel/plugin-proposal-class-properties'
  ),
  '@babel/plugin-proposal-object-rest-spread': path.resolve(
    __dirname,
    'node_modules/@babel/plugin-proposal-object-rest-spread'
  ),
  'babel-jest': path.resolve(__dirname, 'node_modules/babel-jest'),
};

// 导出所有的模块路径
module.exports = moduleResolvers;
