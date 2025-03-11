import Navbar from '../components/Navbar';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <Navbar currentPage="dashboard" />

      {/* 主要内容 */}
      <div className="container mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold mb-6">仪表盘</h2>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-500 mb-2">今日交易</h3>
            <p className="text-3xl font-bold">12,345</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-500 mb-2">风险告警</h3>
            <p className="text-3xl font-bold text-red-500">28</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-500 mb-2">监控地址</h3>
            <p className="text-3xl font-bold">5,678</p>
          </div>
        </div>
        
        {/* 图表占位 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">交易趋势</h3>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
              <p className="text-gray-500">交易趋势图表</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">风险分布</h3>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
              <p className="text-gray-500">风险分布图表</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 