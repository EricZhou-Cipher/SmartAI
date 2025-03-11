import Navbar from '../components/Navbar';

export default function Addresses() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <Navbar currentPage="addresses" />

      {/* 主要内容 */}
      <div className="container mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold mb-6">地址分析</h2>
        
        {/* 搜索框 */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <input 
                type="text" 
                placeholder="输入区块链地址" 
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex gap-2">
              <select className="p-2 border rounded">
                <option>以太坊</option>
                <option>比特币</option>
                <option>Solana</option>
                <option>Polygon</option>
              </select>
              <button className="bg-blue-600 text-white px-4 py-2 rounded">分析</button>
            </div>
          </div>
        </div>
        
        {/* 地址信息卡片 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold">地址概览</h3>
              <p className="text-gray-500 mt-1">0x7a2d8d9e5f3e1b2c8a7f6d4e3c2b1a9f8e7d6c5b</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                中风险
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="border rounded p-3">
              <p className="text-sm text-gray-500">余额</p>
              <p className="text-lg font-semibold">123.45 ETH</p>
            </div>
            <div className="border rounded p-3">
              <p className="text-sm text-gray-500">交易次数</p>
              <p className="text-lg font-semibold">1,234</p>
            </div>
            <div className="border rounded p-3">
              <p className="text-sm text-gray-500">首次活动</p>
              <p className="text-lg font-semibold">2021-05-12</p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">标签</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">交易所</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">高频交易</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">DeFi 用户</span>
            </div>
          </div>
        </div>
        
        {/* 交易历史 */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">交易历史</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">交易哈希</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">对方地址</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((item) => (
                <tr key={item} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">0x8c3d...{item}e2f</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item % 2 === 0 ? '发送' : '接收'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0x5e9f...{item}c2b</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={item % 2 === 0 ? 'text-red-500' : 'text-green-500'}>
                      {item % 2 === 0 ? '-' : '+'}{item}.{item} ETH
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-07-{item < 10 ? '0' + item : item} 10:2{item}:45</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* 分页 */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  显示第 <span className="font-medium">1</span> 到 <span className="font-medium">5</span> 条，共 <span className="font-medium">1,234</span> 条结果
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">上一页</a>
                  <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600 hover:bg-gray-50">1</a>
                  <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">2</a>
                  <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">3</a>
                  <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">下一页</a>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 