import Navbar from '../components/Navbar';

export default function Transactions() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <Navbar currentPage="transactions" />

      {/* 主要内容 */}
      <div className="container mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold mb-6">交易监控</h2>
        
        {/* 搜索和筛选 */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <input 
                type="text" 
                placeholder="搜索交易哈希或地址" 
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex gap-2">
              <select className="p-2 border rounded">
                <option>所有区块链</option>
                <option>以太坊</option>
                <option>比特币</option>
                <option>Solana</option>
              </select>
              <select className="p-2 border rounded">
                <option>所有风险等级</option>
                <option>高风险</option>
                <option>中风险</option>
                <option>低风险</option>
              </select>
              <button className="bg-blue-600 text-white px-4 py-2 rounded">搜索</button>
            </div>
          </div>
        </div>
        
        {/* 交易列表 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">交易哈希</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">区块链</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">发送方</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">接收方</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">风险等级</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((item) => (
                <tr key={item} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">0x7a2d...{item}f3e</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">以太坊</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0x8b3c...{item}a1d</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0x5e9f...{item}c2b</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item}.{item} ETH</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item % 3 === 0 ? 'bg-red-100 text-red-800' : 
                      item % 3 === 1 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {item % 3 === 0 ? '高风险' : item % 3 === 1 ? '中风险' : '低风险'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-06-{item < 10 ? '0' + item : item} 14:3{item}:21</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* 分页 */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">上一页</a>
              <a href="#" className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">下一页</a>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  显示第 <span className="font-medium">1</span> 到 <span className="font-medium">5</span> 条，共 <span className="font-medium">12</span> 条结果
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">上一页</a>
                  <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">1</a>
                  <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600 hover:bg-gray-50">2</a>
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