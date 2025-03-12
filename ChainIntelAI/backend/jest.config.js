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
  // 确保处理关键模块
  transformIgnorePatterns: [
    'node_modules/(?!(@opentelemetry|ethers|uuid|zod|mongoose|axios|redis|ioredis|telegraf|ts-retry-promise|prom-client)/)',
  ],
  // 添加额外设置以确保正确收集覆盖率
  collectCoverage: true,
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
};
