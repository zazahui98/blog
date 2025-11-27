'use client';

import { motion } from 'framer-motion';
import { Lock, LogIn, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import AuthModal from './AuthModal';

interface ToolAuthGuardProps {
  isLoggedIn: boolean;
  canUse: boolean;
  remainingUses: number;
  limit: number;
  toolName: string;
}

/**
 * 工具认证守卫组件
 * 显示登录提示和使用次数限制
 */
export default function ToolAuthGuard({
  isLoggedIn,
  canUse,
  remainingUses,
  limit,
  toolName,
}: ToolAuthGuardProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 已登录用户不显示任何提示
  if (isLoggedIn) return null;

  // 未登录但还有使用次数
  if (canUse) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-amber-200 text-sm">
              访客模式：今日剩余 <span className="font-bold">{remainingUses}</span> 次使用机会
            </p>
            <p className="text-amber-300/60 text-xs mt-0.5">
              登录后可无限制使用所有工具
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAuthModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-sm font-medium rounded-lg transition-colors"
        >
          <LogIn className="w-4 h-4" />
          <span>登录</span>
        </button>
        
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </motion.div>
    );
  }

  // 未登录且已用完次数
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-6"
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          今日使用次数已用完
        </h3>
        <p className="text-gray-400 text-sm mb-4 max-w-md">
          访客每日可免费使用 {toolName} {limit} 次。登录后即可无限制使用所有工具功能。
        </p>
        <button
          onClick={() => setShowAuthModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium rounded-xl transition-all"
        >
          <LogIn className="w-5 h-5" />
          <span>立即登录</span>
        </button>
      </div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </motion.div>
  );
}
