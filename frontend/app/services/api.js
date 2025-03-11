/**
 * ChainIntelAI API 服务
 * 用于与后端 API 交互的工具函数
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * 获取存储的 token
 */
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

/**
 * 创建请求头
 */
const createHeaders = (token) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * 处理 API 响应
 */
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      // 清除 token 并重定向到登录页
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }

    const error = (data && data.message) || response.statusText;
    return Promise.reject(error);
  }

  return data;
};

/**
 * API 请求函数
 */
const apiRequest = async (endpoint, method = "GET", body = null) => {
  const token = getToken();
  const headers = createHeaders(token);
  const url = `${API_URL}${endpoint}`;

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    return handleResponse(response);
  } catch (error) {
    console.error(`API 请求错误: ${error.message}`);
    return Promise.reject(error);
  }
};

/**
 * 认证 API
 */
export const authAPI = {
  register: (userData) => apiRequest("/auth/register", "POST", userData),
  login: (credentials) => apiRequest("/auth/login", "POST", credentials),
  getCurrentUser: () => apiRequest("/auth/me"),
};

/**
 * 交易 API
 */
export const transactionsAPI = {
  getTransactions: (params = "") => apiRequest(`/transactions${params}`),
  getTransaction: (id) => apiRequest(`/transactions/${id}`),
  createTransaction: (transactionData) =>
    apiRequest("/transactions", "POST", transactionData),
  updateTransaction: (id, transactionData) =>
    apiRequest(`/transactions/${id}`, "PUT", transactionData),
  deleteTransaction: (id) => apiRequest(`/transactions/${id}`, "DELETE"),
};

/**
 * 地址 API
 */
export const addressAPI = {
  getAddress: (address, blockchain) => {
    const query = blockchain ? `?blockchain=${blockchain}` : "";
    return apiRequest(`/address/${address}${query}`);
  },
  analyzeAddress: (addressData) =>
    apiRequest("/address/analyze", "POST", addressData),
  getAddressTransactions: (address, params = "") =>
    apiRequest(`/address/${address}/transactions${params}`),
  addAddressTags: (address, tagsData) =>
    apiRequest(`/address/${address}/tags`, "POST", tagsData),
};

/**
 * 告警 API
 */
export const alertsAPI = {
  // 获取告警统计信息
  getAlertStats: () => apiRequest("/alerts/stats"),

  // 获取告警规则列表
  getAlertRules: (params = "") => apiRequest(`/alerts/rules${params}`),

  // 获取单个告警规则
  getAlertRule: (id) => apiRequest(`/alerts/rules/${id}`),

  // 创建告警规则
  createAlertRule: (ruleData) => apiRequest("/alerts/rules", "POST", ruleData),

  // 更新告警规则
  updateAlertRule: (id, ruleData) =>
    apiRequest(`/alerts/rules/${id}`, "PUT", ruleData),

  // 删除告警规则
  deleteAlertRule: (id) => apiRequest(`/alerts/rules/${id}`, "DELETE"),

  // 启用/禁用告警规则
  toggleAlertRule: (id, status) =>
    apiRequest(`/alerts/rules/${id}/toggle`, "PUT", { status }),

  // 获取告警列表
  getAlerts: (params = "") => apiRequest(`/alerts${params}`),

  // 获取单个告警详情
  getAlert: (id) => apiRequest(`/alerts/${id}`),

  // 更新告警状态（如标记为已处理）
  updateAlertStatus: (id, status) =>
    apiRequest(`/alerts/${id}/status`, "PUT", { status }),
};

export default {
  auth: authAPI,
  transactions: transactionsAPI,
  address: addressAPI,
  alerts: alertsAPI,
};
