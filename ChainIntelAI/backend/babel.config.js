/**
 * Babel配置文件
 * 确保CommonJS模块转换正确工作
 */

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: 'current' },
        modules: 'commonjs', // 强制使用commonjs模块格式
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
  ],
  // 确保转换所有文件，包括node_modules中需要的包
  only: ['./src/**/*.ts', './src/**/*.js', './tests/**/*.ts', './tests/**/*.js'],
  // 设置sourceMaps以便正确生成覆盖率报告
  sourceMaps: 'inline',
  // 明确设置模块类型
  sourceType: 'unambiguous',
};
