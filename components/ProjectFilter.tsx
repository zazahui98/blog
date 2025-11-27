'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  X, 
  Clock, 
  Star, 
  TrendingUp,
  ChevronDown,
  Tag
} from 'lucide-react';
import { ProjectSortOption, getAllProjectTags } from '@/lib/supabase-helpers';

interface ProjectFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  sortBy: ProjectSortOption;
  onSortChange: (sort: ProjectSortOption) => void;
  totalProjects: number;
}

const sortOptions = [
  { id: 'latest' as ProjectSortOption, label: '最新', icon: Clock },
  { id: 'stars' as ProjectSortOption, label: '星数', icon: Star },
  { id: 'trending' as ProjectSortOption, label: '热门', icon: TrendingUp },
];

export default function ProjectFilter({
  searchQuery,
  onSearchChange,
  selectedTags,
  onTagsChange,
  sortBy,
  onSortChange,
  totalProjects,
}: ProjectFilterProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    const { tags } = await getAllProjectTags();
    setAvailableTags(tags);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearFilters = () => {
    onSearchChange('');
    onTagsChange([]);
    onSortChange('latest');
  };

  const hasActiveFilters = searchQuery || selectedTags.length > 0 || sortBy !== 'latest';
  const currentSort = sortOptions.find(o => o.id === sortBy);

  return (
    <div className="mb-8 space-y-4">
      {/* 搜索和排序栏 */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 搜索框 */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索项目..."
            className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-cyan-400/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 筛选和排序按钮 */}
        <div className="flex gap-2">
          {/* 筛选按钮 */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
              showFilters || selectedTags.length > 0
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-900/50 border-cyan-400/20 text-gray-400 hover:text-white'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span>筛选</span>
            {selectedTags.length > 0 && (
              <span className="px-2 py-0.5 bg-cyan-500 text-white text-xs rounded-full">
                {selectedTags.length}
              </span>
            )}
          </motion.button>

          {/* 排序下拉 */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 border border-cyan-400/20 rounded-xl text-gray-400 hover:text-white transition-colors"
            >
              {currentSort && <currentSort.icon className="w-5 h-5" />}
              <span>{currentSort?.label}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {showSortDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-40 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden"
                  >
                    {sortOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          onSortChange(option.id);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-700 transition-colors ${
                          sortBy === option.id ? 'text-cyan-400' : 'text-gray-300'
                        }`}
                      >
                        <option.icon className="w-4 h-4" />
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 标签筛选面板 */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-slate-900/50 border border-cyan-400/20 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-gray-300">按标签筛选</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <motion.button
                    key={tag}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      selectedTags.includes(tag)
                        ? 'bg-cyan-500 text-white'
                        : 'bg-slate-800 text-gray-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {tag}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 结果统计和清除筛选 */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          共 <span className="text-white font-medium">{totalProjects}</span> 个项目
          {selectedTags.length > 0 && (
            <span className="ml-2">
              · 已选择 <span className="text-cyan-400">{selectedTags.length}</span> 个标签
            </span>
          )}
        </span>
        {hasActiveFilters && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearFilters}
            className="text-gray-400 hover:text-white flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            清除筛选
          </motion.button>
        )}
      </div>
    </div>
  );
}
