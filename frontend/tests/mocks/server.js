import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// 创建一个模拟服务器实例
export const server = setupServer(...handlers);

// 在所有测试之前启动服务器
beforeAll(() => server.listen());

// 每个测试之后重置处理程序
afterEach(() => server.resetHandlers());

// 在所有测试之后关闭服务器
afterAll(() => server.close());
