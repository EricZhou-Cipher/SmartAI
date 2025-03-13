"use client";
import { useState } from "react";

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);

  // 模拟交易数据
  const transactions = [
    {
      hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      chainId: "1",
      blockNumber: 12345678,
      from: "0xabcdef1234567890abcdef1234567890abcdef12",
      to: "0x7890abcdef1234567890abcdef1234567890abcd",
      value: "1.5",
      timestamp: 1634567890000,
      risk: {
        score: 0.75,
        level: "medium",
      },
    },
    {
      hash: "0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef",
      chainId: "1",
      blockNumber: 12345679,
      from: "0xbcdef1234567890abcdef1234567890abcdef123",
      to: "0x890abcdef1234567890abcdef1234567890abcde",
      value: "0.5",
      timestamp: 1634567900000,
      risk: {
        score: 0.2,
        level: "low",
      },
    },
    {
      hash: "0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef",
      chainId: "56",
      blockNumber: 8765432,
      from: "0xcdef1234567890abcdef1234567890abcdef1234",
      to: "0x90abcdef1234567890abcdef1234567890abcdef",
      value: "10.0",
      timestamp: 1634567910000,
      risk: {
        score: 0.9,
        level: "high",
      },
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery) return;

    // 模拟搜索结果
    const result = transactions.find(
      (tx) =>
        tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.to.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSearchResults(result ? [result] : []);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString("zh-CN");
  };

  const getRiskBadgeClass = (level) => {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskLevelText = (level) => {
    switch (level) {
      case "high":
        return "高风险";
      case "medium":
        return "中风险";
      case "low":
        return "低风险";
      default:
        return "未知";
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <div className="w-full max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">交易分析</h1>
          <p className="text-gray-600 mt-2">深入分析区块链交易，识别潜在风险</p>
        </header>

        {/* 搜索框 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="flex-grow">
              <label
                htmlFor="search"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                交易哈希 / 地址
              </label>
              <input
                type="text"
                id="search"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="输入交易哈希或地址..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
              >
                搜索
              </button>
            </div>
          </form>
        </div>

        {/* 搜索结果 */}
        {searchResults && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              搜索结果
            </h2>
            {searchResults.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        交易哈希
                      </th>
                      <th scope="col" className="px-6 py-3">
                        区块链
                      </th>
                      <th scope="col" className="px-6 py-3">
                        发送方
                      </th>
                      <th scope="col" className="px-6 py-3">
                        接收方
                      </th>
                      <th scope="col" className="px-6 py-3">
                        金额
                      </th>
                      <th scope="col" className="px-6 py-3">
                        时间
                      </th>
                      <th scope="col" className="px-6 py-3">
                        风险等级
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((tx) => (
                      <tr
                        key={tx.hash}
                        className="bg-white border-b hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 font-mono text-xs">{`${tx.hash.substring(
                          0,
                          6
                        )}...${tx.hash.substring(tx.hash.length - 4)}`}</td>
                        <td className="px-6 py-4">
                          {tx.chainId === "1"
                            ? "以太坊"
                            : tx.chainId === "56"
                            ? "币安智能链"
                            : tx.chainId}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">{`${tx.from.substring(
                          0,
                          6
                        )}...${tx.from.substring(tx.from.length - 4)}`}</td>
                        <td className="px-6 py-4 font-mono text-xs">{`${tx.to.substring(
                          0,
                          6
                        )}...${tx.to.substring(tx.to.length - 4)}`}</td>
                        <td className="px-6 py-4">
                          {tx.value}{" "}
                          {tx.chainId === "1"
                            ? "ETH"
                            : tx.chainId === "56"
                            ? "BNB"
                            : ""}
                        </td>
                        <td className="px-6 py-4">
                          {formatDate(tx.timestamp)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`${getRiskBadgeClass(
                              tx.risk.level
                            )} text-xs font-medium px-2.5 py-0.5 rounded-full`}
                          >
                            {getRiskLevelText(tx.risk.level)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">未找到匹配的交易。</p>
            )}
          </div>
        )}

        {/* 最近交易 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">最近交易</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    交易哈希
                  </th>
                  <th scope="col" className="px-6 py-3">
                    区块链
                  </th>
                  <th scope="col" className="px-6 py-3">
                    发送方
                  </th>
                  <th scope="col" className="px-6 py-3">
                    接收方
                  </th>
                  <th scope="col" className="px-6 py-3">
                    金额
                  </th>
                  <th scope="col" className="px-6 py-3">
                    时间
                  </th>
                  <th scope="col" className="px-6 py-3">
                    风险等级
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr
                    key={tx.hash}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-mono text-xs">{`${tx.hash.substring(
                      0,
                      6
                    )}...${tx.hash.substring(tx.hash.length - 4)}`}</td>
                    <td className="px-6 py-4">
                      {tx.chainId === "1"
                        ? "以太坊"
                        : tx.chainId === "56"
                        ? "币安智能链"
                        : tx.chainId}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{`${tx.from.substring(
                      0,
                      6
                    )}...${tx.from.substring(tx.from.length - 4)}`}</td>
                    <td className="px-6 py-4 font-mono text-xs">{`${tx.to.substring(
                      0,
                      6
                    )}...${tx.to.substring(tx.to.length - 4)}`}</td>
                    <td className="px-6 py-4">
                      {tx.value}{" "}
                      {tx.chainId === "1"
                        ? "ETH"
                        : tx.chainId === "56"
                        ? "BNB"
                        : ""}
                    </td>
                    <td className="px-6 py-4">{formatDate(tx.timestamp)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`${getRiskBadgeClass(
                          tx.risk.level
                        )} text-xs font-medium px-2.5 py-0.5 rounded-full`}
                      >
                        {getRiskLevelText(tx.risk.level)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
