import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <div className="w-full max-w-7xl">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-center text-blue-800">
            ChainIntelAI 区块链智能分析平台
          </h1>
          <p className="text-xl text-center text-gray-600 mt-2">
            实时监控区块链交易，智能识别风险
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 风险监控卡片 */}
          <Link href="/dashboard" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  风险监控
                </h2>
                <div className="p-2 bg-red-100 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600">
                实时监控多链交易活动，捕获异常行为
              </p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm font-medium text-blue-600">
                  查看详情
                </span>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  3 个高风险警报
                </span>
              </div>
            </div>
          </Link>

          {/* 地址画像卡片 */}
          <Link href="/addresses" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  地址画像
                </h2>
                <div className="p-2 bg-blue-100 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600">
                构建地址行为画像，追踪历史活动模式
              </p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm font-medium text-blue-600">
                  查看详情
                </span>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  42 个地址分析
                </span>
              </div>
            </div>
          </Link>

          {/* 交易分析卡片 */}
          <Link href="/transactions" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  交易分析
                </h2>
                <div className="p-2 bg-green-100 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600">深入分析交易数据，识别潜在风险</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm font-medium text-blue-600">
                  查看详情
                </span>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  15,420 笔交易
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            系统概览
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-800">今日交易</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">15,420</p>
              <p className="text-sm text-blue-600 mt-1">较昨日 +12.5%</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-red-800">高风险警报</h3>
              <p className="text-3xl font-bold text-red-600 mt-2">42</p>
              <p className="text-sm text-red-600 mt-1">较昨日 -5.2%</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-green-800">
                平均处理时间
              </h3>
              <p className="text-3xl font-bold text-green-600 mt-2">0.25s</p>
              <p className="text-sm text-green-600 mt-1">较昨日 -15.3%</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">© 2025 ChainIntelAI. 保留所有权利。</p>
        </div>
      </div>
    </main>
  );
}
