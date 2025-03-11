"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * 地址搜索页面
 * @returns {JSX.Element} - 页面组件
 */
const AddressSearchPage = () => {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  // 处理地址搜索
  const handleSearch = (e) => {
    e.preventDefault();

    if (!address.trim()) {
      setError("请输入区块链地址");
      return;
    }

    // 简单的地址格式验证（以太坊地址格式）
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!ethereumAddressRegex.test(address)) {
      setError("请输入有效的区块链地址");
      return;
    }

    // 清除错误
    setError("");

    // 导航到地址分析页面
    router.push(`/address/${address}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">地址分析</h1>

      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          输入区块链地址
        </h2>

        <form onSubmit={handleSearch}>
          <div className="mb-4">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              区块链地址
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="输入以太坊地址，例如：0x123..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              分析地址
            </button>
          </div>
        </form>

        <div className="mt-8">
          <h3 className="text-md font-medium text-gray-900 mb-2">
            最近分析的地址
          </h3>
          <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
            <div
              className="p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() =>
                router.push(
                  "/address/0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                )
              }
            >
              <p className="text-blue-600 hover:underline">
                0x742d35Cc6634C0532925a3b844Bc454e4438f44e
              </p>
              <p className="text-sm text-gray-500 mt-1">
                上次分析时间：2023-06-15
              </p>
            </div>
            <div
              className="p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() =>
                router.push(
                  "/address/0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD"
                )
              }
            >
              <p className="text-blue-600 hover:underline">
                0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD
              </p>
              <p className="text-sm text-gray-500 mt-1">
                上次分析时间：2023-06-14
              </p>
            </div>
            <div
              className="p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() =>
                router.push(
                  "/address/0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7"
                )
              }
            >
              <p className="text-blue-600 hover:underline">
                0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7
              </p>
              <p className="text-sm text-gray-500 mt-1">
                上次分析时间：2023-06-13
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">使用说明</h2>
        <div className="bg-white shadow rounded-lg p-6">
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>输入您想要分析的区块链地址（目前支持以太坊地址）</li>
            <li>点击"分析地址"按钮</li>
            <li>系统将分析该地址的交易历史、风险因素和关联地址</li>
            <li>查看详细的风险分析报告，了解地址的安全状况</li>
          </ol>
          <p className="mt-4 text-sm text-gray-500">
            注意：地址分析可能需要几秒钟时间，请耐心等待。分析结果仅供参考，不构成投资建议。
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddressSearchPage;
