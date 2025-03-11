'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../../components/Navbar';
import { alertsAPI } from '../../../services/api';

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
    '已处理': 'bg-blue-100 text-blue-800',
    '未处理': 'bg-yellow-100 text-yellow-800'
  };
  
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorMap[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

interface AlertDetail {
  id: string;
  time: string;
  rule: {
    id: string;
    name: string;
    condition: string;
    riskLevel: string;
  };
  target: string;
  riskLevel: string;
  status: string;
  description: string;
  relatedTransactions: Array<{
    id: string;
    hash: string;
    time: string;
    amount: string;
    from: string;
    to: string;
  }>;
}

export default function AlertDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertDetail, setAlertDetail] = useState<AlertDetail | null>(null);
  const [processingAlert, setProcessingAlert] = useState(false);
  
  // 获取告警详情
  useEffect(() => {
    const fetchAlertDetail = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await alertsAPI.getAlert(id);
        setAlertDetail(data);
      } catch (err) {
        console.error('获取告警详情失败:', err);
        setError('获取告警详情失败，请稍后重试');
        // 使用模拟数据
        setAlertDetail(mockAlertDetail);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlertDetail();
  }, [id]);
  
  // 处理告警
  const handleProcessAlert = async () => {
    if (!alertDetail || alertDetail.status === '已处理') return;
    
    setProcessingAlert(true);
    
    try {
      await alertsAPI.updateAlertStatus(id, '已处理');
      
      // 更新本地状态
      setAlertDetail({
        ...alertDetail,
        status: '已处理'
      });
    } catch (err) {
      console.error('处理告警失败:', err);
      setError('处理告警失败，请稍后重试');
    } finally {
      setProcessingAlert(false);
    }
  };
  
  // 返回列表
  const handleBack = () => {
    router.push('/alerts');
  };
  
  // 查看交易详情
  const handleViewTransaction = (txId: string) => {
    router.push(`/transactions/${txId}`);
  };
  
  // 查看地址详情
  const handleViewAddress = (address: string) => {
    router.push(`/address/${address}`);
  };
  
  // 模拟数据
  const mockAlertDetail: AlertDetail = {
    id,
    time: '2023-08-01 09:41:12',
    rule: {
      id: '1',
      name: '大额交易监控',
      condition: '交易金额 > 100 ETH',
      riskLevel: '高风险'
    },
    target: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
    riskLevel: '高风险',
    status: '未处理',
    description: '检测到大额交易，交易金额超过设定阈值，可能存在洗钱风险。',
    relatedTransactions: [
      {
        id: 'tx1',
        hash: '0x3a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
        time: '2023-08-01 09:40:22',
        amount: '120.5 ETH',
        from: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
        to: '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f'
      },
      {
        id: 'tx2',
        hash: '0x9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a',
        time: '2023-08-01 09:35:18',
        amount: '85.3 ETH',
        from: '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f',
        to: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d'
      }
    ]
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <Navbar currentPage="alerts" />
      
      {/* 主要内容 */}
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold">告警详情</h2>
          </div>
          
          {alertDetail && alertDetail.status === '未处理' && (
            <button
              onClick={handleProcessAlert}
              disabled={processingAlert}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${processingAlert ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {processingAlert ? '处理中...' : '标记为已处理'}
            </button>
          )}
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
            {alertDetail && <p className="text-sm">使用模拟数据展示界面</p>}
          </div>
        )}
        
        {/* 告警详情 */}
        {alertDetail && !loading && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* 基本信息 */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">告警信息</h3>
                  <p className="text-sm text-gray-500 mb-1">告警ID: {alertDetail.id}</p>
                  <p className="text-sm text-gray-500 mb-1">告警时间: {alertDetail.time}</p>
                  <p className="text-sm text-gray-500 mb-1">
                    状态: <StatusBadge status={alertDetail.status} />
                  </p>
                </div>
                <div>
                  <RiskLevelBadge level={alertDetail.riskLevel} />
                </div>
              </div>
            </div>
            
            {/* 规则信息 */}
            <div className="p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900 mb-4">规则信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">规则名称:</p>
                  <p className="font-medium">{alertDetail.rule.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">触发条件:</p>
                  <p className="font-medium">{alertDetail.rule.condition}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">风险等级:</p>
                  <p className="font-medium">
                    <RiskLevelBadge level={alertDetail.rule.riskLevel} />
                  </p>
                </div>
              </div>
            </div>
            
            {/* 触发对象 */}
            <div className="p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900 mb-4">触发对象</h3>
              <div className="flex items-center">
                <p className="font-mono text-sm mr-2">{alertDetail.target}</p>
                <button
                  onClick={() => handleViewAddress(alertDetail.target)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  查看地址详情
                </button>
              </div>
            </div>
            
            {/* 告警描述 */}
            <div className="p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900 mb-4">告警描述</h3>
              <p className="text-gray-700">{alertDetail.description}</p>
            </div>
            
            {/* 相关交易 */}
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">相关交易</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">交易哈希</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">发送方</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">接收方</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {alertDetail.relatedTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                          {tx.hash.substring(0, 10)}...{tx.hash.substring(tx.hash.length - 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.time}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{tx.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                          {tx.from.substring(0, 6)}...{tx.from.substring(tx.from.length - 4)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                          {tx.to.substring(0, 6)}...{tx.to.substring(tx.to.length - 4)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleViewTransaction(tx.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            查看详情
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 