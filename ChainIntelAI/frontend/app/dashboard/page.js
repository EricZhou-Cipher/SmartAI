export default function Dashboard() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <div className="w-full max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">风险监控仪表盘</h1>
          <p className="text-gray-600 mt-2">
            实时监控区块链交易活动，智能识别风险
          </p>
        </header>

        {/* 风险概览卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-medium text-gray-800">今日交易</h2>
            <p className="text-3xl font-bold text-blue-600 mt-2">15,420</p>
            <div className="flex items-center mt-2">
              <span className="text-green-500 text-sm font-medium flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                12.5%
              </span>
              <span className="text-gray-500 text-sm ml-1">较昨日</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-medium text-gray-800">高风险交易</h2>
            <p className="text-3xl font-bold text-red-600 mt-2">42</p>
            <div className="flex items-center mt-2">
              <span className="text-red-500 text-sm font-medium flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                8.3%
              </span>
              <span className="text-gray-500 text-sm ml-1">较昨日</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-medium text-gray-800">中风险交易</h2>
            <p className="text-3xl font-bold text-yellow-600 mt-2">156</p>
            <div className="flex items-center mt-2">
              <span className="text-green-500 text-sm font-medium flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                5.2%
              </span>
              <span className="text-gray-500 text-sm ml-1">较昨日</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-medium text-gray-800">平均处理时间</h2>
            <p className="text-3xl font-bold text-green-600 mt-2">0.25s</p>
            <div className="flex items-center mt-2">
              <span className="text-green-500 text-sm font-medium flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                15.3%
              </span>
              <span className="text-gray-500 text-sm ml-1">较昨日</span>
            </div>
          </div>
        </div>

        {/* 风险告警表格 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              最新风险告警
            </h2>
            <a
              href="/alerts"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              查看全部
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    告警 ID
                  </th>
                  <th scope="col" className="px-6 py-3">
                    时间
                  </th>
                  <th scope="col" className="px-6 py-3">
                    风险类型
                  </th>
                  <th scope="col" className="px-6 py-3">
                    交易哈希
                  </th>
                  <th scope="col" className="px-6 py-3">
                    风险等级
                  </th>
                  <th scope="col" className="px-6 py-3">
                    状态
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    ALERT-001
                  </td>
                  <td className="px-6 py-4">2023-03-15 14:30</td>
                  <td className="px-6 py-4">大额转账</td>
                  <td className="px-6 py-4 font-mono">0x1234...5678</td>
                  <td className="px-6 py-4">
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      高风险
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      待处理
                    </span>
                  </td>
                </tr>
                <tr className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    ALERT-002
                  </td>
                  <td className="px-6 py-4">2023-03-15 13:45</td>
                  <td className="px-6 py-4">可疑合约调用</td>
                  <td className="px-6 py-4 font-mono">0x5678...9012</td>
                  <td className="px-6 py-4">
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      高风险
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      已处理
                    </span>
                  </td>
                </tr>
                <tr className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    ALERT-003
                  </td>
                  <td className="px-6 py-4">2023-03-15 12:15</td>
                  <td className="px-6 py-4">闪电贷</td>
                  <td className="px-6 py-4 font-mono">0x9012...3456</td>
                  <td className="px-6 py-4">
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      中风险
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      待处理
                    </span>
                  </td>
                </tr>
                <tr className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    ALERT-004
                  </td>
                  <td className="px-6 py-4">2023-03-15 11:30</td>
                  <td className="px-6 py-4">混币交易</td>
                  <td className="px-6 py-4 font-mono">0x3456...7890</td>
                  <td className="px-6 py-4">
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      高风险
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      待处理
                    </span>
                  </td>
                </tr>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    ALERT-005
                  </td>
                  <td className="px-6 py-4">2023-03-15 10:45</td>
                  <td className="px-6 py-4">异常交易频率</td>
                  <td className="px-6 py-4 font-mono">0x7890...1234</td>
                  <td className="px-6 py-4">
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      中风险
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      已处理
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 风险分布图表 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">风险分布</h2>
          <div className="h-64 flex items-end justify-between px-4">
            <div className="flex flex-col items-center">
              <div
                className="bg-blue-500 w-12 rounded-t-lg"
                style={{ height: "200px" }}
              ></div>
              <span className="text-xs mt-2 text-gray-500">0.0-0.1</span>
              <span className="text-xs mt-1 font-medium">12,500</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className="bg-blue-500 w-12 rounded-t-lg"
                style={{ height: "32px" }}
              ></div>
              <span className="text-xs mt-2 text-gray-500">0.1-0.2</span>
              <span className="text-xs mt-1 font-medium">2,000</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className="bg-blue-500 w-12 rounded-t-lg"
                style={{ height: "8px" }}
              ></div>
              <span className="text-xs mt-2 text-gray-500">0.2-0.3</span>
              <span className="text-xs mt-1 font-medium">500</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className="bg-blue-500 w-12 rounded-t-lg"
                style={{ height: "3.2px" }}
              ></div>
              <span className="text-xs mt-2 text-gray-500">0.3-0.4</span>
              <span className="text-xs mt-1 font-medium">200</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className="bg-blue-500 w-12 rounded-t-lg"
                style={{ height: "1.6px" }}
              ></div>
              <span className="text-xs mt-2 text-gray-500">0.4-0.5</span>
              <span className="text-xs mt-1 font-medium">100</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className="bg-yellow-500 w-12 rounded-t-lg"
                style={{ height: "1.1px" }}
              ></div>
              <span className="text-xs mt-2 text-gray-500">0.5-0.6</span>
              <span className="text-xs mt-1 font-medium">70</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className="bg-yellow-500 w-12 rounded-t-lg"
                style={{ height: "0.5px" }}
              ></div>
              <span className="text-xs mt-2 text-gray-500">0.6-0.7</span>
              <span className="text-xs mt-1 font-medium">30</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className="bg-red-500 w-12 rounded-t-lg"
                style={{ height: "0.24px" }}
              ></div>
              <span className="text-xs mt-2 text-gray-500">0.7-0.8</span>
              <span className="text-xs mt-1 font-medium">15</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className="bg-red-500 w-12 rounded-t-lg"
                style={{ height: "0.06px" }}
              ></div>
              <span className="text-xs mt-2 text-gray-500">0.8-0.9</span>
              <span className="text-xs mt-1 font-medium">4</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className="bg-red-500 w-12 rounded-t-lg"
                style={{ height: "0.02px" }}
              ></div>
              <span className="text-xs mt-2 text-gray-500">0.9-1.0</span>
              <span className="text-xs mt-1 font-medium">1</span>
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
              <span className="text-xs text-gray-500">低风险</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
              <span className="text-xs text-gray-500">中风险</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
              <span className="text-xs text-gray-500">高风险</span>
            </div>
          </div>
        </div>

        {/* 链分布 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">链分布</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                交易数量
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      以太坊
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      8,245
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: "53.5%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      币安智能链
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      4,320
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: "28%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      Polygon
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      2,150
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: "14%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      Arbitrum
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      705
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-400 h-2 rounded-full"
                      style={{ width: "4.5%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                风险告警
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      以太坊
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      24
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: "57.1%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      币安智能链
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      12
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: "28.6%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      Polygon
                    </span>
                    <span className="text-sm font-medium text-gray-700">5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: "11.9%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      Arbitrum
                    </span>
                    <span className="text-sm font-medium text-gray-700">1</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-400 h-2 rounded-full"
                      style={{ width: "2.4%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
