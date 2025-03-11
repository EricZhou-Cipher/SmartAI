'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../../components/Navbar';
import { alertsAPI } from '../../../services/api';

interface AlertRule {
  id: string;
  name: string;
  target: string;
  condition: string;
  riskLevel: string;
  channels: string;
  description: string;
  status: string;
}

export default function EditAlertRule({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AlertRule>({
    id: '',
    name: '',
    target: '',
    condition: '',
    riskLevel: '中风险',
    channels: '',
    description: '',
    status: '已启用'
  });
  
  // 获取告警规则详情
  useEffect(() => {
    const fetchAlertRule = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await alertsAPI.getAlertRule(id);
        setFormData(data);
      } catch (err) {
        console.error('获取告警规则失败:', err);
        setError('获取告警规则失败，请稍后重试');
        // 使用模拟数据
        setFormData(mockAlertRule);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlertRule();
  }, [id]);
  
  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      await alertsAPI.updateAlertRule(id, formData);
      router.push('/alerts');
    } catch (err) {
      console.error('更新告警规则失败:', err);
      setError('更新告警规则失败，请稍后重试');
      setSaving(false);
    }
  };
  
  // 取消编辑
  const handleCancel = () => {
    router.push('/alerts');
  };
  
  // 模拟数据
  const mockAlertRule: AlertRule = {
    id,
    name: '大额交易监控',
    target: '以太坊',
    condition: '交易金额 > 100 ETH',
    riskLevel: '中风险',
    channels: 'Slack, 邮件',
    description: '监控以太坊网络上的大额交易，当交易金额超过100 ETH时触发告警。',
    status: '已启用'
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
              onClick={handleCancel}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold">编辑告警规则</h2>
          </div>
        </div>
        
        {/* 加载状态 */}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        )}
        
        {/* 错误提示 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        {/* 表单 */}
        {!loading && (
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 规则名称 */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    规则名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例如：大额交易监控"
                  />
                </div>
                
                {/* 监控对象 */}
                <div>
                  <label htmlFor="target" className="block text-sm font-medium text-gray-700 mb-1">
                    监控对象 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="target"
                    name="target"
                    value={formData.target}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例如：以太坊、比特币或多链"
                  />
                </div>
                
                {/* 触发条件 */}
                <div>
                  <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                    触发条件 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例如：交易金额 > 100 ETH"
                  />
                </div>
                
                {/* 风险等级 */}
                <div>
                  <label htmlFor="riskLevel" className="block text-sm font-medium text-gray-700 mb-1">
                    风险等级 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="riskLevel"
                    name="riskLevel"
                    value={formData.riskLevel}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="高风险">高风险</option>
                    <option value="中风险">中风险</option>
                    <option value="低风险">低风险</option>
                  </select>
                </div>
                
                {/* 通知渠道 */}
                <div>
                  <label htmlFor="channels" className="block text-sm font-medium text-gray-700 mb-1">
                    通知渠道 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="channels"
                    name="channels"
                    value={formData.channels}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例如：邮件、Slack、钉钉"
                  />
                </div>
                
                {/* 状态 */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    状态 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="已启用">已启用</option>
                    <option value="已停用">已停用</option>
                  </select>
                </div>
              </div>
              
              {/* 规则描述 */}
              <div className="mt-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  规则描述
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入规则的详细描述..."
                ></textarea>
              </div>
              
              {/* 按钮组 */}
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {saving ? '保存中...' : '保存规则'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
} 