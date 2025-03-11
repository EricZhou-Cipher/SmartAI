"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { useAuth } from "../services/authContext";
import apiClient from "../services/apiClient";

export default function AddressesPage() {
  const [address, setAddress] = useState("");
  const [blockchain, setBlockchain] = useState("ethereum");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recentAddresses, setRecentAddresses] = useState([]);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (isAuthenticated) {
      fetchRecentAddresses();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchRecentAddresses = async () => {
    try {
      const response = await apiClient.get("/api/addresses/recent");
      setRecentAddresses(response.data || []);
    } catch (error) {
      console.error("获取最近分析地址失败:", error);
      // 设置模拟数据用于演示
      setMockRecentAddresses();
    }
  };

  const setMockRecentAddresses = () => {
    setRecentAddresses([
      {
        id: "1",
        address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        blockchain: "ethereum",
        riskLevel: "中风险",
        riskScore: 65,
        analyzedAt: "2023-11-15T08:30:00Z",
        tags: ["交易所", "DeFi用户"],
      },
      {
        id: "2",
        address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        blockchain: "bitcoin",
        riskLevel: "低风险",
        riskScore: 25,
        analyzedAt: "2023-11-14T14:45:00Z",
        tags: ["长期持有"],
      },
      {
        id: "3",
        address: "0x8Ba1f109551bD432803012645Ac136ddd64DBA72",
        blockchain: "ethereum",
        riskLevel: "高风险",
        riskScore: 85,
        analyzedAt: "2023-11-13T19:20:00Z",
        tags: ["混币器", "可疑活动"],
      },
    ]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // 验证地址格式
    const ethereumRegex = /^0x[a-fA-F0-9]{40}$/;
    const bitcoinRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;

    let isValid = false;

    if (blockchain === "ethereum" && ethereumRegex.test(address)) {
      isValid = true;
    } else if (blockchain === "bitcoin" && bitcoinRegex.test(address)) {
      isValid = true;
    }

    if (!isValid) {
      setError(
        `无效的${blockchain === "ethereum" ? "以太坊" : "比特币"}地址格式`
      );
      return;
    }

    // 导航到地址详情页
    router.push(`/address/${address}?blockchain=${blockchain}`);
  };

  const handleExampleAddress = (exampleAddress, chain) => {
    setAddress(exampleAddress);
    setBlockchain(chain);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="addresses" />

      <div className="container mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold mb-6">地址分析</h2>

        {/* 搜索框 */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <input
                  type="text"
                  placeholder="输入区块链地址 (例如: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e)"
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={blockchain}
                  onChange={(e) => setBlockchain(e.target.value)}
                >
                  <option value="ethereum">以太坊</option>
                  <option value="bitcoin">比特币</option>
                </select>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? "分析中..." : "分析"}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-3 text-red-500 text-sm">
                <p>{error}</p>
              </div>
            )}

            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">示例地址:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleExampleAddress(
                      "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                      "ethereum"
                    )
                  }
                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition duration-200"
                >
                  以太坊示例
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleExampleAddress(
                      "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
                      "bitcoin"
                    )
                  }
                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition duration-200"
                >
                  比特币示例
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* 最近分析的地址 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">最近分析的地址</h3>
          </div>

          {recentAddresses.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    地址
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    区块链
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    风险等级
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    分析时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentAddresses.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {item.address.substring(0, 8)}...
                      {item.address.substring(item.address.length - 6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.blockchain === "ethereum" ? "以太坊" : "比特币"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.riskLevel === "高风险"
                            ? "bg-red-100 text-red-800"
                            : item.riskLevel === "中风险"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {item.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.analyzedAt).toLocaleString("zh-CN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() =>
                          router.push(
                            `/address/${item.address}?blockchain=${item.blockchain}`
                          )
                        }
                        className="text-blue-600 hover:text-blue-800 transition duration-200"
                      >
                        查看详情
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">暂无分析记录</div>
          )}
        </div>
      </div>
    </div>
  );
}
