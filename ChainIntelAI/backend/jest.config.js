/**
 * Jest配置文件
 * 特别关注模块转换和覆盖率收集
 */

module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {
        configFile: './babel.config.js',
        // 确保babel-jest转换所有文件
        caller: {
          supportsDynamicImport: false,
          supportsStaticESM: false,
          supportsTopLevelAwait: false,
        },
      },
    ],
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  // 完全禁用transformIgnorePatterns，确保所有文件都被转换
  transformIgnorePatterns: [],
  // 添加额外设置以确保正确收集覆盖率
  collectCoverage: false,
  coverageReporters: ['text', 'lcov', 'clover'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/types/**',
  ],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  // 添加一些全局设置
  globals: {
    NODE_ENV: 'test',
  },
  // 添加setup文件
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // 添加模块目录，确保能找到@babel/plugin-transform-modules-commonjs
  modulePaths: ['<rootDir>/node_modules'],
  // 添加模块名称映射
  moduleNameMapper: {
    '^@babel/plugin-transform-modules-commonjs$': '<rootDir>/node_modules/@babel/plugin-transform-modules-commonjs',
  },
};
