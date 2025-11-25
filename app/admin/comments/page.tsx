'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Check, X, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { Database } from '@/lib/database.types';
import { getErrorMessage } from '@/lib/error-messages';

type Comment = Database['public']['Tables']['comments']['Row'];

interface CommentWithPost extends Comment {
  post_title?: string;
}

export default function CommentsManagement() {
  const [comments, setComments] = useState<CommentWithPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 获取文章标题
      const postsIds = [...new Set(commentsData?.map((c: { post_id: string }) => c.post_id))];
      const { data: postsData } = await supabase
        .from('posts')
        .select('id, title')
        .in('id', postsIds);

      const postsMap = new Map(postsData?.map((p: { id: string; title: string }) => [p.id, p.title]));
      
      const commentsWithPosts = commentsData?.map((comment: Comment) => ({
        ...comment,
        post_title: postsMap.get(comment.post_id),
      })) || [];

      setComments(commentsWithPosts);
    } catch (error) {
      console.error('Failed to load comments:', error);
      alert(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ is_approved: true } as never)
        .eq('id', id);

      if (error) throw error;
      
      setComments(comments.map(c => c.id === id ? { ...c, is_approved: true } : c));
    } catch (error) {
      console.error('Failed to approve comment:', error);
      alert(getErrorMessage(error));
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ is_approved: false } as never)
        .eq('id', id);

      if (error) throw error;
      
      setComments(comments.map(c => c.id === id ? { ...c, is_approved: false } : c));
    } catch (error) {
      console.error('Failed to reject comment:', error);
      alert(getErrorMessage(error));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条评论吗？')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setComments(comments.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert(getErrorMessage(error));
    }
  };

  const filteredComments = comments.filter(comment => {
    const matchesSearch = 
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.post_title?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filter === 'all' ||
      (filter === 'approved' && comment.is_approved) ||
      (filter === 'pending' && !comment.is_approved);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-cyan-400 text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div>
      {/* 头部 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">评论管理</h1>
        <p className="text-gray-400">审核和管理用户评论</p>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索评论..."
            className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-cyan-400/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'all'
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-800 text-gray-400 hover:text-white'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'approved'
                ? 'bg-green-500 text-white'
                : 'bg-slate-800 text-gray-400 hover:text-white'
            }`}
          >
            已审核
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-slate-800 text-gray-400 hover:text-white'
            }`}
          >
            待审核
          </button>
        </div>
      </div>

      {/* 评论列表 */}
      <div className="space-y-4">
        {filteredComments.map((comment) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-cyan-400/20 rounded-2xl p-6 hover:border-cyan-400/40 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-white font-semibold">{comment.author_name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    comment.is_approved
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {comment.is_approved ? '已审核' : '待审核'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{comment.author_email}</p>
                <p className="text-cyan-400 text-sm">文章：{comment.post_title || '未知'}</p>
              </div>
              <span className="text-gray-500 text-sm">
                {new Date(comment.created_at).toLocaleString('zh-CN')}
              </span>
            </div>

            <p className="text-gray-300 mb-4">{comment.content}</p>

            <div className="flex items-center gap-2">
              {!comment.is_approved && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleApprove(comment.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>通过</span>
                </motion.button>
              )}
              {comment.is_approved && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleReject(comment.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>取消审核</span>
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDelete(comment.id)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>删除</span>
              </motion.button>
            </div>
          </motion.div>
        ))}

        {filteredComments.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-slate-900 border border-cyan-400/20 rounded-2xl">
            {searchTerm ? '未找到匹配的评论' : '暂无评论'}
          </div>
        )}
      </div>
    </div>
  );
}
