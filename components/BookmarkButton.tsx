'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import { addBookmark, removeBookmark, checkBookmark } from '@/lib/supabase-helpers';
import { getCurrentUser } from '@/lib/auth';

interface BookmarkButtonProps {
  postId: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export default function BookmarkButton({
  postId,
  size = 'md',
  showText = false,
  className = '',
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const user = await getCurrentUser();
      setUserId(user?.id || null);
      
      if (user?.id) {
        const { isBookmarked: bookmarked } = await checkBookmark(postId, user.id);
        setIsBookmarked(bookmarked);
      }
      setIsLoading(false);
    };
    
    init();
  }, [postId]);

  const handleToggle = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      if (isBookmarked) {
        await removeBookmark(postId, userId);
        setIsBookmarked(false);
      } else {
        await addBookmark(postId, userId);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (!userId) return null;

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleToggle}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]}
        ${showText ? 'flex items-center gap-2 px-3' : ''}
        rounded-lg transition-all duration-200
        ${isBookmarked 
          ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
          : 'bg-slate-800/50 text-gray-400 hover:text-yellow-400 hover:bg-slate-700/50'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title={isBookmarked ? '取消收藏' : '收藏文章'}
    >
      <motion.div
        animate={isBookmarked ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Bookmark 
          className={`${iconSizes[size]} ${isBookmarked ? 'fill-yellow-400' : ''}`} 
        />
      </motion.div>
      {showText && (
        <span className="text-sm font-medium">
          {isBookmarked ? '已收藏' : '收藏'}
        </span>
      )}
    </motion.button>
  );
}
