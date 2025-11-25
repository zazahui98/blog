'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { updatePassword } from '@/lib/auth';
import { supabase } from '@/lib/supabase-client';
import Link from 'next/link';

function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 检查URL中是否有access_token和refresh_token
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    // 调试信息
    console.log('🔍 [ResetPassword] URL参数检查:', {
      accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : 'null',
      refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : 'null',
      error,
      errorDescription,
      currentUrl: window.location.href
    });
    
    if (error) {
      setError(`重置密码链接错误: ${errorDescription || error}`);
      return;
    }
    
    if (!accessToken || !refreshToken) {
      setError('无效的密码重置链接。请重新申请密码重置。可能的原因：\n1. 链接已过期\n2. 链接已被使用\n3. 链接格式不正确');
      return;
    }
    
    // 设置会话
    const setSession = async () => {
      try {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        
        if (error) {
          console.error('❌ [ResetPassword] 设置会话失败:', error);
          setError('会话设置失败，请重新申请密码重置。');
          return;
        }
        
        console.log('✅ [ResetPassword] 会话设置成功:', data.user?.email);
        setError(''); // 清除任何之前的错误信息
      } catch (err) {
        console.error('❌ [ResetPassword] 设置会话异常:', err);
        setError('会话设置异常，请重新申请密码重置。');
      }
    };
    
    setSession();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // 清除之前的错误信息
    
    // 验证密码
    if (password.length < 6) {
      setError('密码长度至少为6个字符');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('🔄 [ResetPassword] 开始更新密码...');
      await updatePassword(password);
      console.log('✅ [ResetPassword] 密码更新成功');
      setSuccess(true);
      setError(''); // 确保成功时清除所有错误
      
      // 3秒后跳转到登录页面
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err: any) {
      console.error('❌ [ResetPassword] 密码更新失败:', err);
      if (err?.message?.includes('Invalid login credentials')) {
        setError('无效的密码重置链接');
      } else if (err?.message?.includes('Token has expired')) {
        setError('重置链接已过期，请重新申请');
      } else if (err?.message?.includes('Password should be at least')) {
        setError('密码长度至少为6个字符');
      } else if (err?.message?.includes('weak password')) {
        setError('密码强度不够，请使用更复杂的密码');
      } else {
        setError(err?.message || '密码重置失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-slate-900/95 backdrop-blur-xl border border-cyan-400/30 rounded-3xl p-8 shadow-2xl shadow-cyan-500/20"
        >
          {/* 返回链接 */}
          <Link 
            href="/"
            className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Link>

          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent mb-2">
              重置密码
            </h1>
            <p className="text-gray-400">
              请输入您的新密码
            </p>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">密码重置成功！</h2>
              <p className="text-gray-400">即将跳转到登录页面...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 新密码输入框 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  新密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
                    placeholder="请输入新密码（至少6个字符）"
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

              {/* 确认密码输入框 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  确认新密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
                    placeholder="请再次输入新密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* 错误信息 */}
              {error && !success && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '处理中...' : '重置密码'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-cyan-400/30 rounded-3xl p-8 shadow-2xl shadow-cyan-500/20">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
              <p className="text-gray-400 mt-4">加载中...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}