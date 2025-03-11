import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationCenter from '../../components/NotificationCenter';
import { AuthProvider } from '../../context/AuthContext';

// 模拟通知上下文
jest.mock('../../context/NotificationContext', () => {
  const originalModule = jest.requireActual('../../context/NotificationContext');
  
  return {
    ...originalModule,
    useNotification: () => ({
      notifications: [
        {
          _id: '1',
          title: '系统通知',
          message: '系统维护通知',
          type: 'system',
          priority: 'medium',
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          title: '交易警报',
          message: '检测到可疑交易',
          type: 'alert',
          priority: 'high',
          isRead: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString()
        }
      ],
      unreadCount: 1,
      fetchNotifications: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      deleteNotification: jest.fn(),
      showToast: jest.fn()
    })
  };
});

// 模拟认证上下文
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

// 自定义渲染函数，包装AuthProvider
const customRender = (ui: React.ReactElement) => {
  return render(
    <AuthProvider>
      {ui}
    </AuthProvider>
  );
};

describe('NotificationCenter 组件', () => {
  beforeEach(() => {
    // 清除所有模拟函数的调用记录
    jest.clearAllMocks();
  });

  test.skip('渲染通知中心按钮和未读数量', () => {
    customRender(<NotificationCenter />);
    
    // 检查通知按钮是否存在
    const notificationButton = screen.getByRole('button', { name: /通知/i });
    expect(notificationButton).toBeInTheDocument();
    
    // 检查未读数量是否显示
    const unreadBadge = screen.getByText('1');
    expect(unreadBadge).toBeInTheDocument();
  });

  test.skip('点击按钮时显示通知下拉菜单', () => {
    customRender(<NotificationCenter />);
    
    // 初始状态下下拉菜单应该是隐藏的
    expect(screen.queryByText('全部标为已读')).not.toBeInTheDocument();
    
    // 点击通知按钮
    const notificationButton = screen.getByRole('button', { name: /通知/i });
    fireEvent.click(notificationButton);
    
    // 下拉菜单应该显示
    expect(screen.getByText('全部标为已读')).toBeInTheDocument();
    expect(screen.getByText('查看所有通知')).toBeInTheDocument();
    
    // 通知项应该显示
    expect(screen.getByText('系统通知')).toBeInTheDocument();
    expect(screen.getByText('交易警报')).toBeInTheDocument();
  });

  test.skip('点击"全部标为已读"按钮时调用 markAllAsRead 函数', async () => {
    const { useNotification } = jest.requireMock('../../context/NotificationContext');
    const { markAllAsRead } = useNotification();
    
    customRender(<NotificationCenter />);
    
    // 点击通知按钮打开下拉菜单
    const notificationButton = screen.getByRole('button', { name: /通知/i });
    fireEvent.click(notificationButton);
    
    // 点击"全部标为已读"按钮
    const markAllAsReadButton = screen.getByText('全部标为已读');
    fireEvent.click(markAllAsReadButton);
    
    // 验证 markAllAsRead 函数被调用
    await waitFor(() => {
      expect(markAllAsRead).toHaveBeenCalledTimes(1);
    });
  });

  test.skip('点击通知项时调用 markAsRead 函数', async () => {
    const { useNotification } = jest.requireMock('../../context/NotificationContext');
    const { markAsRead } = useNotification();
    
    customRender(<NotificationCenter />);
    
    // 点击通知按钮打开下拉菜单
    const notificationButton = screen.getByRole('button', { name: /通知/i });
    fireEvent.click(notificationButton);
    
    // 点击未读通知项
    const notificationItem = screen.getByText('系统通知').closest('div');
    if (notificationItem) {
      fireEvent.click(notificationItem);
    }
    
    // 验证 markAsRead 函数被调用，并且传入了正确的通知 ID
    await waitFor(() => {
      expect(markAsRead).toHaveBeenCalledTimes(1);
      expect(markAsRead).toHaveBeenCalledWith('1');
    });
  });

  test.skip('点击外部区域时关闭下拉菜单', () => {
    customRender(<NotificationCenter />);
    
    // 点击通知按钮打开下拉菜单
    const notificationButton = screen.getByRole('button', { name: /通知/i });
    fireEvent.click(notificationButton);
    
    // 确认下拉菜单已打开
    expect(screen.getByText('全部标为已读')).toBeInTheDocument();
    
    // 模拟点击外部区域
    fireEvent.mouseDown(document);
    
    // 下拉菜单应该关闭
    expect(screen.queryByText('全部标为已读')).not.toBeInTheDocument();
  });
}); 