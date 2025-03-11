"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import apiClient from "../app/services/apiClient";

/**
 * 地址风险分析组件
 * @param {Object} props - 组件属性
 * @param {string} props.address - 区块链地址
 * @returns {JSX.Element} - 组件
 */
const AddressRiskAnalysis = ({ address }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const blockchain = searchParams.get("blockchain") || "ethereum";

  useEffect(() => {
    const fetchAddressAnalysis = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.get(
          `/api/addresses/analyze/${address}?blockchain=${blockchain}`
        );
        setAnalysisData(response.data);
      } catch (err) {
        console.error("获取地址分析失败:", err);
        setError("获取地址分析数据失败，请稍后重试");
        // 设置模拟数据用于演示
        setMockAnalysisData();
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddressAnalysis();
  }, [address, blockchain]);

  const setMockAnalysisData = () => {
    const mockData = {
      address: address,
      blockchain: blockchain,
      balance: blockchain === "ethereum" ? "123.45 ETH" : "1.23456789 BTC",
      transactionCount: 1234,
      firstSeen: "2021-05-12T10:30:00Z",
      lastSeen: "2023-11-15T08:45:00Z",
      riskScore: 65,
      riskLevel: "中风险",
      tags: ["交易所", "DeFi用户", "高频交易"],
      riskFactors: [
        {
          type: "mixer_interaction",
          description: "与混币器有交互",
          severity: "medium",
          details:
            "该地址曾与已知的混币器服务进行过3次交互，最近一次是在30天前",
        },
        {
          type: "high_value_transfers",
          description: "大额转账",
          severity: "low",
          details: "该地址在过去90天内有5次大额转账（超过10 ETH）",
        },
      ],
      relatedAddresses: [
        {
          address: "0x8Ba1f109551bD432803012645Ac136ddd64DBA72",
          relationship: "频繁交互",
          riskLevel: "高风险",
        },
        {
          address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
          relationship: "单次大额转账",
          riskLevel: "中风险",
        },
      ],
    };

    setAnalysisData(mockData);
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-gray-500">无法获取地址分析数据</div>
      </div>
    );
  }

  // 风险等级对应的颜色
  const riskLevelColor = {
    高风险: "bg-red-100 text-red-800",
    中风险: "bg-yellow-100 text-yellow-800",
    低风险: "bg-green-100 text-green-800",
  };

  // 风险因素严重程度对应的颜色
  const severityColor = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800",
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* 地址概览 */}
      <div className="p-6 border-b">
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold">地址概览</h3>
            <p className="text-gray-500 mt-1 break-all">
              {analysisData.address}
            </p>
            <p className="text-gray-500 mt-1">
              {analysisData.blockchain === "ethereum" ? "以太坊" : "比特币"}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                riskLevelColor[analysisData.riskLevel] ||
                "bg-gray-100 text-gray-800"
              }`}
            >
              {analysisData.riskLevel} ({analysisData.riskScore}/100)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="border rounded p-3">
            <p className="text-sm text-gray-500">余额</p>
            <p className="text-lg font-semibold">{analysisData.balance}</p>
          </div>
          <div className="border rounded p-3">
            <p className="text-sm text-gray-500">交易次数</p>
            <p className="text-lg font-semibold">
              {analysisData.transactionCount.toLocaleString("zh-CN")}
            </p>
          </div>
          <div className="border rounded p-3">
            <p className="text-sm text-gray-500">首次活动</p>
            <p className="text-lg font-semibold">
              {new Date(analysisData.firstSeen).toLocaleDateString("zh-CN")}
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">标签</h4>
          <div className="flex flex-wrap gap-2">
            {analysisData.tags && analysisData.tags.length > 0 ? (
              analysisData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">无标签</span>
            )}
          </div>
        </div>
      </div>

      {/* 风险因素 */}
      <div className="p-6 border-b">
        <h3 className="text-lg font-medium mb-4">风险因素</h3>

        {analysisData.riskFactors && analysisData.riskFactors.length > 0 ? (
          <div className="space-y-4">
            {analysisData.riskFactors.map((factor, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{factor.description}</h4>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      severityColor[factor.severity] ||
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {factor.severity === "high"
                      ? "高"
                      : factor.severity === "medium"
                      ? "中"
                      : "低"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{factor.details}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-4">未检测到风险因素</div>
        )}
      </div>

      {/* 相关地址 */}
      <div className="p-6">
        <h3 className="text-lg font-medium mb-4">相关地址</h3>

        {analysisData.relatedAddresses &&
        analysisData.relatedAddresses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    地址
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    关系
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    风险等级
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analysisData.relatedAddresses.map((related, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {related.address.substring(0, 8)}...
                      {related.address.substring(related.address.length - 6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {related.relationship}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          riskLevelColor[related.riskLevel] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {related.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500 text-center py-4">未发现相关地址</div>
        )}
      </div>
    </div>
  );
};

export default AddressRiskAnalysis;
