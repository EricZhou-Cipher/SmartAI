import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./services/authContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ChainIntelAI - 区块链智能分析平台",
  description: "实时监控区块链交易，分析地址风险，保障资产安全",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <main>{children}</main>
            <footer className="bg-gray-800 text-white py-8 mt-12">
              <div className="container mx-auto px-4 text-center">
                <p>© 2023 ChainIntelAI - 区块链智能分析平台</p>
                <p className="mt-2 text-gray-400">
                  保护数字资产安全，提供专业区块链分析服务
                </p>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
