"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ApiStateHandler from "./ApiStateHandler";
import { useTransactions } from "../hooks/useApiData";
import { useRouter } from "next/navigation";
import apiClient from "../app/services/apiClient";

/**
 * 交易列表组件
 * @param {Object} props - 组件属性
 * @param {Object} props.initialParams - 初始查询参数
 * @returns {JSX.Element} - 组件
 */
const TransactionList = ({ initialParams = {} }) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortField, setSortField] = useState("timestamp");
  const [sortDirection, setSortDirection] = useState("desc");
  const router = useRouter();

  const pageSize = 10;

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, sortField, sortDirection]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = {
        ...initialParams,
        page: currentPage,
        limit: pageSize,
        sortBy: sortField,
        sortDirection: sortDirection,
      };

      const queryString = Object.keys(params)
        .map(
          (key) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
        )
        .join("&");

      const response = await apiClient.get(`/api/transactions?${queryString}`);

      if (response.data) {
        setTransactions(response.data.transactions || []);
        setTotalCount(response.data.totalCount || 0);
        setTotalPages(Math.ceil((response.data.totalCount || 0) / pageSize));
      } else {
        setMockData();
      }
    } catch (err) {
      console.error("获取交易数据失败:", err);
      setError("获取交易数据失败，请稍后重试");
      setMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const setMockData = () => {
    // 模拟数据
    const mockTransactions = [
      {
        id: "1",
        hash: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        blockNumber: 15243789,
        timestamp: "2023-11-15T08:30:00Z",
        from: "0x8Ba1f109551bD432803012645Ac136ddd64DBA72",
        to:
          initialParams.address || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        value: "1.5",
        currency: "ETH",
        fee: "0.002",
        status: "confirmed",
        riskScore: 25,
      },
      {
        id: "2",
        hash: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
        blockNumber: 15243456,
        timestamp: "2023-11-14T14:45:00Z",
        from:
          initialParams.address || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        to: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
        value: "0.75",
        currency: "ETH",
        fee: "0.001",
        status: "confirmed",
        riskScore: 15,
      },
      {
        id: "3",
        hash: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
        blockNumber: 15242789,
        timestamp: "2023-11-13T19:20:00Z",
        from: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
        to:
          initialParams.address || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        value: "2.25",
        currency: "ETH",
        fee: "0.003",
        status: "confirmed",
        riskScore: 75,
      },
    ];

    setTransactions(mockTransactions);
    setTotalCount(mockTransactions.length);
    setTotalPages(1);
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getSortIcon = (field) => {
    if (field !== sortField) {
      return (
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          ></path>
        </svg>
      );
    }

    return sortDirection === "asc" ? (
      <svg
        className="w-4 h-4 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 15l7-7 7 7"
        ></path>
      </svg>
    ) : (
      <svg
        className="w-4 h-4 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 9l-7 7-7-7"
        ></path>
      </svg>
    );
  };

  const getRiskLevelClass = (score) => {
    if (score >= 75) return "bg-red-100 text-red-800";
    if (score >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getRiskLevelText = (score) => {
    if (score >= 75) return "高风险";
    if (score >= 40) return "中风险";
    return "低风险";
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      {transactions.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("hash")}
                  >
                    <div className="flex items-center">
                      交易哈希
                      {getSortIcon("hash")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("timestamp")}
                  >
                    <div className="flex items-center">
                      时间
                      {getSortIcon("timestamp")}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    发送方
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    接收方
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("value")}
                  >
                    <div className="flex items-center">
                      金额
                      {getSortIcon("value")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("riskScore")}
                  >
                    <div className="flex items-center">
                      风险等级
                      {getSortIcon("riskScore")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      <a
                        href={`https://etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {tx.hash.substring(0, 8)}...
                        {tx.hash.substring(tx.hash.length - 6)}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tx.timestamp).toLocaleString("zh-CN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <a
                        href={`/address/${tx.from}`}
                        className="hover:underline"
                      >
                        {tx.from.substring(0, 8)}...
                        {tx.from.substring(tx.from.length - 6)}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <a href={`/address/${tx.to}`} className="hover:underline">
                        {tx.to.substring(0, 8)}...
                        {tx.to.substring(tx.to.length - 6)}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.value} {tx.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelClass(
                          tx.riskScore
                        )}`}
                      >
                        {getRiskLevelText(tx.riskScore)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    显示第{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * pageSize + 1}
                    </span>{" "}
                    到{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * pageSize, totalCount)}
                    </span>{" "}
                    条，共 <span className="font-medium">{totalCount}</span>{" "}
                    条结果
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      上一页
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                            currentPage === pageNum
                              ? "bg-blue-50 text-blue-600"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      下一页
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">未找到相关交易</div>
      )}
    </div>
  );
};

export default TransactionList;
