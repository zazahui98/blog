'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { getCurrentUser } from '@/lib/auth';
import Toast from './Toast';
import { useToast } from '@/hooks/useToast';

interface CommentFormProps {
  postId: string;
  onSuccess: () => void;
}

export default function CommentForm({ postId, onSuccess }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const user = await getCurrentUser();
    setIsLoggedIn(!!user);
  };

  const handleLoginClick = () => {
    showToast('请先登录后再发表评论', 'warning');
    // 可以触发登录模态框
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await getCurrentUser();
      if (!user) {
        setError('请先登录');
        return;
      }

      // 获取用户信息和角色
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('username, role')
        .eq('id', user.id)
        .single();

      const userProfile = profile as { username: string; role: string } | null;
      const isAdmin = userProfile?.role === 'admin';

      const { error: insertError } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          author_name: userProfile?.username || 'Anonymous',
          author_email: user.email || '',
          content,
          is_approved: isAdmin, // 管理员评论自动审核通过
        } as never);

      if (insertError) throw insertError;

      setContent('');
      if (isAdmin) {
        showToast('评论发表成功！', 'success');
      } else {
        showToast('评论已提交，等待审核', 'info');
      }
      onSuccess();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '提交失败';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 未登录时显示登录提示
  if (!isLoggedIn) {
    return (
      <>
        <div className="space-y-4">
          <div className="p-6 bg-slate-900/50 border border-cyan-400/20 rounded-xl text-center">
            <LogIn className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <p className="text-gray-300 mb-4">登录后即可发表评论</p>
          </div>
        </div>
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
      </>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={4}
            placeholder="写下你的评论..."
            className="w-full px-4 py-3 bg-slate-900/50 border border-cyan-400/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors resize-none"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading || !content.trim()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          <span>{loading ? '提交中...' : '发表评论'}</span>
        </motion.button>
      </form>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </>
  );
}
