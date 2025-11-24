'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Save, ArrowLeft } from 'lucide-react';
import { getCurrentUserProfile, updateUserProfile, UserProfile } from '@/lib/auth';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AvatarUpload from '@/components/AvatarUpload';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: '',
    avatar_url: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile) {
        router.push('/');
        return;
      }
      
      setUser(profile);
      setFormData({
        username: profile.username,
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage('');

    try {
      await updateUserProfile(user.id, formData);
      setMessage('保存成功！');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-32 pb-8">
        <div className="max-w-2xl mx-auto">
          {/* 返回按钮 */}
          <Link href="/">
            <motion.button
              whileHover={{ x: -4 }}
              className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 mb-8 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回首页</span>
            </motion.button>
          </Link>

          {/* 标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent mb-2">
              个人设置
            </h1>
            <p className="text-gray-400">管理您的个人信息</p>
          </div>

          {/* 表单 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-cyan-400/20 rounded-2xl p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 头像上传 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  头像
                </label>
                <AvatarUpload
                  currentAvatar={formData.avatar_url}
                  userId={user?.id || ''}
                  onUploadSuccess={(url) => setFormData({ ...formData, avatar_url: url })}
                />
              </div>

              {/* 用户名 */}
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
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
                    placeholder="请输入用户名（仅支持字母和数字）"
                  />
                </div>
              </div>

              {/* 姓名 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  姓名
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
                  placeholder="请输入姓名"
                />
              </div>

              {/* 邮箱（只读） */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  邮箱
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-cyan-400/10 rounded-xl text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">邮箱不可修改</p>
              </div>

              {/* 个人简介 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  个人简介
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors resize-none"
                  placeholder="介绍一下自己..."
                />
              </div>

              {/* 角色标签 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  账号角色
                </label>
                <span className="inline-block px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-medium">
                  {user?.role === 'admin' ? '管理员' : user?.role === 'editor' ? '编辑' : '用户'}
                </span>
              </div>

              {/* 消息提示 */}
              {message && (
                <div className={`p-3 rounded-xl text-sm ${
                  message.includes('成功')
                    ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}>
                  {message}
                </div>
              )}

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                <span>{saving ? '保存中...' : '保存更改'}</span>
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
