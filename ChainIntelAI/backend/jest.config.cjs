module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
    '^.+\\.jsx?$': [
      'babel-jest',
      {
        presets: ['@babel/preset-env'],
        plugins: ['@babel/plugin-transform-modules-commonjs'],
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}', '!src/**/*.d.ts', '!src/tests/**'],
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  transformIgnorePatterns: [
    '/node_modules/(?!(jest-runner|@babel|uuid|ethers|@openzeppelin|@slack|telegraf|ts-retry-promise|ioredis|redis|mongoose|axios|zod)/)',
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
};
