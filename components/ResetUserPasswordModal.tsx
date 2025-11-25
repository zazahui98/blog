'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

interface ResetUserPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  username: string;
}

export default function ResetUserPasswordModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  userId, 
  username 
}: ResetUserPasswordModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证密码
    if (formData.newPassword.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);

    try {
      // 获取当前会话的token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('未登录或会话已过期');
      }

      // 使用服务端 API 重置密码
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId,
          newPassword: formData.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '重置密码失败');
      }

      alert(`用户 "${username}" 的密码已重置成功！`);
      onSuccess();
      onClose();
      
      // 重置表单
      setFormData({
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      console.error('重置密码失败:', err);
      
      // 根据错误类型提供更友好的提示
      if (err?.message?.includes('未登录或会话已过期')) {
        setError('登录状态已过期，请重新登录后再试');
      } else if (err?.message?.includes('需要管理员权限')) {
        setError('没有权限重置用户密码，请联系管理员');
      } else if (err?.message?.includes('User not found')) {
        setError('用户不存在，请检查用户信息');
      } else if (err?.message?.includes('password')) {
        setError('密码重置失败，请检查新密码是否符合要求');
      } else if (err?.message?.includes('permission denied')) {
        setError('没有权限执行此操作，请联系管理员');
      } else if (err?.message?.includes('network')) {
        setError('网络连接失败，请检查网络后重试');
      } else if (err?.message?.includes('timeout')) {
        setError('请求超时，请稍后重试');
      } else if (err?.message?.includes('rate limit')) {
        setError('操作过于频繁，请稍后再试');
      } else if (err?.message?.includes('401')) {
        setError('登录状态已过期，请重新登录');
      } else if (err?.message?.includes('403')) {
        setError('没有权限执行此操作');
      } else if (err?.message?.includes('500')) {
        setError('服务器内部错误，请稍后重试');
      } else {
        setError(err instanceof Error ? err.message : '重置密码失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100]"
          />

          {/* 模态框容器 */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-md my-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-slate-900/95 backdrop-blur-xl border border-cyan-400/30 rounded-3xl p-8 shadow-2xl shadow-cyan-500/20 relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 关闭按钮 */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-800/50 transition-colors z-10"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>

                {/* 标题 */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent mb-2">
                    重置用户密码
                  </h2>
                  <p className="text-gray-400">为用户 "{username}" 设置新密码</p>
                </div>

                {/* 错误提示 */}
                {error && (
                  <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* 表单 */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      新密码 *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
                        placeholder="请输入新密码"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      确认密码 *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
                        placeholder="请再次输入新密码"
                        minLength={6}
                      />
                    </div>
                  </div>

                  {/* 密码要求提示 */}
                  <div className="text-xs text-gray-500">
                    <p>密码要求：</p>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      <li>至少6个字符</li>
                      <li>建议包含字母、数字和特殊字符</li>
                    </ul>
                  </div>

                  {/* 提交按钮 */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200"
                  >
                    {loading ? '重置中...' : '重置密码'}
                  </motion.button>
                </form>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
}