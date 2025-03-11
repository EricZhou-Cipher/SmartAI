import React from 'react';

// 模拟 AuthProvider
export const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// 模拟 NotificationProvider
export const MockNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// 测试包装器组件
export const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MockAuthProvider>
      <MockNotificationProvider>
        {children}
      </MockNotificationProvider>
    </MockAuthProvider>
  );
};

// 模拟 useAuth hook
export const mockUseAuth = () => {
  return {
    user: {
      _id: 'test-user-id',
      name: '测试用户',
      email: 'test@example.com',
      role: 'admin'
    },
    isAuthenticated: true,
    loading: false,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    error: null
  };
};

// 模拟 useNotification hook
export const mockUseNotification = (overrides = {}) => {
  return {
    notifications: [],
    unreadCount: 0,
    fetchNotifications: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    deleteNotification: jest.fn(),
    ...overrides
  };
}; 