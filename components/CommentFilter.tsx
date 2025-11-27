'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  TrendingUp, 
  Calendar, 
  User,
  ChevronDown,
  MessageSquare
} from 'lucide-react';
import { CommentSortOption } from '@/lib/supabase-helpers';

interface CommentFilterProps {
  sortBy: CommentSortOption;
  onSortChange: (sort: CommentSortOption) => void;
  filterAuthorReply: boolean;
  onFilterChange: (filter: boolean) => void;
  hasAuthor?: boolean;
  totalComments: number;
}

const sortOptions = [
  {
    id: 'newest' as CommentSortOption,
    label: '最新',
    icon: Clock,
    description: '按发布时间排序'
  },
  {
    id: 'hottest' as CommentSortOption,
    label: '最热',
    icon: TrendingUp,
    description: '按点赞数排序'
  },
  {
    id: 'oldest' as CommentSortOption,
    label: '最早',
    icon: Calendar,
    description: '按发布时间倒序'
  },
];

export default function CommentFilter({
  sortBy,
  onSortChange,
  filterAuthorReply,
  onFilterChange,
  hasAuthor = true,
  totalComments,
}: CommentFilterProps) {
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const currentSort = sortOptions.find(option => option.id === sortBy);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-900/30 border border-cyan-400/20 rounded-xl mb-6">
      {/* 左侧：统计信息 */}
      <div className="flex items-center gap-3">
        <MessageSquare className="w-5 h-5 text-cyan-400" />
        <div className="text-sm text-gray-400">
          共 <span className="text-white font-medium">{totalComments}</span> 条评论
          {filterAuthorReply && (
            <span className="ml-2 text-cyan-400">
              · 仅显示作者回复
            </span>
          )}
        </div>
      </div>

      {/* 右侧：排序和过滤控件 */}
      <div className="flex items-center gap-3">
        {/* 作者回复过滤 */}
        {hasAuthor && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onFilterChange(!filterAuthorReply)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              filterAuthorReply
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'bg-slate-800/50 text-gray-400 border border-slate-700/50 hover:text-gray-300 hover:border-slate-600'
            }`}
          >
            <User className="w-4 h-4" />
            <span>仅看作者</span>
            {filterAuthorReply && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 bg-cyan-400 rounded-full"
              />
            )}
          </motion.button>
        )}

        {/* 排序选择器 */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:border-slate-600 transition-all"
          >
            {currentSort && <currentSort.icon className="w-4 h-4" />}
            <span>{currentSort?.label}</span>
            <motion.div
              animate={{ rotate: showSortDropdown ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>

          {/* 排序下拉菜单 */}
          <AnimatePresence>
            {showSortDropdown && (
              <>
                {/* 背景遮罩 */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSortDropdown(false)}
                />
                
                {/* 下拉菜单 */}
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden"
                >
                  {sortOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        onClick={() => {
                          onSortChange(option.id);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-700 transition-colors ${
                          sortBy === option.id
                            ? 'bg-cyan-500/10 text-cyan-300'
                            : 'text-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <div className="flex-1">
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                        {sortBy === option.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 bg-cyan-400 rounded-full"
                          />
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
