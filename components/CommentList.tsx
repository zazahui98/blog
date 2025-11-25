'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ThumbsUp, Reply, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { Database } from '@/lib/database.types';
import { getCurrentUser } from '@/lib/auth';
import CommentReply from './CommentReply';
import Toast from './Toast';
import { useToast } from '@/hooks/useToast';

type Comment = Database['public']['Tables']['comments']['Row'];
type CommentReplyType = Database['public']['Tables']['comment_replies']['Row'];

interface CommentListProps {
  postId: string;
  refreshTrigger?: number;
}

interface CommentWithDetails extends Comment {
  avatar_url: string | null;
  like_count: number;
  user_liked: boolean;
  replies: CommentReplyType[];
}

export default function CommentList({ postId, refreshTrigger }: CommentListProps) {
  const [comments, setComments] = useState<CommentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadComments();
    loadUser();
  }, [postId, refreshTrigger]);

  const loadUser = async () => {
    const user = await getCurrentUser();
    setUserId(user?.id || null);
    
    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      setUserRole((profile as { role: string } | null)?.role || null);
    }
  };

  const loadComments = async () => {
    try {
      // 获取评论和用户信息
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 获取每个评论的用户头像、点赞数和回复
      const commentsWithDetails: CommentWithDetails[] = await Promise.all(
        (commentsData as Comment[] || []).map(async (comment: Comment): Promise<CommentWithDetails> => {
          // 获取用户头像
          let avatar_url: string | null = null;
          if (comment.user_id) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('avatar_url')
              .eq('id', comment.user_id)
              .single();
            avatar_url = (profile as { avatar_url: string | null } | null)?.avatar_url || null;
          }

          // 获取点赞数
          const { count } = await supabase
            .from('comment_likes')
            .select('*', { count: 'exact', head: true })
            .eq('comment_id', comment.id);

          // 检查当前用户是否已点赞
          let user_liked = false;
          if (userId) {
            const { data: likeData } = await supabase
              .from('comment_likes')
              .select('id')
              .eq('comment_id', comment.id)
              .eq('user_id', userId)
              .maybeSingle();
            user_liked = !!likeData;
          }

          // 获取回复
          const { data: repliesData } = await supabase
            .from('comment_replies')
            .select('*')
            .eq('comment_id', comment.id)
            .eq('is_approved', true)
            .order('created_at', { ascending: true });

          return {
            ...comment,
            avatar_url,
            like_count: count || 0,
            user_liked,
            replies: (repliesData || []) as CommentReplyType[],
          };
        })
      );

      setComments(commentsWithDetails);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!userId) {
      showToast('请先登录', 'warning');
      return;
    }

    try {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;

      if (comment.user_liked) {
        // 取消点赞
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', userId);
        showToast('已取消点赞', 'info');
      } else {
        // 点赞
        await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: userId,
          } as never);
        showToast('点赞成功！', 'success');
      }

      loadComments();
    } catch (error: any) {
      console.error('Failed to like comment:', error);
      
      // 根据错误类型提供更友好的提示
      let errorMsg = '';
      if (error?.message?.includes('comment_likes')) {
        if (error?.message?.includes('duplicate key')) {
          errorMsg = '您已经点赞过了';
        } else if (error?.message?.includes('foreign key constraint')) {
          errorMsg = '评论不存在，请刷新页面后重试';
        } else if (error?.message?.includes('permission')) {
          errorMsg = '没有操作权限，请检查登录状态';
        } else {
          errorMsg = '点赞操作失败：' + (error?.message || '未知错误');
        }
      } else if (error?.message?.includes('network')) {
        errorMsg = '网络连接失败，请检查网络后重试';
      } else if (error?.message?.includes('timeout')) {
        errorMsg = '请求超时，请稍后重试';
      } else if (error?.message?.includes('auth')) {
        errorMsg = '登录状态已过期，请重新登录';
      } else {
        errorMsg = '操作失败，请重试';
      }
      
      showToast(errorMsg, 'error');
    }
  };

  const handleReplySuccess = () => {
    setReplyingTo(null);
    loadComments();
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('确定要删除这条评论吗？')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      showToast('评论已删除', 'success');
      loadComments();
    } catch (error: any) {
      console.error('Failed to delete comment:', error);
      
      // 根据错误类型提供更友好的提示
      let errorMsg = '';
      if (error?.message?.includes('comments')) {
        if (error?.message?.includes('permission')) {
          errorMsg = '没有删除权限，只有评论作者或管理员可以删除';
        } else if (error?.message?.includes('foreign key constraint')) {
          errorMsg = '评论不存在或已被删除';
        } else if (error?.message?.includes('cascade')) {
          errorMsg = '删除评论失败，请先删除所有回复';
        } else {
          errorMsg = '删除评论失败：' + (error?.message || '未知错误');
        }
      } else if (error?.message?.includes('network')) {
        errorMsg = '网络连接失败，请检查网络后重试';
      } else if (error?.message?.includes('timeout')) {
        errorMsg = '请求超时，请稍后重试';
      } else if (error?.message?.includes('auth')) {
        errorMsg = '登录状态已过期，请重新登录';
      } else {
        errorMsg = '删除失败，请重试';
      }
      
      showToast(errorMsg, 'error');
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm('确定要删除这条回复吗？')) return;

    try {
      const { error } = await supabase
        .from('comment_replies')
        .delete()
        .eq('id', replyId);

      if (error) throw error;

      showToast('回复已删除', 'success');
      loadComments();
    } catch (error: any) {
      console.error('Failed to delete reply:', error);
      
      // 根据错误类型提供更友好的提示
      let errorMsg = '';
      if (error?.message?.includes('comment_replies')) {
        if (error?.message?.includes('permission')) {
          errorMsg = '没有删除权限，只有回复作者或管理员可以删除';
        } else if (error?.message?.includes('foreign key constraint')) {
          errorMsg = '回复不存在或已被删除';
        } else {
          errorMsg = '删除回复失败：' + (error?.message || '未知错误');
        }
      } else if (error?.message?.includes('network')) {
        errorMsg = '网络连接失败，请检查网络后重试';
      } else if (error?.message?.includes('timeout')) {
        errorMsg = '请求超时，请稍后重试';
      } else if (error?.message?.includes('auth')) {
        errorMsg = '登录状态已过期，请重新登录';
      } else {
        errorMsg = '删除失败，请重试';
      }
      
      showToast(errorMsg, 'error');
    }
  };

  const canDeleteComment = (comment: CommentWithDetails) => {
    if (!userId) return false;
    return userRole === 'admin' || comment.user_id === userId;
  };

  const canDeleteReply = (reply: CommentReplyType) => {
    if (!userId) return false;
    return userRole === 'admin' || reply.user_id === userId;
  };

  if (loading) {
    return <div className="text-center text-gray-400">加载评论中...</div>;
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">还没有评论，来发表第一条吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment, index) => (
        <motion.div
          key={comment.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-slate-900/50 border border-cyan-400/20 rounded-2xl p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* 显示用户头像 */}
              {comment.avatar_url ? (
                <img
                  src={comment.avatar_url}
                  alt={comment.author_name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-cyan-400/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {comment.author_name[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="text-white font-semibold">{comment.author_name}</p>
                <p className="text-gray-500 text-sm">
                  {new Date(comment.created_at).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>

            {/* 删除按钮 - 右上角 */}
            {canDeleteComment(comment) && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleDeleteComment(comment.id)}
                className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-gray-500 hover:text-red-400"
                title="删除评论"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            )}
          </div>

          <p className="text-gray-300 mb-4">{comment.content}</p>

          {/* 操作按钮 - 仅登录用户可见 */}
          {userId && (
            <div className="flex items-center gap-4 mb-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleLike(comment.id)}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-slate-800/50 transition-colors ${
                  comment.user_liked ? 'text-cyan-400' : 'text-gray-400 hover:text-cyan-400'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${comment.user_liked ? 'fill-cyan-400' : ''}`} />
                <span className="text-sm">点赞 ({comment.like_count})</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-slate-800/50 transition-colors text-gray-400 hover:text-cyan-400"
              >
                <Reply className="w-4 h-4" />
                <span className="text-sm">回复 ({comment.replies.length})</span>
              </motion.button>
            </div>
          )}

          {/* 未登录时显示统计信息 */}
          {!userId && (
            <div className="flex items-center gap-4 mb-4 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4" />
                <span>{comment.like_count} 点赞</span>
              </div>
              <div className="flex items-center gap-2">
                <Reply className="w-4 h-4" />
                <span>{comment.replies.length} 回复</span>
              </div>
            </div>
          )}

          {/* 回复表单 */}
          {replyingTo === comment.id && (
            <div className="mt-4 pl-12">
              <CommentReply
                commentId={comment.id}
                onSuccess={handleReplySuccess}
                onCancel={() => setReplyingTo(null)}
              />
            </div>
          )}

          {/* 显示回复列表 */}
          {comment.replies.length > 0 && (
            <div className="mt-4 pl-12 space-y-4 border-l-2 border-cyan-400/20">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {reply.author_name[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{reply.author_name}</p>
                        <p className="text-gray-500 text-xs">
                          {new Date(reply.created_at).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    
                    {/* 回复删除按钮 */}
                    {canDeleteReply(reply) && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteReply(reply.id)}
                        className="p-1 rounded hover:bg-red-500/10 transition-colors text-gray-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </motion.button>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm">{reply.content}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      ))}
      
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}
