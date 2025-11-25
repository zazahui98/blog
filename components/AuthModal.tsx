'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { signIn, signUp } from '@/lib/auth';
import { parseUserAgent, getClientIP } from '@/lib/device-parser';
import { getErrorMessage } from '@/lib/error-messages';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    fullName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        // 获取设备信息
        const userAgent = navigator.userAgent;
        const deviceInfo = parseUserAgent(userAgent);
        
        // 获取 IP 地址（通过 API 路由）
        let clientIP = 'Unknown';
        try {
          const ipResponse = await fetch('/api/get-ip');
          if (ipResponse.ok) {
            const ipData = await ipResponse.json();
            clientIP = ipData.ip;
          }
        } catch (err) {
          console.error('Failed to get IP:', err);
        }

        await signIn(
          {
            email: formData.email,
            password: formData.password,
          },
          {
            ip: clientIP,
            userAgent: deviceInfo.userAgent,
            deviceType: deviceInfo.deviceType,
            deviceBrand: deviceInfo.deviceBrand,
            deviceModel: deviceInfo.deviceModel,
            osName: deviceInfo.osName,
            osVersion: deviceInfo.osVersion,
            browserName: deviceInfo.browserName,
            browserVersion: deviceInfo.browserVersion,
          }
        );
        onSuccess?.();
        onClose();
      } else {
        // 注册
        await signUp({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          fullName: formData.fullName,
        });
        
        // 显示成功消息
        setError('');
        alert('注册成功！请检查邮箱验证链接（如果启用了邮箱验证）。现在可以登录了。');
        
        // 切换到登录模式
        setMode('signin');
        setFormData({ ...formData, password: '' });
      }
    } catch (err) {
      setError(getErrorMessage(err));
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
                  {mode === 'signin' ? '登录' : '注册'}
                </h2>
                <p className="text-gray-400">
                  {mode === 'signin' ? '欢迎回来！' : '创建您的账号'}
                </p>
              </div>

              {/* 表单 */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        用户名
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
                        姓名（可选）
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
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    邮箱
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
                    密码
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
                      placeholder="请输入密码"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
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
                  {loading 
                    ? '处理中...' 
                    : mode === 'signin' 
                      ? '登录'
                      : '注册'
                  }
                </button>

                {/* 忘记密码链接 */}
                {mode === 'signin' && (
                  <div className="text-center mt-4">
                    <Link
                      href="/auth/forgot-password"
                      className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
                      onClick={onClose}
                    >
                      忘记密码？
                    </Link>
                  </div>
                )}
              </form>

              {/* 切换模式 */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setMode(mode === 'signin' ? 'signup' : 'signin');
                    setError('');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {mode === 'signin'
                    ? '还没有账号？立即注册'
                    : '已有账号？立即登录'
                  }
                </button>
              </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
