'use client';

import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from '../context/AuthContext'
import { NotificationProvider } from '../context/NotificationContext'
import { LogProvider } from '../context/LogContext'

export const metadata: Metadata = {
  title: 'ChainIntelAI - 区块链智能分析平台',
  description: '实时监控区块链交易，提供智能风险分析',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>
        <AuthProvider>
          <NotificationProvider>
            <LogProvider>
              {children}
            </LogProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 