"use client";

import { createContext, useContext, useState, useCallback } from "react";
import api from "../services/api";

// 创建 API 上下文
const ApiContext = createContext(null);

/**
 * API 提供者组件
 * @param {Object} props - 组件属性
 * @returns {JSX.Element} - API 提供者组件
 */
export const ApiProvider = ({ children }) => {
  // 全局加载状态
  const [isLoading, setIsLoading] = useState(false);
  // 全局错误状态
  const [error, setError] = useState(null);

  /**
   * 执行 API 请求的通用方法
   * @param {Function} apiCall - API 调用函数
   * @param {Object} options - 选项
   * @returns {Promise} - API 响应
   */
  const executeApiCall = useCallback(async (apiCall, options = {}) => {
    const { showLoading = true } = options;

    if (showLoading) {
      setIsLoading(true);
    }

    setError(null);

    try {
      const response = await apiCall();
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  /**
   * 获取交易列表
   * @param {Object} params - 查询参数
   * @returns {Promise} - 交易列表
   */
  const fetchTransactions = useCallback(
    (params) => {
      return executeApiCall(() => api.transactions.fetchTransactions(params));
    },
    [executeApiCall]
  );

  /**
   * 获取单个交易详情
   * @param {string} id - 交易 ID
   * @returns {Promise} - 交易详情
   */
  const fetchTransaction = useCallback(
    (id) => {
      return executeApiCall(() => api.transactions.fetchTransaction(id));
    },
    [executeApiCall]
  );

  /**
   * 分析地址风险
   * @param {string} address - 区块链地址
   * @returns {Promise} - 地址风险分析结果
   */
  const fetchAddressRisk = useCallback(
    (address) => {
      return executeApiCall(() => api.address.fetchAddressRisk(address));
    },
    [executeApiCall]
  );

  /**
   * 获取地址信息
   * @param {string} address - 区块链地址
   * @returns {Promise} - 地址信息
   */
  const fetchAddress = useCallback(
    (address) => {
      return executeApiCall(() => api.address.fetchAddress(address));
    },
    [executeApiCall]
  );

  /**
   * 获取地址相关交易
   * @param {string} address - 区块链地址
   * @param {Object} params - 查询参数
   * @returns {Promise} - 地址相关交易
   */
  const fetchAddressTransactions = useCallback(
    (address, params) => {
      return executeApiCall(() =>
        api.address.fetchAddressTransactions(address, params)
      );
    },
    [executeApiCall]
  );

  /**
   * 用户登录
   * @param {Object} credentials - 登录凭证
   * @returns {Promise} - 登录结果
   */
  const login = useCallback(
    (credentials) => {
      return executeApiCall(() => api.auth.login(credentials));
    },
    [executeApiCall]
  );

  /**
   * 用户注册
   * @param {Object} userData - 用户数据
   * @returns {Promise} - 注册结果
   */
  const register = useCallback(
    (userData) => {
      return executeApiCall(() => api.auth.register(userData));
    },
    [executeApiCall]
  );

  /**
   * 获取当前用户信息
   * @returns {Promise} - 用户信息
   */
  const getCurrentUser = useCallback(() => {
    return executeApiCall(() => api.auth.getCurrentUser(), {
      showLoading: false,
    });
  }, [executeApiCall]);

  /**
   * 清除错误
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 上下文值
  const contextValue = {
    isLoading,
    error,
    clearError,
    fetchTransactions,
    fetchTransaction,
    fetchAddressRisk,
    fetchAddress,
    fetchAddressTransactions,
    login,
    register,
    getCurrentUser,
  };

  return (
    <ApiContext.Provider value={contextValue}>{children}</ApiContext.Provider>
  );
};

/**
 * 使用 API 上下文的钩子
 * @returns {Object} - API 上下文值
 */
export const useApi = () => {
  const context = useContext(ApiContext);

  if (!context) {
    throw new Error("useApi 必须在 ApiProvider 内部使用");
  }

  return context;
};

export default ApiContext;
