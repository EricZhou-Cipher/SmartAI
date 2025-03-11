module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.js' }],
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  testMatch: ['**/tests/**/*.test.js', '**/src/tests/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/tests/**', '!**/node_modules/**'],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30,
    },
  },
  setupFilesAfterEnv: ['./jest.setup.js'],
  testTimeout: 30000,
  transformIgnorePatterns: ['node_modules/(?!(axios|uuid|winston)/)'],
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
};
