/**
 * API客户端服务
 * 处理与后端API的所有通信
 */

// 获取API基础URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api";

// 存储JWT令牌
let token = null;

// 如果在客户端，尝试从localStorage获取令牌
if (typeof window !== "undefined") {
  token = localStorage.getItem("token");
}

/**
 * 设置认证令牌
 * @param {string} newToken - JWT令牌
 */
export const setToken = (newToken) => {
  token = newToken;
  if (typeof window !== "undefined") {
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }
  }
};

/**
 * 获取当前令牌
 * @returns {string} 当前JWT令牌
 */
export const getToken = () => {
  // 如果在客户端，每次都从localStorage获取最新的令牌
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return token;
};

/**
 * 创建请求头
 * @param {boolean} includeAuth - 是否包含认证头
 * @returns {Object} 请求头对象
 */
const createHeaders = (includeAuth = true) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const currentToken = getToken();
    if (currentToken) {
      headers["Authorization"] = `Bearer ${currentToken}`;
    }
  }

  return headers;
};

/**
 * 处理API响应
 * @param {Response} response - fetch响应对象
 * @returns {Promise} 解析后的响应数据
 */
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    // 如果响应状态码不是2xx，抛出错误
    const error = data.message || data.error || "未知错误";
    throw new Error(error);
  }

  return data;
};

/**
 * 发送API请求
 * @param {string} endpoint - API端点
 * @param {string} method - HTTP方法
 * @param {Object} data - 请求数据
 * @param {boolean} auth - 是否需要认证
 * @returns {Promise} API响应
 */
const apiRequest = async (
  endpoint,
  method = "GET",
  data = null,
  auth = true
) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: createHeaders(auth),
  };

  if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    return await handleResponse(response);
  } catch (error) {
    console.error("API请求错误:", error);
    throw error;
  }
};

// API服务对象
const apiClient = {
  // 认证相关
  auth: {
    /**
     * 用户注册
     * @param {Object} userData - 用户注册数据
     * @returns {Promise} 注册结果
     */
    register: (userData) =>
      apiRequest("/auth/register", "POST", userData, false),

    /**
     * 用户登录
     * @param {Object} credentials - 登录凭据
     * @returns {Promise} 登录结果
     */
    login: (credentials) =>
      apiRequest("/auth/login", "POST", credentials, false),

    /**
     * 获取当前用户信息
     * @returns {Promise} 用户信息
     */
    getMe: () => apiRequest("/auth/me", "GET"),

    /**
     * 用户登出
     * @returns {Promise} 登出结果
     */
    logout: () => apiRequest("/auth/logout", "POST"),
  },

  // 交易相关
  transactions: {
    /**
     * 获取交易列表
     * @param {Object} params - 查询参数
     * @returns {Promise} 交易列表
     */
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiRequest(`/transactions${queryString ? `?${queryString}` : ""}`);
    },

    /**
     * 获取单个交易详情
     * @param {string} id - 交易ID
     * @returns {Promise} 交易详情
     */
    getById: (id) => apiRequest(`/transactions/${id}`),

    /**
     * 创建新交易
     * @param {Object} transactionData - 交易数据
     * @returns {Promise} 创建结果
     */
    create: (transactionData) =>
      apiRequest("/transactions", "POST", transactionData),

    /**
     * 更新交易
     * @param {string} id - 交易ID
     * @param {Object} transactionData - 更新数据
     * @returns {Promise} 更新结果
     */
    update: (id, transactionData) =>
      apiRequest(`/transactions/${id}`, "PUT", transactionData),

    /**
     * 删除交易
     * @param {string} id - 交易ID
     * @returns {Promise} 删除结果
     */
    delete: (id) => apiRequest(`/transactions/${id}`, "DELETE"),
  },

  // 地址相关
  address: {
    /**
     * 获取地址信息
     * @param {string} address - 区块链地址
     * @returns {Promise} 地址信息
     */
    getInfo: (address) => apiRequest(`/address/${address}`),

    /**
     * 分析地址
     * @param {string} address - 区块链地址
     * @returns {Promise} 分析结果
     */
    analyze: (address) => apiRequest("/address/analyze", "POST", { address }),

    /**
     * 获取地址交易历史
     * @param {string} address - 区块链地址
     * @param {Object} params - 查询参数
     * @returns {Promise} 交易历史
     */
    getTransactions: (address, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiRequest(
        `/address/${address}/transactions${
          queryString ? `?${queryString}` : ""
        }`
      );
    },

    /**
     * 添加地址标签
     * @param {string} address - 区块链地址
     * @param {Array} tags - 标签数组
     * @returns {Promise} 添加结果
     */
    addTags: (address, tags) =>
      apiRequest(`/address/${address}/tags`, "POST", { tags }),
  },
};

export default apiClient;
