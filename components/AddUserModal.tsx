'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddUserModal({ isOpen, onClose, onSuccess }: AddUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(true);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    fullName: '',
    role: 'user' as 'admin' | 'editor' | 'user',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 注意：这需要使用 Supabase Admin API
      // 在实际应用中，应该通过服务端 API 来创建用户
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            full_name: formData.fullName,
          },
        },
      });

      if (authError) throw authError;

      // 更新用户角色
      if (authData.user && formData.role !== 'user') {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ role: formData.role } as never)
          .eq('id', authData.user.id);

        if (updateError) throw updateError;
      }

      alert('用户创建成功！');
      onSuccess();
      onClose();
      
      // 重置表单
      setFormData({
        email: '',
        password: '',
        username: '',
        fullName: '',
        role: 'user',
      });
    } catch (err: any) {
      console.error('创建用户失败:', err);
      
      // 根据错误类型提供更友好的提示
      if (err?.message?.includes('User already registered')) {
        setError('该邮箱已被注册，请使用其他邮箱');
      } else if (err?.message?.includes('Password should be at least')) {
        setError('密码长度至少为6位，请重新设置');
      } else if (err?.message?.includes('Invalid email')) {
        setError('邮箱格式不正确，请检查后重试');
      } else if (err?.message?.includes('duplicate key')) {
        setError('用户名已存在，请选择其他用户名');
      } else if (err?.message?.includes('permission denied')) {
        setError('没有权限创建用户，请联系管理员');
      } else if (err?.message?.includes('network')) {
        setError('网络连接失败，请检查网络后重试');
      } else if (err?.message?.includes('timeout')) {
        setError('请求超时，请稍后重试');
      } else if (err?.message?.includes('rate limit')) {
        setError('操作过于频繁，请稍后再试');
      } else {
        setError(err instanceof Error ? err.message : '创建用户失败，请稍后重试');
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
                    新增用户
                  </h2>
                  <p className="text-gray-400">创建新的用户账号</p>
                </div>

                {/* 表单 */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      用户名 *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => {
                          const value = e.target.value;
                          // 只允许字母和数字
                          if (/^[a-zA-Z0-9]*$/.test(value)) {
                            setFormData({ ...formData, username: value });
                          }
                        }}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
                        placeholder="请输入用户名（仅支持字母和数字）"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      姓名
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
                        placeholder="请输入姓名"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      邮箱 *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
                        placeholder="请输入邮箱"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      密码 *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
                        placeholder="请输入密码"
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      角色 *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'editor' | 'user' })}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
                    >
                      <option value="user">用户</option>
                      <option value="editor">编辑</option>
                      <option value="admin">管理员</option>
                    </select>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '创建中...' : '创建用户'}
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
