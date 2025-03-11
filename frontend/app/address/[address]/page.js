"use client";

import React, { useState } from "react";
import Link from "next/link";
import AddressRiskAnalysis from "../../../components/AddressRiskAnalysis";
import TransactionList from "../../../components/TransactionList";
import { useAddressTransactions } from "../../../hooks/useApiData";
import ApiStateHandler from "../../../components/ApiStateHandler";

/**
 * 地址分析页面
 * @param {Object} props - 组件属性
 * @returns {JSX.Element} - 页面组件
 */
const AddressPage = ({ params }) => {
  const { address } = params;

  // 标签状态
  const [activeTab, setActiveTab] = useState("analysis");

  // 使用 SWR 获取地址交易
  const { data, error, isLoading } = useAddressTransactions(address, {
    page: 1,
    limit: 10,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/transactions"
          className="text-blue-600 hover:underline flex items-center"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          返回交易列表
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">地址分析</h1>

      {/* 地址信息 */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2">地址</h2>
        <p className="text-sm text-gray-500 break-all">{address}</p>
      </div>

      {/* 标签页 */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("analysis")}
              className={`${
                activeTab === "analysis"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              风险分析
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`${
                activeTab === "transactions"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              相关交易
            </button>
          </nav>
        </div>
      </div>

      {/* 标签页内容 */}
      <div>
        {activeTab === "analysis" ? (
          <AddressRiskAnalysis address={address} />
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <ApiStateHandler isLoading={isLoading} error={error}>
              {data && data.transactions ? (
                <TransactionList initialParams={{ address }} />
              ) : (
                <div className="p-4 text-center text-gray-500">
                  未找到相关交易
                </div>
              )}
            </ApiStateHandler>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressPage;
