'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Log, LogQueryParams, LogStats, LogApi } from '../services/api';

// 日志上下文类型定义
interface LogContextType {
  logs: Log[];
  totalLogs: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  stats: LogStats | null;
  fetchLogs: (params?: LogQueryParams) => Promise<void>;
  getLogById: (id: string) => Promise<Log | null>;
  deleteLog: (id: string) => Promise<boolean>;
  fetchLogStats: (startDate?: string, endDate?: string, interval?: 'hour' | 'day' | 'week' | 'month') => Promise<void>;
}

// 创建日志上下文
const LogContext = createContext<LogContextType | undefined>(undefined);

// 默认日志统计数据
const defaultStats: LogStats = {
  total: 0,
  byLevel: {
    info: 0,
    warning: 0,
    error: 0,
  },
  bySource: {},
  byTime: [],
};

// 日志提供者组件
export const LogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [totalLogs, setTotalLogs] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<LogStats | null>(null);

  // 获取日志列表
  const fetchLogs = async (params: LogQueryParams = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await LogApi.fetchLogs({
        page: currentPage,
        limit: 10,
        ...params,
      });
      
      if (response.success && response.data) {
        setLogs(response.data.items);
        setTotalLogs(response.data.total);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.page);
      } else {
        setError(response.error || '获取日志失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取日志时发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  // 获取日志详情
  const getLogById = async (id: string): Promise<Log | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await LogApi.getLogById(id);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || '获取日志详情失败');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取日志详情时发生错误');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // 删除日志
  const deleteLog = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await LogApi.deleteLog(id);
      
      if (response.success && response.data?.deleted) {
        // 更新日志列表，移除已删除的日志
        setLogs(logs.filter(log => log._id !== id));
        return true;
      } else {
        setError(response.error || '删除日志失败');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除日志时发生错误');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 获取日志统计数据
  const fetchLogStats = async (
    startDate?: string,
    endDate?: string,
    interval: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await LogApi.getLogStats({
        startDate,
        endDate,
        interval,
      });
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.error || '获取日志统计数据失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取日志统计数据时发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  // 提供上下文值
  const contextValue: LogContextType = {
    logs,
    totalLogs,
    totalPages,
    currentPage,
    isLoading,
    error,
    stats,
    fetchLogs,
    getLogById,
    deleteLog,
    fetchLogStats,
  };

  return (
    <LogContext.Provider value={contextValue}>
      {children}
    </LogContext.Provider>
  );
};

// 使用日志上下文的钩子
export const useLog = (): LogContextType => {
  const context = useContext(LogContext);
  
  if (context === undefined) {
    throw new Error('useLog 必须在 LogProvider 内部使用');
  }
  
  return context;
};

export default LogContext; 