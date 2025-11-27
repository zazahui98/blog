'use client';

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useToolFavorite } from '@/hooks/useToolFavorite';

interface ToolFavoriteButtonProps {
  toolId: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export default function ToolFavoriteButton({
  toolId,
  size = 'md',
  showText = false,
  className = '',
}: ToolFavoriteButtonProps) {
  const { isFavorited, isLoading, toggleFavorite } = useToolFavorite(toolId);

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

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite();
      }}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]}
        ${showText ? 'flex items-center gap-2 px-3' : ''}
        rounded-lg transition-all duration-200
        ${isFavorited 
          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
          : 'bg-slate-800/50 text-gray-400 hover:text-red-400 hover:bg-slate-700/50'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title={isFavorited ? '取消收藏' : '收藏工具'}
    >
      <motion.div
        animate={isFavorited ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart 
          className={`${iconSizes[size]} ${isFavorited ? 'fill-red-400' : ''}`} 
        />
      </motion.div>
      {showText && (
        <span className="text-sm font-medium">
          {isFavorited ? '已收藏' : '收藏'}
        </span>
      )}
    </motion.button>
  );
}
