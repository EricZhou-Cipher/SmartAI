"use client";

import { createContext, useContext, useState, useEffect } from "react";
import apiClient, { setToken, getToken } from "../services/apiClient";

// 创建认证上下文
const AuthContext = createContext();

// 认证提供者组件
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMockMode, setIsMockMode] = useState(false);

  // 初始化 - 检查用户是否已登录
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getToken();

        if (token) {
          // 检查是否是模拟令牌
          if (token === "mock_token_for_demo" || token === "mock_admin_token") {
            setIsMockMode(true);

            // 设置模拟用户数据
            const mockUser =
              token === "mock_admin_token"
                ? {
                    id: "admin_user_id",
                    name: "管理员",
                    email: "admin@example.com",
                    role: "admin",
                  }
                : {
                    id: "test_user_id",
                    name: "测试用户",
                    email: "test@example.com",
                    role: "user",
                  };

            setUser(mockUser);
          } else {
            // 获取用户信息
            const response = await apiClient.auth.getMe();
            if (response.success) {
              setUser(response.user);
            }
          }
        }
      } catch (err) {
        console.error("认证初始化错误:", err);
        // 清除无效令牌
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 登录
  const login = async (credentials) => {
    setError(null);
    try {
      const response = await apiClient.auth.login(credentials);

      if (response.success) {
        setToken(response.token);
        setUser(response.user);

        // 检查是否是模拟令牌
        if (
          response.token === "mock_token_for_demo" ||
          response.token === "mock_admin_token"
        ) {
          setIsMockMode(true);
        }

        return response;
      }
    } catch (err) {
      setError(err.message || "登录失败");
      throw err;
    }
  };

  // 注册
  const register = async (userData) => {
    setError(null);
    try {
      const response = await apiClient.auth.register(userData);

      if (response.success) {
        setToken(response.token);
        setUser(response.user);
        return response;
      }
    } catch (err) {
      setError(err.message || "注册失败");
      throw err;
    }
  };

  // 登出
  const logout = async () => {
    try {
      // 如果不是模拟模式，调用登出API
      if (!isMockMode) {
        await apiClient.auth.logout();
      }
    } catch (err) {
      console.error("登出错误:", err);
    } finally {
      // 无论如何都清除本地状态
      setToken(null);
      setUser(null);
      setIsMockMode(false);
    }
  };

  // 使用模拟令牌登录
  const loginWithMockToken = (isAdmin = false) => {
    const mockToken = isAdmin ? "mock_admin_token" : "mock_token_for_demo";
    const mockUser = isAdmin
      ? {
          id: "admin_user_id",
          name: "管理员",
          email: "admin@example.com",
          role: "admin",
        }
      : {
          id: "test_user_id",
          name: "测试用户",
          email: "test@example.com",
          role: "user",
        };

    setToken(mockToken);
    setUser(mockUser);
    setIsMockMode(true);

    return { success: true, token: mockToken, user: mockUser };
  };

  // 提供的上下文值
  const value = {
    user,
    loading,
    error,
    isMockMode,
    login,
    register,
    logout,
    loginWithMockToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 使用认证上下文的钩子
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth必须在AuthProvider内部使用");
  }
  return context;
}

export default AuthContext;
