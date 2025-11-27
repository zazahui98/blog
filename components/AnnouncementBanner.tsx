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
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 25,
        mass: 0.8
      }}
      className={`fixed top-[8.5rem] left-1/2 transform -translate-x-1/2 w-full max-w-[95%] sm:max-w-[90%] md:max-w-4xl lg:max-w-5xl mx-auto px-4 ${styles.bg} ${styles.border} border backdrop-blur-xl rounded-full shadow-xl z-40`}
    >
      <div className="flex items-start sm:items-center gap-3 px-3 py-2">
        {/* 图标 */}
        <div className={`flex-shrink-0 ${styles.iconColor} mt-0.5 sm:mt-0`}>
          <Icon className="w-4 h-4" />
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
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 min-w-0">
                <span className="font-medium text-white text-sm leading-tight">{current.title}</span>
                {current.content && (
                  <span className="text-gray-300 text-xs leading-tight">
                    <span className="hidden sm:inline">- </span>
                    <span className="block sm:inline">{current.content}</span>
                  </span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 导航按钮（多条公告时显示） */}
        {announcements.length > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={prevAnnouncement}
              className="p-1 text-gray-400 hover:text-white rounded transition-colors hover:bg-white/10"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="text-xs text-gray-400 min-w-[2rem] text-center">
              {currentIndex + 1}/{announcements.length}
            </span>
            <button
              onClick={nextAnnouncement}
              className="p-1 text-gray-400 hover:text-white rounded transition-colors hover:bg-white/10"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* 关闭按钮 */}
        {current.is_dismissible && (
          <button
            onClick={() => handleDismiss(current.id)}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
