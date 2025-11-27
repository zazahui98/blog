'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, MessageSquare, FileText, Settings } from 'lucide-react';
import Link from 'next/link';
import { 
  getUserNotifications, 
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  Notification 
} from '@/lib/supabase-helpers';
import { getCurrentUser } from '@/lib/auth';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const user = await getCurrentUser();
      if (user?.id) {
        setUserId(user.id);
        loadUnreadCount(user.id);
      }
    };
    init();
  }, []);

  useEffect(() => {
    // 点击外部关闭
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadUnreadCount = async (uid: string) => {
    const { count } = await getUnreadNotificationCount(uid);
    setUnreadCount(count);
  };

  const loadNotifications = async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await getUserNotifications(userId, { limit: 10 });
    setNotifications(data || []);
    setLoading(false);
  };

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      loadNotifications();
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    await markAllNotificationsAsRead(userId);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment_reply': return MessageSquare;
      case 'article_update': return FileText;
      case 'system': return Settings;
      default: return Bell;
    }
  };

  const getNotificationLink = (notification: Notification) => {
    if (notification.related_type === 'post' && notification.related_id) {
      return `/blog/${notification.related_id}`;
    }
    if (notification.related_type === 'comment' && notification.related_id) {
      return '#'; // 可以跳转到评论位置
    }
    return '#';
  };

  if (!userId) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpen}
        className="relative p-2 text-gray-300 hover:text-white transition-colors rounded-full hover:bg-slate-800/50"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="font-semibold text-white">通知</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" />
                  全部已读
                </button>
              )}
            </div>

            {/* 通知列表 */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-400">
                  <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">暂无通知</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-700/50">
                  {notifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    return (
                      <Link
                        key={notification.id}
                        href={getNotificationLink(notification)}
                        onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                        className={`flex items-start gap-3 p-4 hover:bg-slate-800/50 transition-colors ${
                          !notification.is_read ? 'bg-cyan-500/5' : ''
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          !notification.is_read ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-gray-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notification.is_read ? 'text-white font-medium' : 'text-gray-300'}`}>
                            {notification.title}
                          </p>
                          {notification.content && (
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {notification.content}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.created_at).toLocaleString('zh-CN')}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 底部 */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-slate-700 text-center">
                <Link
                  href="/notifications"
                  className="text-sm text-cyan-400 hover:text-cyan-300"
                  onClick={() => setIsOpen(false)}
                >
                  查看全部通知
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
