'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { getCurrentUser } from '@/lib/auth';

interface LikeButtonProps {
  postId: string;
  initialLikes: number;
}

export default function LikeButton({ postId, initialLikes }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkLikeStatus();
  }, [postId]);

  const checkLikeStatus = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      setUserId(user.id);

      const { data } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      setLiked(!!data);
    } catch (error) {
      // 未点赞
    }
  };

  const handleLike = async () => {
    if (!userId) {
      alert('请先登录');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (liked) {
        // 取消点赞
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

        setLiked(false);
        setLikes(likes - 1);
      } else {
        // 点赞
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: userId,
          } as never);

        setLiked(true);
        setLikes(likes + 1);
      }
    } catch (error) {
      console.error('Failed to like:', error);
      alert('操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
        liked
          ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white'
          : 'bg-slate-800 border border-cyan-400/20 text-gray-300 hover:border-cyan-400/50'
      }`}
    >
      <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
      <span>{liked ? '已赞' : '点赞'}</span>
      <span className="ml-1">({likes})</span>
    </motion.button>
  );
}
