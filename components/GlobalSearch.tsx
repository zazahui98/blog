'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  FileText, 
  Folder, 
  User, 
  ArrowRight,
  Clock,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { searchAll, SearchResult, getSearchSuggestions } from '@/lib/search';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      loadSuggestions();
    } else {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    // 键盘快捷键关闭
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const loadSuggestions = async () => {
    const data = await getSearchSuggestions();
    setSuggestions(data);
  };

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    setLoading(true);
    try {
      const data = await searchAll(searchQuery);
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    
    // 防抖搜索
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  // 阻止事件冒泡，防止点击搜索面板内部时关闭
  const handlePanelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const hasResults = results && (
    results.posts.length > 0 || 
    results.projects.length > 0 || 
    results.users.length > 0
  );

  const noResults = results && !hasResults && query.trim();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* 搜索面板 */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="relative max-w-2xl mx-auto mt-20 mx-4"
            onClick={handlePanelClick}
          >

            
            <div className="bg-slate-900 border border-cyan-400/30 rounded-2xl shadow-2xl overflow-hidden">
              {/* 搜索输入框 */}
              <div className="flex items-center gap-3 p-4 border-b border-slate-700 relative">
                <Search className="w-5 h-5 text-cyan-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="搜索文章、项目、用户..."
                  className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-lg"
                />
                {loading && <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />}
                {query && !loading && (
                  <button onClick={() => { setQuery(''); setResults(null); }} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* 搜索结果 */}
              <div className="max-h-[60vh] overflow-y-auto">
                {/* 热门搜索建议 */}
                {!query && suggestions.length > 0 && (
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                      <Clock className="w-4 h-4" />
                      <span>热门搜索</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-1.5 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 hover:text-white transition-colors text-sm"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 文章结果 */}
                {results?.posts && results.posts.length > 0 && (
                  <div className="p-4 border-b border-slate-700/50">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                      <FileText className="w-4 h-4" />
                      <span>文章</span>
                    </div>
                    <div className="space-y-2">
                      {results.posts.map((post) => (
                        <Link
                          key={post.id}
                          href={`/blog/${post.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors group"
                        >
                          {post.cover_image && (
                            <img src={post.cover_image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium truncate group-hover:text-cyan-400 transition-colors">
                              {post.title}
                            </h4>
                            {post.excerpt && (
                              <p className="text-gray-500 text-sm truncate">{post.excerpt}</p>
                            )}
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 项目结果 */}
                {results?.projects && results.projects.length > 0 && (
                  <div className="p-4 border-b border-slate-700/50">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                      <Folder className="w-4 h-4" />
                      <span>项目</span>
                    </div>
                    <div className="space-y-2">
                      {results.projects.map((project) => (
                        <Link
                          key={project.id}
                          href={`/projects/${project.id}`}
                          onClick={onClose}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors group"
                        >
                          <img src={project.cover_image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium truncate group-hover:text-cyan-400 transition-colors">
                              {project.title}
                            </h4>
                            <p className="text-gray-500 text-sm truncate">{project.description}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 用户结果 */}
                {results?.users && results.users.length > 0 && (
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                      <User className="w-4 h-4" />
                      <span>用户</span>
                    </div>
                    <div className="space-y-2">
                      {results.users.map((user) => (
                        <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-medium">
                              {user.username[0].toUpperCase()}
                            </div>
                          )}
                          <span className="text-white">{user.username}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 无结果 */}
                {noResults && (
                  <div className="p-8 text-center">
                    <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">没有找到相关结果</p>
                    <p className="text-gray-500 text-sm mt-1">尝试使用其他关键词搜索</p>
                  </div>
                )}
              </div>

              {/* 底部提示 */}
              <div className="p-3 border-t border-slate-700 flex items-center justify-center text-xs text-gray-500 relative">
                <span>按 ESC 或点击 ✕ 关闭</span>
                <button
                  onClick={onClose}
                  className="absolute right-4 p-1.5 text-gray-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                  title="关闭搜索 (ESC)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
