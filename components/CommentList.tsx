'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  ThumbsUp, 
  Reply, 
  Trash2, 
  Flag, 
  Edit3, 
  Check, 
  X,
  ChevronDown,
  ChevronUp,
  Clock
} from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { Database } from '@/lib/database.types';
import { getCurrentUser } from '@/lib/auth';
import { 
  CommentSortOption, 
  getCommentsSorted, 
  editComment 
} from '@/lib/supabase-helpers';
import CommentReply from './CommentReply';
import CommentFilter from './CommentFilter';
import CommentReportModal from './CommentReportModal';
import Toast from './Toast';
import { useToast } from '@/hooks/useToast';

type Comment = Database['public']['Tables']['comments']['Row'];
type CommentReplyType = Database['public']['Tables']['comment_replies']['Row'];

interface CommentListProps {
  postId: string;
  postAuthorId?: string;
  refreshTrigger?: number;
}

interface CommentWithDetails extends Comment {
  avatar_url: string | null;
  like_count: number;
  user_liked: boolean;
  replies: CommentReplyType[];
  is_author_reply?: boolean;
  is_edited?: boolean;
  edited_at?: string;
  helpful_count?: number;
}

export default function CommentList({ postId, postAuthorId, refreshTrigger }: CommentListProps) {
  const [comments, setComments] = useState<CommentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  // 排序和过滤状态
  const [sortBy, setSortBy] = useState<CommentSortOption>('newest');
  const [filterAuthorReply, setFilterAuthorReply] = useState(false);
  
  // 举报模态框状态
  const [reportingComment, setReportingComment] = useState<{id: string, author: string} | null>(null);
  
  // 编辑状态
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  // 折叠状态
  const [collapsedComments, setCollapsedComments] = useState<Set<string>>(new Set());
  
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadComments();
    loadUser();
  }, [postId, refreshTrigger, sortBy, filterAuthorReply]);

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
      // 使用新的排序和过滤函数
      const { data: commentsData, error } = await getCommentsSorted(postId, sortBy, filterAuthorReply);

      if (error) throw error;

      // 获取每个评论的用户头像、点赞数和回复
      const commentsWithDetails: CommentWithDetails[] = await Promise.all(
        (commentsData || []).map(async (comment: any): Promise<CommentWithDetails> => {
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

          // 获取点赞数（使用 helpful_count 或从 comment_likes 表获取）
          let like_count = comment.helpful_count || 0;
          if (!comment.helpful_count) {
            const { count } = await supabase
              .from('comment_likes')
              .select('*', { count: 'exact', head: true })
              .eq('comment_id', comment.id);
            like_count = count || 0;
          }

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

          // 检查是否是作者回复
          const is_author_reply = postAuthorId ? comment.user_id === postAuthorId : comment.is_author_reply;

          return {
            ...comment,
            avatar_url,
            like_count,
            user_liked,
            replies: (repliesData || []) as CommentReplyType[],
            is_author_reply,
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
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', userId);
        showToast('已取消点赞', 'info');
      } else {
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
      showToast('操作失败，请重试', 'error');
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
      showToast('删除失败，请重试', 'error');
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
      showToast('删除失败，请重试', 'error');
    }
  };

  // 开始编辑评论
  const handleStartEdit = (comment: CommentWithDetails) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  // 保存编辑
  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) {
      showToast('评论内容不能为空', 'warning');
      return;
    }

    if (!userId) return;

    try {
      const { error } = await editComment(commentId, editContent.trim(), userId);
      
      if (error) throw error;

      showToast('评论已更新', 'success');
      setEditingCommentId(null);
      setEditContent('');
      loadComments();
    } catch (error: any) {
      console.error('Failed to edit comment:', error);
      showToast('编辑失败，请重试', 'error');
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  // 切换评论折叠状态
  const toggleCollapse = (commentId: string) => {
    setCollapsedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const canDeleteComment = (comment: CommentWithDetails) => {
    if (!userId) return false;
    return userRole === 'admin' || comment.user_id === userId;
  };

  const canEditComment = (comment: CommentWithDetails) => {
    if (!userId) return false;
    return comment.user_id === userId;
  };

  const canDeleteReply = (reply: CommentReplyType) => {
    if (!userId) return false;
    return userRole === 'admin' || reply.user_id === userId;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-slate-900/50 border border-cyan-400/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-700 rounded-full" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-slate-700 rounded" />
                <div className="h-3 w-32 bg-slate-700 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-700 rounded" />
              <div className="h-4 w-3/4 bg-slate-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const totalComments = comments.length;

  return (
    <div className="space-y-6">
      {/* 评论过滤和排序 */}
      <CommentFilter
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterAuthorReply={filterAuthorReply}
        onFilterChange={setFilterAuthorReply}
        hasAuthor={!!postAuthorId}
        totalComments={totalComments}
      />

      {/* 评论列表 */}
      {comments.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">
            {filterAuthorReply ? '暂无作者回复' : '还没有评论，来发表第一条吧！'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-slate-900/50 border rounded-2xl p-6 ${
                comment.is_author_reply 
                  ? 'border-cyan-400/40 bg-cyan-500/5' 
                  : 'border-cyan-400/20'
              }`}
            >
              {/* 评论头部 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
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
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold">{comment.author_name}</p>
                      {comment.is_author_reply && (
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full font-medium">
                          作者
                        </span>
                      )}
                      {comment.is_edited && (
                        <span className="text-gray-500 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          已编辑
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm">
                      {new Date(comment.created_at).toLocaleString('zh-CN')}
                    </p>
                  </div>
                </div>

                {/* 操作按钮组 */}
                <div className="flex items-center gap-1">
                  {/* 折叠按钮 */}
                  {comment.content.length > 200 && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleCollapse(comment.id)}
                      className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors text-gray-500 hover:text-gray-300"
                      title={collapsedComments.has(comment.id) ? '展开' : '折叠'}
                    >
                      {collapsedComments.has(comment.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )}
                    </motion.button>
                  )}
                  
                  {/* 编辑按钮 */}
                  {canEditComment(comment) && !editingCommentId && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleStartEdit(comment)}
                      className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors text-gray-500 hover:text-cyan-400"
                      title="编辑评论"
                    >
                      <Edit3 className="w-4 h-4" />
                    </motion.button>
                  )}

                  {/* 举报按钮 */}
                  {userId && comment.user_id !== userId && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setReportingComment({ id: comment.id, author: comment.author_name })}
                      className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors text-gray-500 hover:text-orange-400"
                      title="举报评论"
                    >
                      <Flag className="w-4 h-4" />
                    </motion.button>
                  )}

                  {/* 删除按钮 */}
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
              </div>

              {/* 评论内容 */}
              {editingCommentId === comment.id ? (
                // 编辑模式
                <div className="mb-4">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full bg-slate-800/50 border border-cyan-400/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors resize-none"
                    rows={4}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCancelEdit}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700 text-gray-300 hover:bg-slate-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      取消
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSaveEdit(comment.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      保存
                    </motion.button>
                  </div>
                </div>
              ) : (
                // 显示模式
                <p className={`text-gray-300 mb-4 ${
                  collapsedComments.has(comment.id) ? 'line-clamp-3' : ''
                }`}>
                  {comment.content}
                </p>
              )}

              {/* 操作按钮 */}
              {userId && !editingCommentId && (
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
              <AnimatePresence>
                {replyingTo === comment.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pl-12"
                  >
                    <CommentReply
                      commentId={comment.id}
                      onSuccess={handleReplySuccess}
                      onCancel={() => setReplyingTo(null)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

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
        </div>
      )}

      {/* 举报模态框 */}
      {reportingComment && userId && (
        <CommentReportModal
          isOpen={true}
          onClose={() => setReportingComment(null)}
          commentId={reportingComment.id}
          commentAuthor={reportingComment.author}
          reporterId={userId}
        />
      )}
      
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}
