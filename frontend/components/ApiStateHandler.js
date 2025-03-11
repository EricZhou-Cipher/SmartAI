"use client";

import React from "react";

/**
 * API状态处理组件
 * 用于处理API请求的加载和错误状态
 * @param {Object} props - 组件属性
 * @param {boolean} props.isLoading - 是否正在加载
 * @param {Object} props.error - 错误对象
 * @param {React.ReactNode} props.children - 子组件
 * @returns {JSX.Element} - 组件
 */
const ApiStateHandler = ({ isLoading, error, children }) => {
  // 如果正在加载，显示加载组件
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 如果有错误，显示错误组件
  if (error) {
    return (
      <div
        className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">错误：</strong>
        <span className="block sm:inline">
          {error.message || "获取数据失败，请稍后重试"}
        </span>
      </div>
    );
  }

  // 如果没有加载也没有错误，显示子组件
  return children;
};

export default ApiStateHandler;
