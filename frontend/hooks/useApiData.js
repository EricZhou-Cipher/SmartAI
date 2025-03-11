"use client";

import useSWR from "swr";
import { useApi } from "../context/ApiContext";

/**
 * 使用 API 数据的钩子
 * @param {string} key - 缓存键
 * @param {Function} fetcher - 数据获取函数
 * @param {Object} options - SWR 选项
 * @returns {Object} - SWR 响应
 */
export const useApiData = (key, fetcher, options = {}) => {
  const { isLoading: globalLoading, error: globalError } = useApi();

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    fetcher,
    {
      revalidateOnFocus: false,
      ...options,
    }
  );

  return {
    data,
    error: error || globalError,
    isLoading: isLoading || globalLoading,
    isValidating,
    mutate,
  };
};

/**
 * 使用交易列表数据的钩子
 * @param {Object} params - 查询参数
 * @param {Object} options - SWR 选项
 * @returns {Object} - 交易列表数据
 */
export const useTransactions = (params = {}, options = {}) => {
  const { fetchTransactions } = useApi();

  // 构建缓存键
  const queryString = new URLSearchParams(params).toString();
  const key = queryString ? `transactions?${queryString}` : "transactions";

  return useApiData(key, () => fetchTransactions(params), options);
};

/**
 * 使用单个交易数据的钩子
 * @param {string} id - 交易 ID
 * @param {Object} options - SWR 选项
 * @returns {Object} - 交易数据
 */
export const useTransaction = (id, options = {}) => {
  const { fetchTransaction } = useApi();

  return useApiData(
    id ? `transaction/${id}` : null,
    () => (id ? fetchTransaction(id) : null),
    options
  );
};

/**
 * 使用地址风险分析数据的钩子
 * @param {string} address - 区块链地址
 * @param {Object} options - SWR 选项
 * @returns {Object} - 地址风险分析数据
 */
export const useAddressRisk = (address, options = {}) => {
  const { fetchAddressRisk } = useApi();

  return useApiData(
    address ? `address/${address}/risk` : null,
    () => (address ? fetchAddressRisk(address) : null),
    options
  );
};

/**
 * 使用地址信息数据的钩子
 * @param {string} address - 区块链地址
 * @param {Object} options - SWR 选项
 * @returns {Object} - 地址信息数据
 */
export const useAddress = (address, options = {}) => {
  const { fetchAddress } = useApi();

  return useApiData(
    address ? `address/${address}` : null,
    () => (address ? fetchAddress(address) : null),
    options
  );
};

/**
 * 使用地址相关交易数据的钩子
 * @param {string} address - 区块链地址
 * @param {Object} params - 查询参数
 * @param {Object} options - SWR 选项
 * @returns {Object} - 地址相关交易数据
 */
export const useAddressTransactions = (address, params = {}, options = {}) => {
  const { fetchAddressTransactions } = useApi();

  // 构建缓存键
  const queryString = new URLSearchParams(params).toString();
  const key = address
    ? queryString
      ? `address/${address}/transactions?${queryString}`
      : `address/${address}/transactions`
    : null;

  return useApiData(
    key,
    () => (address ? fetchAddressTransactions(address, params) : null),
    options
  );
};

export default useApiData;
