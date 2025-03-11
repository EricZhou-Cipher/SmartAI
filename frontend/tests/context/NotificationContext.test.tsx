import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NotificationProvider, useNotification } from '../../context/NotificationContext';
import { AuthProvider } from '../../context/AuthContext';

// 模拟 axios
jest.mock('axios', () => ({
  get: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn()
}));

// 模拟 socket.io-client
jest.mock('socket.io-client', () => {
  const mockSocket = {
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn()
  };
  return jest.fn(() => mockSocket);
});

// 模拟 AuthContext
jest.mock('../../context/AuthContext', () => {
  const originalModule = jest.requireActual('../../context/AuthContext');
  
  return {
    ...originalModule,
    useAuth: () => ({
      user: { id: '123', name: '测试用户', email: 'test@example.com' },
      token: 'mock-token',
      login: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: true
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
  };
});

// 测试组件，用于访问通知上下文
const TestComponent = () => {
  const notificationContext = useNotification();
  
  return (
    <div>
      <div data-testid="unread-count">{notificationContext.unreadCount}</div>
      <button 
        data-testid="fetch-button" 
        onClick={() => notificationContext.fetchNotifications()}
      >
        获取通知
      </button>
      <button 
        data-testid="mark-read-button" 
        onClick={() => notificationContext.markAsRead('test-id')}
      >
        标记为已读
      </button>
      <button 
        data-testid="mark-all-read-button" 
        onClick={() => notificationContext.markAllAsRead()}
      >
        全部标为已读
      </button>
      <button 
        data-testid="delete-button" 
        onClick={() => notificationContext.deleteNotification('test-id')}
      >
        删除通知
      </button>
      <button 
        data-testid="show-toast-button" 
        onClick={() => notificationContext.showToast({
          _id: 'test-id',
          title: '测试通知',
          message: '这是一条测试通知',
          type: 'info',
          priority: 'medium',
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })}
      >
        显示通知
      </button>
    </div>
  );
};

describe('NotificationContext', () => {
  const axios = require('axios');
  const io = require('socket.io-client');
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 模拟 axios 响应
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/notifications')) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              items: [
                {
                  _id: 'test-id',
                  title: '测试通知',
                  message: '这是一条测试通知',
                  type: 'system',
                  priority: 'medium',
                  isRead: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              ],
              total: 1
            }
          }
        });
      } else if (url.includes('/api/notifications/unread/count')) {
        return Promise.resolve({
          data: {
            success: true,
            data: { count: 1 }
          }
        });
      }
      
      return Promise.reject(new Error('未知的 URL'));
    });
    
    axios.patch.mockResolvedValue({
      data: {
        success: true,
        data: { updated: true }
      }
    });
    
    axios.delete.mockResolvedValue({
      data: {
        success: true,
        data: { deleted: true }
      }
    });
  });
  
  test.skip('提供通知上下文给子组件', async () => {
    let rendered;
    
    await act(async () => {
      rendered = render(
        <AuthProvider>
          <NotificationProvider>
            <TestComponent />
          </NotificationProvider>
        </AuthProvider>
      );
    });
    
    const { getByTestId } = rendered;
    
    // 验证未读数量初始化为 0
    expect(getByTestId('unread-count').textContent).toBe('0');
    
    // 验证 socket.io 客户端被初始化
    expect(io).toHaveBeenCalledTimes(1);
    
    // 获取模拟的 socket 实例
    const mockSocket = io.mock.results[0].value;
    
    // 验证 socket 事件监听器被设置
    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('authenticated', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('notification', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('unreadCount', expect.any(Function));
  });
  
  test.skip('fetchNotifications 方法获取通知列表', async () => {
    let rendered;
    
    await act(async () => {
      rendered = render(
        <AuthProvider>
          <NotificationProvider>
            <TestComponent />
          </NotificationProvider>
        </AuthProvider>
      );
    });
    
    const { getByTestId } = rendered;
    
    // 点击获取通知按钮
    await act(async () => {
      getByTestId('fetch-button').click();
    });
    
    // 验证 axios.get 被调用
    expect(axios.get).toHaveBeenCalledWith('/api/notifications', expect.any(Object));
  });
  
  test.skip('markAsRead 方法标记通知为已读', async () => {
    let rendered;
    
    await act(async () => {
      rendered = render(
        <AuthProvider>
          <NotificationProvider>
            <TestComponent />
          </NotificationProvider>
        </AuthProvider>
      );
    });
    
    const { getByTestId } = rendered;
    
    // 点击标记为已读按钮
    await act(async () => {
      getByTestId('mark-read-button').click();
    });
    
    // 验证 axios.patch 被调用
    expect(axios.patch).toHaveBeenCalledWith('/api/notifications/test-id/read');
  });
  
  test.skip('markAllAsRead 方法标记所有通知为已读', async () => {
    let rendered;
    
    await act(async () => {
      rendered = render(
        <AuthProvider>
          <NotificationProvider>
            <TestComponent />
          </NotificationProvider>
        </AuthProvider>
      );
    });
    
    const { getByTestId } = rendered;
    
    // 点击全部标为已读按钮
    await act(async () => {
      getByTestId('mark-all-read-button').click();
    });
    
    // 验证 axios.patch 被调用
    expect(axios.patch).toHaveBeenCalledWith('/api/notifications/read-all');
  });
  
  test.skip('deleteNotification 方法删除通知', async () => {
    let rendered;
    
    await act(async () => {
      rendered = render(
        <AuthProvider>
          <NotificationProvider>
            <TestComponent />
          </NotificationProvider>
        </AuthProvider>
      );
    });
    
    const { getByTestId } = rendered;
    
    // 点击删除通知按钮
    await act(async () => {
      getByTestId('delete-button').click();
    });
    
    // 验证 axios.delete 被调用
    expect(axios.delete).toHaveBeenCalledWith('/api/notifications/test-id');
  });
  
  test.skip('showToast 方法显示通知', async () => {
    let rendered;
    
    await act(async () => {
      rendered = render(
        <AuthProvider>
          <NotificationProvider>
            <TestComponent />
          </NotificationProvider>
        </AuthProvider>
      );
    });
    
    const { getByTestId } = rendered;
    
    // 点击显示通知按钮
    await act(async () => {
      getByTestId('show-toast-button').click();
    });
    
    // 这里可以添加验证 toast 显示的逻辑，但需要根据实际实现方式调整
  });
}); 