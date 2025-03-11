'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { alertsAPI } from '../services/api';
import { useRouter } from 'next/navigation';

// 风险等级标签组件
const RiskLevelBadge = ({ level }: { level: string }) => {
  const colorMap: Record<string, string> = {
    '高风险': 'bg-red-100 text-red-800',
    '中风险': 'bg-yellow-100 text-yellow-800',
    '低风险': 'bg-green-100 text-green-800'
  };
  
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorMap[level] || 'bg-gray-100 text-gray-800'}`}>
      {level}
    </span>
  );
};

// 状态标签组件
const StatusBadge = ({ status }: { status: string }) => {
  const colorMap: Record<string, string> = {
    '已启用': 'bg-green-100 text-green-800',
    '已停用': 'bg-gray-100 text-gray-800',
    '已处理': 'bg-blue-100 text-blue-800',
    '未处理': 'bg-yellow-100 text-yellow-800'
  };
  
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorMap[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

// 定义类型
interface AlertStats {
  total: number;
  high: number;
  medium: number;
  low: number;
}

interface AlertRule {
  id: string;
  name: string;
  target: string;
  condition: string;
  riskLevel: string;
  channels: string;
  status: string;
}

interface Alert {
  id: string;
  time: string;
  rule: string;
  target: string;
  riskLevel: string;
  status: string;
}

interface AlertPagination {
  page: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function Alerts() {
  const router = useRouter();
  
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AlertStats>({
    total: 0,
    high: 0,
    medium: 0,
    low: 0
  });
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsFilter, setAlertsFilter] = useState('all');
  const [alertsPagination, setAlertsPagination] = useState<AlertPagination>({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 5
  });
  
  // 获取告警统计数据
  const fetchAlertStats = async () => {
    try {
      const data = await alertsAPI.getAlertStats();
      setStats({
        total: data.total || 0,
        high: data.high || 0,
        medium: data.medium || 0,
        low: data.low || 0
      });
    } catch (err) {
      console.error('获取告警统计失败:', err);
      setError('获取告警统计数据失败');
    }
  };
  
  // 获取告警规则列表
  const fetchAlertRules = async () => {
    try {
      const data = await alertsAPI.getAlertRules();
      setRules(data.rules || []);
    } catch (err) {
      console.error('获取告警规则失败:', err);
      setError('获取告警规则列表失败');
    }
  };
  
  // 获取告警列表
  const fetchAlerts = async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', alertsPagination.page.toString());
      params.append('limit', alertsPagination.itemsPerPage.toString());
      
      if (alertsFilter !== 'all') {
        params.append('riskLevel', alertsFilter);
      }
      
      const data = await alertsAPI.getAlerts(`?${params.toString()}`);
      
      setAlerts(data.alerts || []);
      setAlertsPagination({
        ...alertsPagination,
        totalPages: data.totalPages || 1,
        totalItems: data.totalItems || 0
      });
    } catch (err) {
      console.error('获取告警列表失败:', err);
      setError('获取告警列表失败');
    }
  };
  
  // 切换告警规则状态
  const handleToggleRule = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === '已启用' ? '已停用' : '已启用';
      await alertsAPI.toggleAlertRule(id, newStatus === '已启用');
      
      // 更新本地状态
      setRules(rules.map(rule => 
        rule.id === id ? { ...rule, status: newStatus } : rule
      ));
    } catch (err) {
      console.error('切换告警规则状态失败:', err);
      setError('切换告警规则状态失败');
    }
  };
  
  // 处理告警
  const handleProcessAlert = async (id: string) => {
    try {
      await alertsAPI.updateAlertStatus(id, '已处理');
      
      // 更新本地状态
      setAlerts(alerts.map(alert => 
        alert.id === id ? { ...alert, status: '已处理' } : alert
      ));
    } catch (err) {
      console.error('处理告警失败:', err);
      setError('处理告警失败');
    }
  };
  
  // 创建告警规则
  const handleCreateRule = () => {
    router.push('/alerts/create');
  };
  
  // 编辑告警规则
  const handleEditRule = (id: string) => {
    router.push(`/alerts/edit/${id}`);
  };
  
  // 查看告警详情
  const handleViewAlertDetails = (id: string) => {
    router.push(`/alerts/details/${id}`);
  };
  
  // 处理分页
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= alertsPagination.totalPages) {
      setAlertsPagination({
        ...alertsPagination,
        page: newPage
      });
    }
  };
  
  // 处理筛选变化
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAlertsFilter(e.target.value);
    setAlertsPagination({
      ...alertsPagination,
      page: 1 // 重置到第一页
    });
  };
  
  // 初始化数据加载
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchAlertStats(),
          fetchAlertRules()
        ]);
      } catch (err) {
        console.error('加载数据失败:', err);
        setError('加载数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // 当筛选条件或页码变化时重新获取告警列表
  useEffect(() => {
    fetchAlerts();
  }, [alertsFilter, alertsPagination.page]);
  
  // 模拟数据 - 当API不可用时使用
  const mockRules: AlertRule[] = [
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
    },
    {
      id: '3',
      name: '异常交易频率',
      target: '比特币',
      condition: '1小时内 > 50笔交易',
      riskLevel: '中风险',
      channels: '钉钉',
      status: '已停用'
    }
  ];
  
  const mockAlerts: Alert[] = [
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
    },
    {
      id: '3',
      time: '2023-08-03 14:22:45',
      rule: '异常交易频率',
      target: '0x7a2d...8f3e',
      riskLevel: '低风险',
      status: '未处理'
    },
    {
      id: '4',
      time: '2023-08-04 16:37:19',
      rule: '大额交易监控',
      target: '0x5e9f...2c1b',
      riskLevel: '高风险',
      status: '已处理'
    },
    {
      id: '5',
      time: '2023-08-05 08:53:27',
      rule: '可疑地址交互',
      target: '0x7a2d...8f3e',
      riskLevel: '中风险',
      status: '未处理'
    }
  ];
  
  // 如果API不可用，使用模拟数据
  useEffect(() => {
    if (error) {
      console.warn('使用模拟数据');
      setRules(mockRules);
      setAlerts(mockAlerts);
      setStats({
        total: 28,
        high: 12,
        medium: 10,
        low: 6
      });
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <Navbar currentPage="alerts" />

      {/* 主要内容 */}
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">告警管理</h2>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            onClick={handleCreateRule}
          >
            创建告警规则
          </button>
        </div>
        
        {/* 加载状态 */}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        )}
        
        {/* 错误提示 */}
        {error && !loading && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
            <p className="text-sm">使用模拟数据展示界面</p>
          </div>
        )}
        
        {/* 告警统计 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500 mb-1">今日告警</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500 mb-1">高风险</p>
            <p className="text-2xl font-bold text-red-500">{stats.high}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500 mb-1">中风险</p>
            <p className="text-2xl font-bold text-yellow-500">{stats.medium}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500 mb-1">低风险</p>
            <p className="text-2xl font-bold text-green-500">{stats.low}</p>
          </div>
        </div>
        
        {/* 告警规则列表 */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">告警规则</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">规则名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">监控对象</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">触发条件</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">风险等级</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">通知渠道</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(rules.length > 0 ? rules : mockRules).map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{rule.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rule.target}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rule.condition}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RiskLevelBadge level={rule.riskLevel} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rule.channels}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={rule.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        className="text-blue-600 hover:text-blue-800 mr-2"
                        onClick={() => handleEditRule(rule.id)}
                      >
                        编辑
                      </button>
                      <button 
                        className={rule.status === '已启用' ? "text-red-600 hover:text-red-800" : "text-green-600 hover:text-green-800"}
                        onClick={() => handleToggleRule(rule.id, rule.status)}
                      >
                        {rule.status === '已启用' ? '停用' : '启用'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* 最近告警 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-medium">最近告警</h3>
            <select 
              className="p-1 border rounded text-sm"
              value={alertsFilter}
              onChange={handleFilterChange}
            >
              <option value="all">所有风险等级</option>
              <option value="high">高风险</option>
              <option value="medium">中风险</option>
              <option value="low">低风险</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">告警时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">告警规则</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">触发对象</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">风险等级</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(alerts.length > 0 ? alerts : mockAlerts).map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alert.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{alert.rule}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alert.target}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RiskLevelBadge level={alert.riskLevel} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={alert.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        className="text-blue-600 hover:text-blue-800 mr-2"
                        onClick={() => handleViewAlertDetails(alert.id)}
                      >
                        查看详情
                      </button>
                      {alert.status === '未处理' && (
                        <button 
                          className="text-green-600 hover:text-green-800"
                          onClick={() => handleProcessAlert(alert.id)}
                        >
                          标记处理
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* 分页 */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  显示第 <span className="font-medium">{(alertsPagination.page - 1) * alertsPagination.itemsPerPage + 1}</span> 到 <span className="font-medium">{Math.min(alertsPagination.page * alertsPagination.itemsPerPage, alertsPagination.totalItems)}</span> 条，共 <span className="font-medium">{alertsPagination.totalItems}</span> 条结果
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button 
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${alertsPagination.page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50 cursor-pointer'}`}
                    onClick={() => handlePageChange(alertsPagination.page - 1)}
                    disabled={alertsPagination.page === 1}
                  >
                    上一页
                  </button>
                  
                  {[...Array(Math.min(5, alertsPagination.totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                          pageNum === alertsPagination.page ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button 
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${alertsPagination.page === alertsPagination.totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50 cursor-pointer'}`}
                    onClick={() => handlePageChange(alertsPagination.page + 1)}
                    disabled={alertsPagination.page === alertsPagination.totalPages}
                  >
                    下一页
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 