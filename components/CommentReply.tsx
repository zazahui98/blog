'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, X } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { getCurrentUser } from '@/lib/auth';
import Toast from './Toast';
import { useToast } from '@/hooks/useToast';

interface CommentReplyProps {
  commentId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CommentReply({ commentId, onSuccess, onCancel }: CommentReplyProps) {
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast, showToast, hideToast } = useToast();

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await getCurrentUser();
      if (!user) {
        setError('请先登录');
        showToast('请先登录', 'warning');
        return;
      }

      // 获取用户信息和角色
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('username, role')
        .eq('id', user.id)
        .single();

      const username = (profile as { username: string; role: string } | null)?.username || 'Anonymous';
      const isAdmin = (profile as { username: string; role: string } | null)?.role === 'admin';

      // 创建回复
      const { error: insertError } = await supabase
        .from('comment_replies')
        .insert({
          comment_id: commentId,
          user_id: user.id,
          author_name: username,
          content: replyContent,
          is_approved: isAdmin, // 管理员回复自动审核通过
        } as never);

      if (insertError) throw insertError;

      setReplyContent('');
      if (isAdmin) {
        showToast('回复发表成功！', 'success');
      } else {
        showToast('回复已提交，等待审核', 'info');
      }
      onSuccess();
    } catch (err: any) {
      console.error('回复评论失败:', err);
      
      // 根据错误类型提供更友好的提示
      let errorMsg = '';
      if (err?.message?.includes('comment_replies')) {
        if (err?.message?.includes('null value in column')) {
          errorMsg = '回复内容不能为空';
        } else if (err?.message?.includes('foreign key constraint')) {
          errorMsg = '评论不存在，请刷新页面后重试';
        } else if (err?.message?.includes('permission')) {
          errorMsg = '没有回复权限，请检查登录状态';
        } else if (err?.message?.includes('duplicate')) {
          errorMsg = '请不要重复提交相同内容';
        } else {
          errorMsg = '回复失败：' + (err?.message || '未知错误');
        }
      } else if (err?.message?.includes('network')) {
        errorMsg = '网络连接失败，请检查网络后重试';
      } else if (err?.message?.includes('timeout')) {
        errorMsg = '请求超时，请稍后重试';
      } else if (err?.message?.includes('auth')) {
        errorMsg = '登录状态已过期，请重新登录';
      } else {
        errorMsg = err instanceof Error ? err.message : '回复失败';
      }
      
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="p-4 bg-slate-800/30 rounded-xl border border-cyan-400/20"
      >
        <form onSubmit={handleReply} className="space-y-3">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            required
            rows={3}
            placeholder="写下你的回复..."
            className="w-full px-3 py-2 bg-slate-900/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors resize-none text-sm"
          />

          {error && (
            <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !replyContent.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? '发送中...' : '发送回复'}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 font-semibold rounded-lg transition-all text-sm"
            >
              <X className="w-4 h-4" />
              <span>取消</span>
            </motion.button>
          </div>
        </form>
      </motion.div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </>
  );
}
