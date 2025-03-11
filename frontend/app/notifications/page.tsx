"use client";

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import Navbar from '../../components/Navbar';
import { useNotification, Notification } from '../../context/NotificationContext';

export default function NotificationsPage() {
  const router = useRouter();
  const { 
    notifications, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotification();
  
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'alert' | 'system' | 'transaction'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      await fetchNotifications();
      setIsLoading(false);
    };
    
    loadNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
  };

  const formatTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN });
    } catch (error) {
      return '无效日期';
    }
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'alert': return '告警';
      case 'system': return '系统';
      case 'transaction': return '交易';
      default: return '其他';
    }
  };

  const getPriorityLabel = (priority: string): string => {
    switch (priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '普通';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getTypeIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'alert':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        );
      case 'system':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        );
      case 'transaction':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
    }
  };

  // 过滤通知
  const filteredNotifications = notifications.filter((notification: Notification) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return notification.type === filter;
  });

  // 分页
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="notifications" />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h1 className="text-lg font-medium text-gray-900">通知中心</h1>
              <div className="flex space-x-2">
                <button
                  onClick={handleMarkAllAsRead}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  全部标为已读
                </button>
              </div>
            </div>
            
            <div className="border-t border-gray-200">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex flex-wrap items-center justify-between">
                  <div className="flex space-x-2 mb-2 sm:mb-0">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${
                        filter === 'all'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      全部
                    </button>
                    <button
                      onClick={() => setFilter('unread')}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${
                        filter === 'unread'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      未读
                    </button>
                    <button
                      onClick={() => setFilter('alert')}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${
                        filter === 'alert'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      告警
                    </button>
                    <button
                      onClick={() => setFilter('system')}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${
                        filter === 'system'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      系统
                    </button>
                    <button
                      onClick={() => setFilter('transaction')}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${
                        filter === 'transaction'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      交易
                    </button>
                  </div>
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : paginatedNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">没有通知</h3>
                  <p className="mt-1 text-sm text-gray-500">当前没有符合条件的通知。</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {paginatedNotifications.map((notification) => (
                    <li 
                      key={notification._id} 
                      className={`px-4 py-4 sm:px-6 hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                                {getPriorityLabel(notification.priority)}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">
                                {formatTime(notification.createdAt)}
                              </span>
                            </div>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            {notification.message}
                          </p>
                          <div className="mt-2 flex justify-between items-center">
                            <div className="flex space-x-2">
                              <span className="inline-flex items-center text-xs text-gray-500">
                                <span className="inline-block w-2 h-2 rounded-full mr-1 bg-gray-300"></span>
                                {getTypeLabel(notification.type)}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              {!notification.isRead && (
                                <button
                                  onClick={() => handleMarkAsRead(notification._id)}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  标为已读
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(notification._id)}
                                className="text-xs text-red-600 hover:text-red-800"
                              >
                                删除
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              
              {/* 分页 */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        显示第 <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> 到 
                        <span className="font-medium"> {Math.min(currentPage * itemsPerPage, filteredNotifications.length)}</span> 条，
                        共 <span className="font-medium">{filteredNotifications.length}</span> 条
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="分页">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">上一页</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        {Array.from({ length: totalPages }).map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentPage(index + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === index + 1
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === totalPages
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">下一页</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 