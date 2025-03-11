"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/apiClient";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, isMockMode } = useAuth();

  const [stats, setStats] = useState({
    totalTransactions: 0,
    highRiskTransactions: 0,
    monitoredAddresses: 0,
    alerts: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 如果用户未登录且认证加载完成，重定向到登录页面
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    // 如果用户已登录，获取仪表盘数据
    if (user) {
      fetchDashboardData();
    }
  }, [user, authLoading, router]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 获取交易数据
      const transactionsResponse = await apiClient.transactions.getAll({
        limit: 5,
      });

      if (transactionsResponse.success) {
        setRecentTransactions(transactionsResponse.data);

        // 计算高风险交易数量
        const highRiskCount = transactionsResponse.data.filter(
          (tx) => tx.riskLevel === "high"
        ).length;

        // 设置统计数据
        setStats({
          totalTransactions:
            transactionsResponse.total || transactionsResponse.data.length,
          highRiskTransactions: highRiskCount,
          monitoredAddresses: 5, // 模拟数据
          alerts: 2, // 模拟数据
        });
      }
    } catch (err) {
      console.error("获取仪表盘数据失败:", err);
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
      },
    ];

    setRecentTransactions(mockTransactions);
    setStats({
      totalTransactions: 156,
      highRiskTransactions: 12,
      monitoredAddresses: 28,
      alerts: 5,
    });
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
      <h1 className="text-2xl font-bold mb-6">仪表盘</h1>

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

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-medium">总交易数</h3>
          <p className="text-3xl font-bold text-gray-800">
            {stats.totalTransactions}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <h3 className="text-gray-500 text-sm font-medium">高风险交易</h3>
          <p className="text-3xl font-bold text-gray-800">
            {stats.highRiskTransactions}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-medium">监控地址</h3>
          <p className="text-3xl font-bold text-gray-800">
            {stats.monitoredAddresses}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <h3 className="text-gray-500 text-sm font-medium">未处理告警</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.alerts}</p>
        </div>
      </div>

      {/* 最近交易 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">最近交易</h2>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">加载中...</p>
          </div>
        ) : recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    交易哈希
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    区块链
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金额
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    风险等级
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.map((tx) => (
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

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => router.push("/transactions")}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            查看所有交易 &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
