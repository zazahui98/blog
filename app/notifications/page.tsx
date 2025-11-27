'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, MessageSquare, Heart, FileText, AlertCircle } from 'lucide-react';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, Notification } from '@/lib/supabase-helpers';
import { getCurrentUser } from '@/lib/auth';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import Link from 'next/link';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    const init = async () => {
      const user = await getCurrentUser();
      if (user) {
        setUserId(user.id);
        loadNotifications(user.id);
      } else {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadNotifications = async (uid: string) => {
    setLoading(true);
    const { data } = await getUserNotifications(uid, { unreadOnly: filter === 'unread' });
    setNotifications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (userId) {
      loadNotifications(userId);
    }
  }, [filter, userId]);

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    await markAllNotificationsAsRead(userId);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment_reply': return MessageSquare;
      case 'article_like': return Heart;
      case 'article_update': return FileText;
      case 'mention': return Bell;
      default: return AlertCircle;
    }
  };

  const getNotificationLink = (notification: Notification) => {
    if (notification.related_type === 'post' && notification.related_id) {
      return `/blog/${notification.related_id}`;
    }
    if (notification.related_type === 'comment' && notification.related_id) {
      return `/blog/${notification.related_id}#comments`;
    }
    return null;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;


  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      <AnnouncementBanner />
      
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          {/* 页面标题 */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-cyan-400" />
              <h1 className="text-2xl font-bold text-white">我的通知</h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {unreadCount} 未读
                </span>
              )}
            </div>
            
            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 text-cyan-400 border border-cyan-400/30 rounded-lg hover:bg-cyan-400/10 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                全部已读
              </motion.button>
            )}
          </div>

          {/* 筛选标签 */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800 text-gray-400 hover:text-white'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'unread'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800 text-gray-400 hover:text-white'
              }`}
            >
              未读
            </button>
          </div>

          {/* 通知列表 */}
          {!userId ? (
            <div className="bg-slate-900/50 border border-cyan-400/20 rounded-2xl p-8 text-center">
              <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">请先登录查看通知</p>
              <Link href="/" className="text-cyan-400 hover:text-cyan-300">
                返回首页登录
              </Link>
            </div>
          ) : loading ? (
            <div className="bg-slate-900/50 border border-cyan-400/20 rounded-2xl p-8 text-center">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-slate-900/50 border border-cyan-400/20 rounded-2xl p-8 text-center">
              <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                {filter === 'unread' ? '没有未读通知' : '暂无通知'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification, index) => {
                const Icon = getNotificationIcon(notification.type);
                const link = getNotificationLink(notification);
                
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-slate-900/50 border rounded-xl p-4 transition-colors ${
                      notification.is_read
                        ? 'border-slate-700/50'
                        : 'border-cyan-400/30 bg-cyan-500/5'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${
                        notification.is_read ? 'bg-slate-800' : 'bg-cyan-500/20'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          notification.is_read ? 'text-gray-500' : 'text-cyan-400'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className={`font-medium ${
                              notification.is_read ? 'text-gray-400' : 'text-white'
                            }`}>
                              {notification.title}
                            </h3>
                            {notification.content && (
                              <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                                {notification.content}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatTime(notification.created_at)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-3">
                          {link && (
                            <Link
                              href={link}
                              className="text-sm text-cyan-400 hover:text-cyan-300"
                            >
                              查看详情
                            </Link>
                          )}
                          {!notification.is_read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-sm text-gray-500 hover:text-gray-400 flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              标记已读
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
