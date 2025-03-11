import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Alerts from '../../app/alerts/page';
import { TestWrapper, mockUseAuth } from '../utils/TestWrapper';
import { alertsAPI } from '../../app/services/api';

// 模拟 next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    prefetch: jest.fn()
  })
}));

// 模拟 AuthProvider
jest.mock('../../app/services/authContext', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// 模拟 NotificationContext
jest.mock('../../context/NotificationContext', () => ({
  useNotification: () => ({
    notifications: [],
    unreadCount: 0,
    fetchNotifications: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    deleteNotification: jest.fn()
  }),
  NotificationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// 模拟 alertsAPI
jest.mock('../../app/services/api', () => {
  const originalModule = jest.requireActual('../../app/services/api');
  return {
    ...originalModule,
    alertsAPI: {
      getAlertStats: jest.fn().mockResolvedValue({
        total: 28,
        high: 12,
        medium: 10,
        low: 6
      }),
      getAlertRules: jest.fn().mockResolvedValue({
        rules: [
          {
            id: '1',
            name: '大额交易监控',
            target: '以太坊',
            condition: '交易金额 > 100 ETH',
            riskLevel: '中风险',
            channels: 'Slack, 邮件',
            status: '已启用'
          },
          {
            id: '2',
            name: '可疑地址交互',
            target: '多链',
            condition: '与黑名单地址交互',
            riskLevel: '高风险',
            channels: '飞书, 短信',
            status: '已启用'
          }
        ]
      }),
      getAlerts: jest.fn().mockResolvedValue({
        alerts: [
          {
            id: '1',
            time: '2023-08-01 09:41:12',
            rule: '大额交易监控',
            target: '0x7a2d...8f3e',
            riskLevel: '高风险',
            status: '未处理'
          },
          {
            id: '2',
            time: '2023-08-02 10:15:33',
            rule: '可疑地址交互',
            target: '0x5e9f...2c1b',
            riskLevel: '中风险',
            status: '已处理'
          }
        ],
        totalPages: 10,
        totalItems: 50,
        page: 1,
        limit: 5
      }),
      toggleAlertRule: jest.fn().mockResolvedValue({ success: true }),
      updateAlertStatus: jest.fn().mockResolvedValue({ success: true })
    }
  };
});

// 自定义渲染函数
const customRender = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestWrapper });
};

describe('警报页面', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('渲染警报页面的主要组件', async () => {
    await act(async () => {
      customRender(<Alerts />);
    });
    
    // 检查页面标题
    expect(screen.getByText('告警管理')).toBeInTheDocument();
    
    // 检查创建警报规则按钮
    expect(screen.getByText('创建告警规则')).toBeInTheDocument();
    
    // 检查风险等级统计卡片 - 使用 getAllByText 而不是 getByText
    const highRiskElements = screen.getAllByText('高风险');
    expect(highRiskElements.length).toBeGreaterThan(0);
    
    const mediumRiskElements = screen.getAllByText('中风险');
    expect(mediumRiskElements.length).toBeGreaterThan(0);
    
    const lowRiskElements = screen.getAllByText('低风险');
    expect(lowRiskElements.length).toBeGreaterThan(0);
    
    // 检查警报规则表格
    const alertRuleElements = screen.getAllByText('告警规则');
    expect(alertRuleElements.length).toBeGreaterThan(0);
    
    expect(screen.getAllByText('规则名称')[0]).toBeInTheDocument();
    expect(screen.getByText('监控对象')).toBeInTheDocument();
    expect(screen.getByText('触发条件')).toBeInTheDocument();
    expect(screen.getAllByText('风险等级')[0]).toBeInTheDocument();
    expect(screen.getByText('通知渠道')).toBeInTheDocument();
    
    // 使用 getAllByText 而不是 getByText
    const statusElements = screen.getAllByText('状态');
    expect(statusElements.length).toBeGreaterThan(0);
    
    expect(screen.getAllByText('操作')[0]).toBeInTheDocument();
    
    // 检查最近警报表格
    expect(screen.getByText('最近告警')).toBeInTheDocument();
    expect(screen.getByText('告警时间')).toBeInTheDocument();
    
    // 使用 getAllByText 而不是 getByText
    const alertRuleColumnElements = screen.getAllByText('告警规则');
    expect(alertRuleColumnElements.length).toBeGreaterThan(0);
    
    expect(screen.getAllByText('触发对象')[0]).toBeInTheDocument();
    expect(screen.getAllByText('风险等级')[1]).toBeInTheDocument();
    expect(screen.getAllByText('状态')[1]).toBeInTheDocument();
    expect(screen.getAllByText('操作')[1]).toBeInTheDocument();
  });
  
  test('风险等级筛选功能', async () => {
    await act(async () => {
      customRender(<Alerts />);
    });
    
    // 获取筛选下拉菜单
    const filterDropdown = screen.getByRole('combobox');
    
    // 选择高风险选项
    await act(async () => {
      fireEvent.change(filterDropdown, { target: { value: 'high' } });
    });
    
    // 验证 API 调用
    expect(alertsAPI.getAlerts).toHaveBeenCalledTimes(2); // 初始加载和筛选后
  });
  
  test('分页功能', async () => {
    await act(async () => {
      customRender(<Alerts />);
    });
    
    // 获取下一页按钮
    const nextPageButton = screen.getByText('下一页');
    
    // 点击下一页按钮
    await act(async () => {
      fireEvent.click(nextPageButton);
    });
    
    // 验证 API 调用
    expect(alertsAPI.getAlerts).toHaveBeenCalledTimes(2); // 初始加载和翻页后
  });
  
  test('处理 API 错误', async () => {
    // 模拟 API 错误
    (alertsAPI.getAlertStats as jest.Mock).mockRejectedValueOnce(new Error('API 错误'));
    (alertsAPI.getAlertRules as jest.Mock).mockRejectedValueOnce(new Error('API 错误'));
    
    await act(async () => {
      customRender(<Alerts />);
    });
    
    // 检查是否使用了模拟数据
    const transactionMonitorElements = screen.getAllByText('大额交易监控');
    expect(transactionMonitorElements.length).toBeGreaterThan(0);
    
    const suspiciousAddressElements = screen.getAllByText('可疑地址交互');
    expect(suspiciousAddressElements.length).toBeGreaterThan(0);
  });
});