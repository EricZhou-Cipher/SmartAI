/**
 * API 测试
 */
import { rest } from "msw";
import { setupServer } from "msw/node";
import { transactionsApi, addressApi } from "../services/api";

// 模拟 API 服务器
const server = setupServer(
  // 交易列表
  rest.get("http://localhost:5001/api/transactions", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        transactions: [
          {
            _id: "1",
            txHash: "0x123456789abcdef",
            from: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            to: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
            amount: 1.5,
            currency: "ETH",
            timestamp: new Date().toISOString(),
            blockNumber: 12345678,
            riskLevel: "low",
          },
        ],
        pagination: {
          totalItems: 1,
          totalPages: 1,
          currentPage: 1,
          limit: 10,
          startIndex: 0,
          endIndex: 0,
        },
      })
    );
  }),

  // 单个交易
  rest.get("http://localhost:5001/api/transactions/:id", (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        transaction: {
          _id: id,
          txHash: "0x123456789abcdef",
          from: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
          to: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
          amount: 1.5,
          currency: "ETH",
          timestamp: new Date().toISOString(),
          blockNumber: 12345678,
          riskLevel: "low",
        },
      })
    );
  }),

  // 地址信息
  rest.get("http://localhost:5001/api/address/:address", (req, res, ctx) => {
    const { address } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        address: {
          address,
          balance: 10.5,
          currency: "ETH",
          transactionCount: 25,
          firstTransaction: new Date("2022-01-01").toISOString(),
          lastTransaction: new Date().toISOString(),
          tags: ["exchange", "whale"],
        },
      })
    );
  }),

  // 地址风险分析
  rest.get(
    "http://localhost:5001/api/address/:address/analyze",
    (req, res, ctx) => {
      const { address } = req.params;
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          address,
          riskScore: 25,
          riskFactors: [
            {
              type: "exchange",
              name: "交易所地址",
              description: "该地址与已知交易所相关联",
            },
          ],
          tags: ["exchange", "whale"],
          transactionCount: 25,
          totalAmount: 100.5,
          currency: "ETH",
          firstTransaction: new Date("2022-01-01").toISOString(),
          lastTransaction: new Date().toISOString(),
          relatedAddresses: [
            {
              address: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
              transactionCount: 5,
              tags: ["exchange"],
            },
          ],
        })
      );
    }
  ),

  // 地址交易
  rest.get(
    "http://localhost:5001/api/address/:address/transactions",
    (req, res, ctx) => {
      const { address } = req.params;
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          address,
          transactions: [
            {
              _id: "1",
              txHash: "0x123456789abcdef",
              from: address,
              to: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
              amount: 1.5,
              currency: "ETH",
              timestamp: new Date().toISOString(),
              blockNumber: 12345678,
              riskLevel: "low",
            },
          ],
          pagination: {
            totalItems: 1,
            totalPages: 1,
            currentPage: 1,
            limit: 10,
            startIndex: 0,
            endIndex: 0,
          },
        })
      );
    }
  )
);

// 启动服务器
beforeAll(() => server.listen());
// 每个测试后重置处理程序
afterEach(() => server.resetHandlers());
// 关闭服务器
afterAll(() => server.close());

describe("API 服务", () => {
  describe("交易 API", () => {
    test("fetchTransactions 应返回交易列表", async () => {
      const response = await transactionsApi.fetchTransactions();
      expect(response.success).toBe(true);
      expect(response.transactions).toHaveLength(1);
      expect(response.pagination).toBeDefined();
    });

    test("fetchTransaction 应返回单个交易", async () => {
      const response = await transactionsApi.fetchTransaction("1");
      expect(response.success).toBe(true);
      expect(response.transaction._id).toBe("1");
    });
  });

  describe("地址 API", () => {
    const testAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

    test("fetchAddress 应返回地址信息", async () => {
      const response = await addressApi.fetchAddress(testAddress);
      expect(response.success).toBe(true);
      expect(response.address.address).toBe(testAddress);
    });

    test("fetchAddressRisk 应返回地址风险分析", async () => {
      const response = await addressApi.fetchAddressRisk(testAddress);
      expect(response.success).toBe(true);
      expect(response.address).toBe(testAddress);
      expect(response.riskScore).toBeDefined();
      expect(response.riskFactors).toBeDefined();
    });

    test("fetchAddressTransactions 应返回地址相关交易", async () => {
      const response = await addressApi.fetchAddressTransactions(testAddress);
      expect(response.success).toBe(true);
      expect(response.address).toBe(testAddress);
      expect(response.transactions).toHaveLength(1);
      expect(response.pagination).toBeDefined();
    });
  });

  describe("错误处理", () => {
    test("应处理 API 错误", async () => {
      // 模拟 API 错误
      server.use(
        rest.get("http://localhost:5001/api/transactions", (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({
              success: false,
              message: "服务器错误",
            })
          );
        })
      );

      try {
        await transactionsApi.fetchTransactions();
      } catch (error) {
        expect(error.status).toBe(500);
        expect(error.message).toBe("服务器错误");
      }
    });
  });
});
