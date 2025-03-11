const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // 指向 Next.js 应用的路径
  dir: "./",
});

// Jest 配置
const customJestConfig = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: [
    "<rootDir>/tests/setup.js",
    "<rootDir>/tests/mocks/server.js",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/tests/__mocks__/fileMock.js",
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
  collectCoverageFrom: [
    "**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**",
    "!**/tests/setup.js",
    "!**/tests/mocks/**",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  verbose: true,
};

// 导出配置
module.exports = createJestConfig(customJestConfig);
