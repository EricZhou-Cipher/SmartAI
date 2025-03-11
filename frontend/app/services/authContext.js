"use client";

import { createContext, useContext, useState, useEffect } from "react";
import apiClient, { setToken, getToken } from "../../services/apiClient";

// 创建认证上下文
const AuthContext = createContext();

/**
 * 认证上下文提供者组件
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件
 * @returns {JSX.Element} - 组件
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 初始化认证状态
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 检查是否有存储的令牌
        const token = getToken();

        if (token) {
          // 获取用户信息
          try {
            const userData = await apiClient.auth.getMe();
            setUser(userData);
            setIsAuthenticated(true);
          } catch (err) {
            console.error("获取用户信息失败:", err);
            // 令牌可能已过期，清除令牌
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("初始化认证状态失败:", err);
        setError(err.message || "初始化认证状态失败");
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * 用户注册
   * @param {Object} userData - 用户注册数据
   * @returns {Promise} 注册结果
   */
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.auth.register(userData);

      if (response.token) {
        setToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);
      }

      return response;
    } catch (err) {
      console.error("注册失败:", err);
      setError(err.message || "注册失败，请稍后重试");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 用户登录
   * @param {Object} credentials - 登录凭据
   * @returns {Promise} 登录结果
   */
  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.auth.login(credentials);

      if (response.token) {
        setToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);
      }

      return response;
    } catch (err) {
      console.error("登录失败:", err);
      setError(err.message || "登录失败，请检查您的凭据");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 用户登出
   * @returns {Promise} 登出结果
   */
  const logout = async () => {
    setIsLoading(true);

    try {
      // 调用登出API
      await apiClient.auth.logout();
    } catch (err) {
      console.error("登出API调用失败:", err);
    } finally {
      // 无论API调用是否成功，都清除本地状态
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  // 提供的上下文值
  const contextValue = {
    user,
    isAuthenticated,
    isLoading,
    error,
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

/**
 * 使用认证上下文的钩子
 * @returns {Object} 认证上下文值
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth必须在AuthProvider内部使用");
  }

  return context;
}
