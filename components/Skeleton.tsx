'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-slate-700/50';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: '',
    none: '',
  };

  const style = {
    width: width,
    height: height,
  };

  if (animation === 'wave') {
    return (
      <div
        className={`${baseClasses} ${variantClasses[variant]} overflow-hidden ${className}`}
        style={style}
      >
        <motion.div
          className="h-full w-full bg-gradient-to-r from-transparent via-slate-600/30 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
}


// 文章卡片骨架屏
export function ArticleCardSkeleton() {
  return (
    <div className="bg-slate-900/50 border border-cyan-400/20 rounded-2xl overflow-hidden">
      <Skeleton className="h-48 w-full" variant="rectangular" />
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-3/4" variant="text" />
        <Skeleton className="h-4 w-full" variant="text" />
        <Skeleton className="h-4 w-2/3" variant="text" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" variant="rectangular" />
          <Skeleton className="h-6 w-16" variant="rectangular" />
        </div>
      </div>
    </div>
  );
}

// 项目卡片骨架屏
export function ProjectCardSkeleton() {
  return (
    <div className="bg-slate-900/50 border border-cyan-400/20 rounded-2xl overflow-hidden">
      <Skeleton className="h-64 w-full" variant="rectangular" />
      <div className="p-6 space-y-4">
        <Skeleton className="h-7 w-1/2" variant="text" />
        <Skeleton className="h-4 w-full" variant="text" />
        <Skeleton className="h-4 w-3/4" variant="text" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" variant="rectangular" />
          <Skeleton className="h-6 w-20" variant="rectangular" />
          <Skeleton className="h-6 w-20" variant="rectangular" />
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-12" variant="text" />
            <Skeleton className="h-4 w-12" variant="text" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10" variant="circular" />
            <Skeleton className="h-10 w-10" variant="circular" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 评论骨架屏
export function CommentSkeleton() {
  return (
    <div className="bg-slate-900/50 border border-cyan-400/20 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-10 h-10" variant="circular" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" variant="text" />
          <Skeleton className="h-3 w-32" variant="text" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" variant="text" />
        <Skeleton className="h-4 w-3/4" variant="text" />
      </div>
    </div>
  );
}

// 工具卡片骨架屏
export function ToolCardSkeleton() {
  return (
    <div className="bg-slate-900/50 border border-cyan-400/20 rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12" variant="rectangular" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/3" variant="text" />
          <Skeleton className="h-4 w-full" variant="text" />
        </div>
        <Skeleton className="w-5 h-5" variant="rectangular" />
      </div>
    </div>
  );
}

// 列表骨架屏
export function ListSkeleton({ count = 3, ItemSkeleton = ArticleCardSkeleton }: { 
  count?: number; 
  ItemSkeleton?: React.ComponentType;
}) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <ItemSkeleton key={i} />
      ))}
    </div>
  );
}

// 网格骨架屏
export function GridSkeleton({ 
  count = 4, 
  columns = 2,
  ItemSkeleton = ArticleCardSkeleton 
}: { 
  count?: number; 
  columns?: number;
  ItemSkeleton?: React.ComponentType;
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <ItemSkeleton key={i} />
      ))}
    </div>
  );
}
