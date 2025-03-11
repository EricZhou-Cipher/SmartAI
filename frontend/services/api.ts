import { Notification } from '../context/NotificationContext';

// API 基础 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// 日志类型定义
export interface Log {
  _id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  source: string;
  details: any;
  timestamp: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  path?: string;
}

// 日志查询参数
export interface LogQueryParams {
  page?: number;
  limit?: number;
  level?: 'info' | 'warning' | 'error';
  source?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// 日志统计数据
export interface LogStats {
  total: number;
  byLevel: {
    info: number;
    warning: number;
    error: number;
  };
  bySource: Record<string, number>;
  byTime: Array<{
    date: string;
    count: number;
  }>;
}

// 通知查询参数
export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: 'alert' | 'system' | 'transaction' | 'info';
  priority?: 'high' | 'medium' | 'low';
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// API 分页数据类型
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API 分页响应类型
export interface PaginatedApiResponse<T> extends ApiResponse<PaginatedData<T>> {}

/**
 * 通用 API 请求函数
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '请求失败');
    }
    
    return data;
  } catch (error) {
    console.error('API 请求错误:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 构建查询字符串
 */
function buildQueryString(params: Record<string, any>): string {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  
  return query ? `?${query}` : '';
}

/**
 * 日志 API
 */
export const LogApi = {
  /**
   * 获取日志列表
   */
  fetchLogs: async (params: LogQueryParams = {}): Promise<PaginatedApiResponse<Log>> => {
    const queryString = buildQueryString(params);
    return fetchApi<PaginatedData<Log>>(`/logs${queryString}`);
  },
  
  /**
   * 获取日志详情
   */
  getLogById: async (id: string): Promise<ApiResponse<Log>> => {
    return fetchApi<Log>(`/logs/${id}`);
  },
  
  /**
   * 删除日志
   */
  deleteLog: async (id: string): Promise<ApiResponse<{ deleted: boolean }>> => {
    return fetchApi<{ deleted: boolean }>(`/logs/${id}`, {
      method: 'DELETE',
    });
  },
  
  /**
   * 获取日志统计数据
   */
  getLogStats: async (params: {
    startDate?: string;
    endDate?: string;
    interval?: 'hour' | 'day' | 'week' | 'month';
  } = {}): Promise<ApiResponse<LogStats>> => {
    const queryString = buildQueryString(params);
    return fetchApi<LogStats>(`/logs/stats${queryString}`);
  },
};

/**
 * 通知 API
 */
export const NotificationApi = {
  /**
   * 获取通知列表
   */
  fetchNotifications: async (params: NotificationQueryParams = {}): Promise<PaginatedApiResponse<Notification>> => {
    const queryString = buildQueryString(params);
    return fetchApi<PaginatedData<Notification>>(`/notifications${queryString}`);
  },
  
  /**
   * 获取通知详情
   */
  getNotificationById: async (id: string): Promise<ApiResponse<Notification>> => {
    return fetchApi<Notification>(`/notifications/${id}`);
  },
  
  /**
   * 标记通知为已读
   */
  markAsRead: async (id: string): Promise<ApiResponse<Notification>> => {
    return fetchApi<Notification>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },
  
  /**
   * 标记所有通知为已读
   */
  markAllAsRead: async (): Promise<ApiResponse<{ updated: number }>> => {
    return fetchApi<{ updated: number }>('/notifications/read-all', {
      method: 'PATCH',
    });
  },
  
  /**
   * 删除通知
   */
  deleteNotification: async (id: string): Promise<ApiResponse<{ deleted: boolean }>> => {
    return fetchApi<{ deleted: boolean }>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },
  
  /**
   * 获取未读通知数量
   */
  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    return fetchApi<{ count: number }>('/notifications/unread/count');
  },
};

export default {
  LogApi,
  NotificationApi,
}; 