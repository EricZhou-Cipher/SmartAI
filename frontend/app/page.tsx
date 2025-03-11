import Navbar from './components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <Navbar currentPage="home" />

      {/* 主要内容 */}
      <div className="container mx-auto py-12 px-4">
        {/* 标题部分 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">区块链智能分析平台</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            实时监控区块链交易，提供智能风险分析，帮助您保护数字资产安全
          </p>
        </div>

        {/* 功能卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-blue-500">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">实时交易监控</h3>
            <p className="text-gray-600">监控多链交易活动，实时捕获异常行为，提供即时预警</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-green-500">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">AI 风险分析</h3>
            <p className="text-gray-600">使用机器学习模型评估交易风险，识别潜在威胁和欺诈行为</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-purple-500">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">地址画像</h3>
            <p className="text-gray-600">构建地址行为画像，追踪历史活动模式，识别关联地址</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-yellow-500">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">多渠道告警</h3>
            <p className="text-gray-600">支持 Slack、飞书、钉钉等多种通知渠道，确保及时响应</p>
          </div>
        </div>

        {/* 统计数据 */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-blue-50 p-6 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">10+</p>
            <p className="text-gray-600">支持区块链</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <p className="text-3xl font-bold text-green-600">99.9%</p>
            <p className="text-gray-600">服务可用性</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">1000+</p>
            <p className="text-gray-600">风险模型</p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg">
            <p className="text-3xl font-bold text-yellow-600">24/7</p>
            <p className="text-gray-600">实时监控</p>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>© 2023 ChainIntelAI - 区块链智能分析平台</p>
          <p className="mt-2 text-gray-400">保护数字资产安全，提供专业区块链分析服务</p>
        </div>
      </footer>
    </div>
  );
} 