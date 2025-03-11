"use client";

import React from "react";
import Link from "next/link";
import { useTransaction } from "../../../hooks/useApiData";
import ApiStateHandler from "../../../components/ApiStateHandler";

/**
 * 交易详情页面
 * @param {Object} props - 组件属性
 * @returns {JSX.Element} - 页面组件
 */
const TransactionDetailPage = ({ params }) => {
  const { id } = params;

  // 使用 SWR 获取交易详情
  const { data, error, isLoading } = useTransaction(id);

  // 格式化日期
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString("zh-CN");
  };

  // 获取风险等级样式
  const getRiskLevelStyle = (riskLevel) => {
    switch (riskLevel) {
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

      <ApiStateHandler isLoading={isLoading} error={error}>
        {data && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                交易详情
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                交易哈希: {data.txHash}
              </p>
            </div>

            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    交易哈希
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {data.txHash}
                  </dd>
                </div>

                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    区块高度
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {data.blockNumber || "未确认"}
                  </dd>
                </div>

                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">时间</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatDate(data.timestamp)}
                  </dd>
                </div>

                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">发送方</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <Link
                      href={`/address/${data.from}`}
                      className="text-blue-600 hover:underline"
                    >
                      {data.from}
                    </Link>
                  </dd>
                </div>

                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">接收方</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <Link
                      href={`/address/${data.to}`}
                      className="text-blue-600 hover:underline"
                    >
                      {data.to}
                    </Link>
                  </dd>
                </div>

                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">金额</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {data.amount} {data.currency}
                  </dd>
                </div>

                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">手续费</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {data.fee} {data.currency}
                  </dd>
                </div>

                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    风险等级
                  </dt>
                  <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskLevelStyle(
                        data.riskLevel
                      )}`}
                    >
                      {data.riskLevel === "high"
                        ? "高"
                        : data.riskLevel === "medium"
                        ? "中"
                        : "低"}
                    </span>
                  </dd>
                </div>

                {data.riskFactors && data.riskFactors.length > 0 && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      风险因素
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                        {data.riskFactors.map((factor, index) => (
                          <li
                            key={index}
                            className="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
                          >
                            <div className="w-0 flex-1 flex items-center">
                              <svg
                                className="flex-shrink-0 h-5 w-5 text-red-500"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="ml-2 flex-1 w-0 truncate">
                                {factor.name}: {factor.description}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}

                {data.notes && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">备注</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {data.notes}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        )}
      </ApiStateHandler>
    </div>
  );
};

export default TransactionDetailPage;
