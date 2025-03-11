"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithMockToken } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMockOptions, setShowMockOptions] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(formData);
      if (response.success) {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.message || "登录失败，请检查您的凭据");
    } finally {
      setLoading(false);
    }
  };

  const handleMockLogin = (isAdmin) => {
    try {
      loginWithMockToken(isAdmin);
      router.push("/dashboard");
    } catch (err) {
      setError("模拟登录失败");
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">登录</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-2">
            邮箱
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 mb-2">
            密码
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "登录中..." : "登录"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-gray-600">
          还没有账号？{" "}
          <Link href="/auth/register" className="text-blue-600 hover:underline">
            注册
          </Link>
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => setShowMockOptions(!showMockOptions)}
          className="w-full text-gray-600 text-sm underline"
        >
          {showMockOptions ? "隐藏模拟登录选项" : "使用模拟数据模式"}
        </button>

        {showMockOptions && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-gray-500 mb-2">
              模拟数据模式适用于无MongoDB环境，使用预设数据进行演示
            </p>
            <button
              type="button"
              onClick={() => handleMockLogin(false)}
              className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200"
            >
              模拟普通用户登录
            </button>
            <button
              type="button"
              onClick={() => handleMockLogin(true)}
              className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200"
            >
              模拟管理员登录
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
