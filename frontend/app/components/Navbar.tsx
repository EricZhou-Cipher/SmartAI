interface NavbarProps {
  currentPage: 'home' | 'dashboard' | 'transactions' | 'addresses' | 'alerts';
}

export default function Navbar({ currentPage }: NavbarProps) {
  return (
    <nav className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">ChainIntelAI</h1>
        <div className="space-x-4">
          <a 
            href="/" 
            className={`${currentPage === 'home' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
          >
            首页
          </a>
          <a 
            href="/dashboard" 
            className={`${currentPage === 'dashboard' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
          >
            仪表盘
          </a>
          <a 
            href="/transactions" 
            className={`${currentPage === 'transactions' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
          >
            交易监控
          </a>
          <a 
            href="/addresses" 
            className={`${currentPage === 'addresses' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
          >
            地址分析
          </a>
          <a 
            href="/alerts" 
            className={`${currentPage === 'alerts' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
          >
            告警管理
          </a>
        </div>
      </div>
    </nav>
  );
} 