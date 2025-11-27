'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, AlertTriangle, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { getActiveAnnouncements, dismissAnnouncement, Announcement } from '@/lib/supabase-helpers';
import { getCurrentUser } from '@/lib/auth';

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const user = await getCurrentUser();
      setUserId(user?.id || null);
      await loadAnnouncements(user?.id);
      setLoading(false);
    };
    init();
  }, []);

  const loadAnnouncements = async (uid?: string) => {
    const { data } = await getActiveAnnouncements(uid);
    setAnnouncements(data || []);
  };

  const handleDismiss = async (announcementId: string) => {
    if (userId) {
      await dismissAnnouncement(announcementId, userId);
    }
    setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
    if (currentIndex >= announcements.length - 1) {
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  const nextAnnouncement = () => {
    setCurrentIndex(prev => (prev + 1) % announcements.length);
  };

  const prevAnnouncement = () => {
    setCurrentIndex(prev => (prev - 1 + announcements.length) % announcements.length);
  };

  const getTypeStyles = (type: any) => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
          border: 'border-yellow-500/30',
          icon: AlertTriangle,
          iconColor: 'text-yellow-400',
        };
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
          border: 'border-green-500/30',
          icon: CheckCircle,
          iconColor: 'text-green-400',
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500/20 to-rose-500/20',
          border: 'border-red-500/30',
          icon: AlertCircle,
          iconColor: 'text-red-400',
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20',
          border: 'border-cyan-500/30',
          icon: Info,
          iconColor: 'text-cyan-400',
        };
    }
  };

  if (loading || announcements.length === 0) return null;

  const current = announcements[currentIndex];
  const styles = getTypeStyles(current.type);
  const Icon = styles.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full max-w-7xl mx-auto px-4 mt-24 mb-4 ${styles.bg} ${styles.border} border backdrop-blur-xl rounded-2xl shadow-xl`}
    >
      <div className="flex items-center gap-4 px-4 py-3">
        {/* 图标 */}
        <div className={`flex-shrink-0 ${styles.iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2"
            >
              <span className="font-medium text-white">{current.title}</span>
              {current.content && (
                <span className="text-gray-300 text-sm hidden sm:inline">
                  - {current.content}
                </span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 导航按钮（多条公告时显示） */}
        {announcements.length > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={prevAnnouncement}
              className="p-1 text-gray-400 hover:text-white rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-400 min-w-[3rem] text-center">
              {currentIndex + 1} / {announcements.length}
            </span>
            <button
              onClick={nextAnnouncement}
              className="p-1 text-gray-400 hover:text-white rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 关闭按钮 */}
        {current.is_dismissible && (
          <button
            onClick={() => handleDismiss(current.id)}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
