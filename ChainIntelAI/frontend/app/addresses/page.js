"use client";
import { useState } from "react";

export default function Addresses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [addressProfile, setAddressProfile] = useState(null);

  // 模拟地址数据
  const mockAddressProfile = {
    address: "0xabcdef1234567890abcdef1234567890abcdef12",
    chainId: "1",
    profile: {
      firstSeen: 1634567890000,
      lastSeen: 1634657890000,
      transactionCount: 42,
      balance: "10.5",
      tags: ["exchange", "high-volume"],
    },
    risk: {
      score: 0.2,
      level: "low",
      factors: [
        {
          type: "known-exchange",
          description: "地址属于已知交易所",
          score: 0.1,
        },
      ],
    },
    relatedAddresses: [
      {
        address: "0x7890abcdef1234567890abcdef1234567890abcd",
        transactionCount: 15,
        lastInteraction: 1634657890000,
      },
      {
        address: "0x890abcdef1234567890abcdef1234567890abcde",
        transactionCount: 8,
        lastInteraction: 1634657880000,
      },
      {
        address: "0x90abcdef1234567890abcdef1234567890abcdef",
        transactionCount: 5,
        lastInteraction: 1634657870000,
      },
    ],
    transactions: [
      {
        hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        type: "out",
        to: "0x7890abcdef1234567890abcdef1234567890abcd",
        value: "1.5",
        timestamp: 1634657890000,
      },
      {
        hash: "0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef",
        type: "in",
        from: "0x890abcdef1234567890abcdef1234567890abcde",
        value: "2.0",
        timestamp: 1634657880000,
      },
      {
        hash: "0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef",
        type: "out",
        to: "0x90abcdef1234567890abcdef1234567890abcdef",
        value: "0.5",
        timestamp: 1634657870000,
      },
    ],
    activityHistory: [
      { date: "2023-03-01", count: 5 },
      { date: "2023-03-02", count: 3 },
      { date: "2023-03-03", count: 7 },
      { date: "2023-03-04", count: 2 },
      { date: "2023-03-05", count: 0 },
      { date: "2023-03-06", count: 4 },
      { date: "2023-03-07", count: 6 },
      { date: "2023-03-08", count: 8 },
      { date: "2023-03-09", count: 3 },
      { date: "2023-03-10", count: 5 },
      { date: "2023-03-11", count: 1 },
      { date: "2023-03-12", count: 0 },
      { date: "2023-03-13", count: 2 },
      { date: "2023-03-14", count: 4 },
      { date: "2023-03-15", count: 3 },
    ],
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery) return;

    // 模拟搜索结果
    if (searchQuery.toLowerCase().includes("0x")) {
      setAddressProfile(mockAddressProfile);
    } else {
      setAddressProfile(null);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString("zh-CN");
  };

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
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

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <div className="w-full max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">地址画像</h1>
          <p className="text-gray-600 mt-2">
            构建地址行为画像，追踪历史活动模式
          </p>
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
                地址
              </label>
              <input
                type="text"
                id="search"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="输入区块链地址..."
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

        {/* 地址画像 */}
        {addressProfile ? (
          <>
            {/* 地址概览 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    地址概览
                  </h2>
                  <p className="text-gray-500 mt-1 font-mono">
                    {addressProfile.address}
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <span
                    className={`${getRiskBadgeClass(
                      addressProfile.risk.level
                    )} text-xs font-medium px-2.5 py-0.5 rounded-full`}
                  >
                    {getRiskLevelText(addressProfile.risk.level)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500">余额</h3>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {addressProfile.profile.balance} ETH
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    交易次数
                  </h3>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {addressProfile.profile.transactionCount}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    首次交易
                  </h3>
                  <p className="text-lg font-medium text-gray-800 mt-1">
                    {formatDate(addressProfile.profile.firstSeen)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    最近交易
                  </h3>
                  <p className="text-lg font-medium text-gray-800 mt-1">
                    {formatDate(addressProfile.profile.lastSeen)}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">标签</h3>
                <div className="flex flex-wrap gap-2">
                  {addressProfile.profile.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 风险因素 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                风险因素
              </h2>
              {addressProfile.risk.factors.length > 0 ? (
                <ul className="space-y-3">
                  {addressProfile.risk.factors.map((factor, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700">
                          {factor.type}
                        </p>
                        <p className="text-sm text-gray-500">
                          {factor.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">未检测到风险因素。</p>
              )}
            </div>

            {/* 活动历史 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                活动历史
              </h2>
              <div className="h-48">
                <div className="flex items-end h-32 space-x-2">
                  {addressProfile.activityHistory.map((day, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="bg-blue-500 w-8 rounded-t-sm"
                        style={{ height: `${day.count * 10}px` }}
                      ></div>
                      <span className="text-xs mt-1 text-gray-500">
                        {day.date.split("-")[2]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4">
                  <span className="text-xs text-gray-500">
                    {addressProfile.activityHistory[0].date}
                  </span>
                  <span className="text-xs text-gray-500">
                    {
                      addressProfile.activityHistory[
                        addressProfile.activityHistory.length - 1
                      ].date
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* 相关地址 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                相关地址
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        地址
                      </th>
                      <th scope="col" className="px-6 py-3">
                        交易次数
                      </th>
                      <th scope="col" className="px-6 py-3">
                        最近交互
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {addressProfile.relatedAddresses.map((related) => (
                      <tr
                        key={related.address}
                        className="bg-white border-b hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 font-mono">
                          {formatAddress(related.address)}
                        </td>
                        <td className="px-6 py-4">
                          {related.transactionCount}
                        </td>
                        <td className="px-6 py-4">
                          {formatDate(related.lastInteraction)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 最近交易 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                最近交易
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        交易哈希
                      </th>
                      <th scope="col" className="px-6 py-3">
                        类型
                      </th>
                      <th scope="col" className="px-6 py-3">
                        对方地址
                      </th>
                      <th scope="col" className="px-6 py-3">
                        金额
                      </th>
                      <th scope="col" className="px-6 py-3">
                        时间
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {addressProfile.transactions.map((tx) => (
                      <tr
                        key={tx.hash}
                        className="bg-white border-b hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 font-mono text-xs">{`${tx.hash.substring(
                          0,
                          6
                        )}...${tx.hash.substring(tx.hash.length - 4)}`}</td>
                        <td className="px-6 py-4">
                          {tx.type === "in" ? (
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              转入
                            </span>
                          ) : (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              转出
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">
                          {tx.type === "in"
                            ? formatAddress(tx.from)
                            : formatAddress(tx.to)}
                        </td>
                        <td className="px-6 py-4">{tx.value} ETH</td>
                        <td className="px-6 py-4">
                          {formatDate(tx.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              未找到地址
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              请输入有效的区块链地址进行搜索。
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
