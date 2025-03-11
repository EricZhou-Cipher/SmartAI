/**
 * API 服务 - 封装所有与后端 API 的交互
 */
import apiClient from "./apiClient";

/**
 * 交易相关 API
 */
export const transactionsApi = {
  /**
   * 获取交易列表
   * @param {Object} params - 查询参数
   * @returns {Promise} - 交易列表
   */
  fetchTransactions: (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    if (params.search) queryParams.append("search", params.search);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return apiClient.get(`/transactions${query}`);
  },

  /**
   * 获取单个交易详情
   * @param {string} id - 交易 ID
   * @returns {Promise} - 交易详情
   */
  fetchTransaction: (id) => {
    return apiClient.get(`/transactions/${id}`);
  },

  /**
   * 创建新交易
   * @param {Object} transaction - 交易数据
   * @returns {Promise} - 创建的交易
   */
  createTransaction: (transaction) => {
    return apiClient.post("/transactions", transaction);
  },

  /**
   * 更新交易
   * @param {string} id - 交易 ID
   * @param {Object} transaction - 更新的交易数据
   * @returns {Promise} - 更新后的交易
   */
  updateTransaction: (id, transaction) => {
    return apiClient.put(`/transactions/${id}`, transaction);
  },

  /**
   * 删除交易
   * @param {string} id - 交易 ID
   * @returns {Promise} - 删除结果
   */
  deleteTransaction: (id) => {
    return apiClient.delete(`/transactions/${id}`);
  },
};

/**
 * 地址相关 API
 */
export const addressApi = {
  /**
   * 获取地址信息
   * @param {string} address - 区块链地址
   * @returns {Promise} - 地址信息
   */
  fetchAddress: (address) => {
    return apiClient.get(`/address/${address}`);
  },

  /**
   * 分析地址风险
   * @param {string} address - 区块链地址
   * @returns {Promise} - 地址风险分析结果
   */
  fetchAddressRisk: (address) => {
    return apiClient.get(`/address/${address}/analyze`);
  },

  /**
   * 获取地址相关交易
   * @param {string} address - 区块链地址
   * @param {Object} params - 查询参数
   * @returns {Promise} - 地址相关交易
   */
  fetchAddressTransactions: (address, params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return apiClient.get(`/address/${address}/transactions${query}`);
  },

  /**
   * 添加地址标签
   * @param {string} address - 区块链地址
   * @param {Array} tags - 标签数组
   * @returns {Promise} - 更新后的地址信息
   */
  addAddressTags: (address, tags) => {
    return apiClient.post(`/address/${address}/tags`, { tags });
  },
};

/**
 * 用户认证相关 API
 */
export const authApi = {
  /**
   * 用户登录
   * @param {Object} credentials - 登录凭证
   * @returns {Promise} - 登录结果
   */
  login: (credentials) => {
    return apiClient.post("/auth/login", credentials);
  },

  /**
   * 用户注册
   * @param {Object} userData - 用户数据
   * @returns {Promise} - 注册结果
   */
  register: (userData) => {
    return apiClient.post("/auth/register", userData);
  },

  /**
   * 获取当前用户信息
   * @returns {Promise} - 用户信息
   */
  getCurrentUser: () => {
    return apiClient.get("/auth/me");
  },

  /**
   * 用户登出
   * @returns {Promise} - 登出结果
   */
  logout: () => {
    return apiClient.post("/auth/logout");
  },
};

// 导出所有 API
export default {
  transactions: transactionsApi,
  address: addressApi,
  auth: authApi,
};
