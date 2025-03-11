import "@testing-library/jest-dom";
import { server } from "./mocks/server";

// 启用 API 模拟
beforeAll(() => server.listen());
// 每次测试后重置处理程序
afterEach(() => server.resetHandlers());
// 清理
afterAll(() => server.close());

// Jest 测试设置文件
import "@testing-library/jest-dom";

// 模拟 ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// 模拟 IntersectionObserver
class IntersectionObserverMock {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

// 模拟 window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// 全局模拟
global.ResizeObserver = ResizeObserverMock;
global.IntersectionObserver = IntersectionObserverMock;

// 模拟 fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
    ok: true,
    status: 200,
    headers: new Headers(),
  })
);

// 清除所有模拟
beforeEach(() => {
  jest.clearAllMocks();
});

// 模拟 localStorage
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// 模拟 sessionStorage
Object.defineProperty(window, "sessionStorage", {
  value: localStorageMock,
});

// 模拟 console.error 以捕获测试中的错误
const originalConsoleError = console.error;
console.error = (...args) => {
  // 如果是测试相关的错误，但不是React警告，则抛出异常
  if (
    args[0] &&
    args[0].includes &&
    args[0].includes("Warning:") &&
    !args[0].includes(
      "Warning: An update to %s inside a test was not wrapped in act"
    )
  ) {
    throw new Error(args.join(" "));
  }
  originalConsoleError(...args);
};

// 模拟 window.scrollTo
window.scrollTo = jest.fn();
