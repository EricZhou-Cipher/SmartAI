export default {
  // 指定测试环境
  testEnvironment: "node",

  // 测试文件匹配模式
  testMatch: ["**/tests/**/*.test.js", "**/tests/**/*.spec.js"],

  // 覆盖率收集配置
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "clover"],

  // 覆盖率收集范围
  collectCoverageFrom: [
    "listener.js",
    "aiAnalysis.js",
    "notifier.js",
    "db.js",
    "config/**/*.js",
    "!**/node_modules/**",
  ],

  // 转换配置
  transform: {
    "^.+\\.js$": "babel-jest",
  },

  // 模块路径映射
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  // 测试超时设置
  testTimeout: 10000,

  // 并发执行测试
  maxConcurrency: 1,

  // 测试报告格式
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "coverage",
        outputName: "junit.xml",
        classNameTemplate: "{classname}",
        titleTemplate: "{title}",
      },
    ],
  ],
};
