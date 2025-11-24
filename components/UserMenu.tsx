'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, LayoutDashboard, LogIn } from 'lucide-react';
import { getCurrentUserProfile, signOut, UserProfile } from '@/lib/auth';
import Link from 'next/link';
import AuthModal from './AuthModal';

interface UserMenuProps {
  isMobile?: boolean;
  onMenuClose?: () => void;
}

export default function UserMenu({ isMobile = false, onMenuClose }: UserMenuProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const loadUser = async () => {
    try {
      console.log('🔄 [UserMenu] 开始加载用户信息...');
      const profile = await getCurrentUserProfile();
      console.log('✅ [UserMenu] 用户信息加载结果:', profile);
      setUser(profile);
    } catch (error) {
      console.error('❌ [UserMenu] 加载用户信息失败:', error);
      setUser(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!user) {
    if (isMobile) {
      return (
        <>
          <div className="flex flex-col gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAuthModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all duration-300"
            >
              <LogIn className="w-5 h-5" />
              <span>登录</span>
            </motion.button>
          </div>
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onSuccess={loadUser}
          />
        </>
      );
    }
    
    return (
      <>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAuthModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-full transition-all duration-300"
        >
          <LogIn className="w-4 h-4" />
          <span>登录</span>
        </motion.button>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={loadUser}
        />
      </>
    );
  }

  // 移动端内嵌样式
  if (isMobile) {
    return (
      <div>
        {/* 用户信息卡片 */}
        <div className="p-3 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-400/20 rounded-xl mb-2">
          <div className="flex items-center gap-3">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.username}
                className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400/30"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">{user.username}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-cyan-500/20 text-cyan-300 rounded-full">
                {user.role === 'admin' ? '管理员' :
                 user.role === 'editor' ? '编辑' :
                 '用户'}
              </span>
            </div>
          </div>
        </div>

        {/* 快捷操作按钮 */}
        <div className="grid grid-cols-3 gap-2">
          {(user.role === 'admin' || user.role === 'editor') && (
            <Link href="/admin" onClick={onMenuClose}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-1 p-2 text-gray-300 hover:text-white hover:bg-gradient-to-br hover:from-cyan-500/10 hover:to-blue-500/10 rounded-xl transition-all"
              >
                <LayoutDashboard className="w-5 h-5 text-cyan-400" />
                <span className="text-xs font-medium">后台</span>
              </motion.div>
            </Link>
          )}

          <Link href="/profile" onClick={onMenuClose}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-1 p-2 text-gray-300 hover:text-white hover:bg-gradient-to-br hover:from-cyan-500/10 hover:to-blue-500/10 rounded-xl transition-all"
            >
              <Settings className="w-5 h-5 text-cyan-400" />
              <span className="text-xs font-medium">设置</span>
            </motion.div>
          </Link>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              handleSignOut();
              onMenuClose?.();
            }}
            className="flex flex-col items-center gap-1 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs font-medium">退出</span>
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 md:px-3 py-2 bg-slate-800/50 backdrop-blur-sm border border-cyan-400/30 rounded-full hover:border-cyan-400/50 transition-all duration-300"
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.username}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
        <span className="text-sm font-medium text-gray-300 hidden md:block max-w-[100px] truncate">
          {user.username}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-cyan-400/30 rounded-2xl shadow-2xl shadow-cyan-500/20 overflow-hidden z-50"
          >
            {/* 用户信息 */}
            <div className="p-3 border-b border-cyan-400/20">
              <div className="flex items-center gap-3 mb-2">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover border-2 border-cyan-400/30"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{user.full_name || user.username}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
              <span className="inline-block px-2 py-0.5 text-xs font-medium bg-cyan-500/20 text-cyan-300 rounded-full">
                {user.role === 'admin' ? '管理员' :
                 user.role === 'editor' ? '编辑' :
                 '用户'}
              </span>
            </div>

            {/* 菜单项 */}
            <div className="p-2">
              {(user.role === 'admin' || user.role === 'editor') && (
                <Link href="/admin">
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>管理后台</span>
                  </motion.button>
                </Link>
              )}

              <Link href="/profile">
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all"
                >
                  <Settings className="w-4 h-4" />
                  <span>个人设置</span>
                </motion.button>
              </Link>

              <motion.button
                whileHover={{ x: 4 }}
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>退出登录</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
