'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

// 通知类型定义
export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'alert' | 'system' | 'transaction' | 'info';
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
  relatedEntityType?: string;
  relatedEntityId?: string;
  data?: any;
  createdAt: string;
  updatedAt: string;
}

// 通知上下文类型定义
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  showToast: (notification: Notification) => void;
}

// 创建通知上下文
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// WebSocket连接URL
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

// 通知提供者组件
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<Notification | null>(null);

  // 初始化WebSocket连接
  useEffect(() => {
    if (!user || !token) return;

    // 创建Socket.io连接
    const socketInstance = io(SOCKET_URL);
    setSocket(socketInstance);

    // 连接成功
    socketInstance.on('connect', () => {
      console.log('WebSocket连接成功');
      // 发送认证信息
      socketInstance.emit('authenticate', token);
    });

    // 认证成功
    socketInstance.on('authenticated', (data) => {
      console.log('WebSocket认证成功:', data);
    });

    // 认证失败
    socketInstance.on('auth_error', (error) => {
      console.error('WebSocket认证失败:', error);
      setError('通知连接认证失败');
    });

    // 断开连接
    socketInstance.on('disconnect', () => {
      console.log('WebSocket连接断开');
    });

    // 清理函数
    return () => {
      socketInstance.disconnect();
    };
  }, [user, token]);

  // 监听通知事件
  useEffect(() => {
    if (!socket) return;

    // 新通知
    socket.on('new_notification', (notification: Notification) => {
      console.log('收到新通知:', notification);
      setNotifications((prev) => [notification, ...prev]);
      showToast(notification);
    });

    // 未读通知数量
    socket.on('unread_count', (data: { count: number }) => {
      console.log('未读通知数量:', data.count);
      setUnreadCount(data.count);
    });

    // 清理函数
    return () => {
      socket.off('new_notification');
      socket.off('unread_count');
    };
  }, [socket]);

  // 获取通知列表
  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) {
        throw new Error('获取通知失败');
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('获取通知失败:', err);
      setError('获取通知失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 标记通知为已读
  const markAsRead = async (id: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('标记通知为已读失败');
      }

      // 更新本地状态
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id ? { ...notification, isRead: true } : notification
        )
      );
    } catch (err) {
      console.error('标记通知为已读失败:', err);
      setError('标记通知为已读失败，请稍后重试');
    }
  };

  // 标记所有通知为已读
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('标记所有通知为已读失败');
      }

      // 更新本地状态
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('标记所有通知为已读失败:', err);
      setError('标记所有通知为已读失败，请稍后重试');
    }
  };

  // 删除通知
  const deleteNotification = async (id: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除通知失败');
      }

      // 更新本地状态
      setNotifications((prev) => prev.filter((notification) => notification._id !== id));
    } catch (err) {
      console.error('删除通知失败:', err);
      setError('删除通知失败，请稍后重试');
    }
  };

  // 显示Toast通知
  const showToast = (notification: Notification) => {
    setToastNotification(notification);
    // 3秒后自动关闭
    setTimeout(() => {
      setToastNotification(null);
    }, 3000);
  };

  // 初始加载通知
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // 提供上下文值
  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    showToast,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {/* Toast通知组件 */}
      {toastNotification && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className={`bg-white rounded-lg shadow-lg overflow-hidden border-l-4 ${
            toastNotification.priority === 'high' ? 'border-red-500' :
            toastNotification.priority === 'medium' ? 'border-yellow-500' : 'border-blue-500'
          }`}>
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {toastNotification.type === 'alert' && (
                    <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  {toastNotification.type === 'system' && (
                    <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {toastNotification.type === 'transaction' && (
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{toastNotification.title}</p>
                  <p className="mt-1 text-sm text-gray-500">{toastNotification.message}</p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => setToastNotification(null)}
                  >
                    <span className="sr-only">关闭</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

// 通知上下文Hook
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}; 