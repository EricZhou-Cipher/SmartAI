"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/apiClient";

/**
 * 交易监控页面
 * @returns {JSX.Element} - 页面组件
 */
const TransactionsPage = () => {
  const router = useRouter();
  const { user, loading: authLoading, isMockMode } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 分页和筛选状态
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    blockchain: "",
    riskLevel: "",
    dateFrom: "",
    dateTo: "",
  });

  // 排序状态
  const [sortBy, setSortBy] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    // 如果用户未登录且认证加载完成，重定向到登录页面
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    // 如果用户已登录，获取交易数据
    if (user) {
      fetchTransactions();
    }
  }, [user, authLoading, router, pagination.page, sortBy, sortOrder]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // 构建查询参数
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sort: sortBy,
        order: sortOrder,
        ...filters,
      };

      // 移除空值
      Object.keys(params).forEach((key) => {
        if (!params[key]) {
          delete params[key];
        }
      });

      // 获取交易数据
      const response = await apiClient.transactions.getAll(params);

      if (response.success) {
        setTransactions(response.data);
        setPagination({
          ...pagination,
          total: response.total || 0,
          totalPages: response.pagination?.totalPages || 1,
        });
      }
    } catch (err) {
      console.error("获取交易数据失败:", err);
      setError("获取数据失败，请稍后再试");

      // 如果是模拟模式，设置模拟数据
      if (isMockMode) {
        setMockData();
      }
    } finally {
      setLoading(false);
    }
  };

  const setMockData = () => {
    // 模拟交易数据
    const mockTransactions = [
      {
        _id: "tx_1",
        hash: "0x7a2d8d9e5f3e1b2c8a7f6d4e3c2b1a9f8e7d6c5b",
        blockchain: "Ethereum",
        fromAddress: "0x8b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
        toAddress: "0x5e9f8d7c6b5a4e3d2c1b0a9f8e7d6c5b4a3f2e1d",
        amount: 1.5,
        amountUSD: 2750.25,
        timestamp: "2023-06-15T10:30:00.000Z",
        status: "confirmed",
        riskScore: 25,
        riskLevel: "low",
        tags: ["defi", "swap"],
      },
      {
        _id: "tx_2",
        hash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
        blockchain: "Ethereum",
        fromAddress: "0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1",
        toAddress: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0",
        amount: 0.75,
        amountUSD: 1375.12,
        timestamp: "2023-06-16T14:45:00.000Z",
        status: "confirmed",
        riskScore: 65,
        riskLevel: "medium",
        tags: ["exchange", "withdrawal"],
      },
      {
        _id: "tx_3",
        hash: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
        blockchain: "Bitcoin",
        fromAddress: "bc1q9h5yjfnmn984ct2hfgjkl3mxwrw9j8a7sdx9v",
        toAddress: "bc1q8z7n6c5x4v3m2l1k0j9g8h7f6d5s4a3w2e1r",
        amount: 0.05,
        amountUSD: 1500,
        timestamp: "2023-06-17T09:15:00.000Z",
        status: "confirmed",
        riskScore: 85,
        riskLevel: "high",
        tags: ["mixer", "suspicious"],
      },
    ];

    setTransactions(mockTransactions);
    setPagination({
      ...pagination,
      total: 3,
      totalPages: 1,
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({
        ...pagination,
        page: newPage,
      });
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      // 如果已经按此字段排序，则切换排序顺序
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // 否则，按新字段排序，默认降序
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const applyFilters = () => {
    // 重置到第一页并应用筛选
    setPagination({
      ...pagination,
      page: 1,
    });
    fetchTransactions();
  };

  const resetFilters = () => {
    setFilters({
      blockchain: "",
      riskLevel: "",
      dateFrom: "",
      dateTo: "",
    });
    setPagination({
      ...pagination,
      page: 1,
    });
    // 重置后自动刷新数据
    fetchTransactions();
  };

  // 如果认证正在加载，显示加载状态
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // 如果用户未登录，不渲染内容（会被重定向）
  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">交易监控</h1>

      {isMockMode && (
        <div className="mb-6 p-3 bg-yellow-50 text-yellow-700 rounded-md">
          当前处于模拟数据模式，显示的是预设数据
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* 筛选器 */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label
              htmlFor="blockchain"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              区块链
            </label>
            <select
              id="blockchain"
              name="blockchain"
              value={filters.blockchain}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部</option>
              <option value="Ethereum">以太坊</option>
              <option value="Bitcoin">比特币</option>
              <option value="Tron">波场</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="riskLevel"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              风险等级
            </label>
            <select
              id="riskLevel"
              name="riskLevel"
              value={filters.riskLevel}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="dateFrom"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              开始日期
            </label>
            <input
              type="date"
              id="dateFrom"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="dateTo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              结束日期
            </label>
            <input
              type="date"
              id="dateTo"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={resetFilters}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            重置
          </button>
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            应用筛选
          </button>
        </div>
      </div>

      {/* 交易表格 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">加载中...</p>
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("hash")}
                  >
                    交易哈希
                    {sortBy === "hash" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("blockchain")}
                  >
                    区块链
                    {sortBy === "blockchain" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    发送方
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    接收方
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("amount")}
                  >
                    金额
                    {sortBy === "amount" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("timestamp")}
                  >
                    时间
                    {sortBy === "timestamp" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("riskScore")}
                  >
                    风险等级
                    {sortBy === "riskScore" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-blue-600 font-medium truncate max-w-xs">
                        {tx.hash}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {tx.blockchain}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 truncate max-w-xs">
                        {tx.fromAddress}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 truncate max-w-xs">
                        {tx.toAddress}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {tx.amount} (
                        {tx.amountUSD ? `$${tx.amountUSD.toFixed(2)}` : "-"})
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(tx.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          tx.riskLevel === "high"
                            ? "bg-red-100 text-red-800"
                            : tx.riskLevel === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {tx.riskLevel === "high"
                          ? "高"
                          : tx.riskLevel === "medium"
                          ? "中"
                          : "低"}
                      </span>
                      {tx.tags && tx.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {tx.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-800 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-600">暂无交易数据</p>
          </div>
        )}

        {/* 分页 */}
        {transactions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              显示 {(pagination.page - 1) * pagination.limit + 1} 到{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              条，共 {pagination.total} 条
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
