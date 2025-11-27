/**
 * 项目展示页面组件 - 展示个人开源项目
 * 包含项目卡片、GitHub统计、演示链接和技术标签
 * 支持搜索、筛选和排序功能
 */

'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import ProjectFilter from '@/components/ProjectFilter';
import { Github, ExternalLink, Star, GitFork, Eye } from 'lucide-react';
import Link from 'next/link';
import { getProjectsAdvanced, ProjectSortOption, Project } from '@/lib/supabase-helpers';

export default function Projects() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // 搜索、筛选和排序状态
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<ProjectSortOption>('latest');

  useEffect(() => {
    loadProjects();
  }, [searchQuery, selectedTags, sortBy]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const { data } = await getProjectsAdvanced({
        query: searchQuery,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        sortBy,
      });
      setProjects(data || []);
    } catch (error) {
      console.error('加载项目失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 使用防抖处理搜索
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <main className="min-h-screen relative">
      <ParticleBackground />
      <Navigation />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* 页面标题区域 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              我的项目
            </h1>
            <p className="text-xl text-gray-400">
              一些我引以为豪的开源项目和实验性作品
            </p>
          </motion.div>

          {/* 搜索、筛选和排序 */}
          <ProjectFilter
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalProjects={projects.length}
          />

          {/* 加载状态 */}
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse rounded-2xl bg-slate-900/50 border border-cyan-400/20">
                  <div className="h-64 bg-slate-800" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 w-1/2 bg-slate-700 rounded" />
                    <div className="h-4 w-full bg-slate-700 rounded" />
                    <div className="h-4 w-3/4 bg-slate-700 rounded" />
                    <div className="flex gap-2">
                      {[1, 2, 3].map(j => (
                        <div key={j} className="h-6 w-16 bg-slate-700 rounded-full" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-slate-900/50 border border-cyan-400/20 rounded-2xl"
            >
              <p className="text-xl text-gray-400 mb-2">
                {searchQuery || selectedTags.length > 0 
                  ? '没有找到匹配的项目' 
                  : '暂无项目'
                }
              </p>
              <p className="text-sm text-gray-500">
                {searchQuery || selectedTags.length > 0 
                  ? '尝试调整搜索条件或清除筛选' 
                  : '管理员可在后台添加项目'
                }
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-900/20 to-blue-900/20 backdrop-blur-xl border border-cyan-500/20 hover:border-cyan-500/50 transition-all"
                >
                  {/* 项目图片区域 */}
                  <div className="relative h-64 overflow-hidden">
                    <motion.img
                      src={project.cover_image}
                      alt={project.title}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  </div>

                  {/* 项目内容区域 */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-gray-300 mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    {/* 技术标签 */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags?.map((tag: string) => (
                        <span
                          key={tag}
                          className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                            selectedTags.includes(tag)
                              ? 'bg-cyan-500 text-white border-cyan-500'
                              : 'bg-cyan-600/30 text-cyan-300 border-cyan-500/30'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* 统计信息和链接 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          <span>{project.stars}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GitFork className="w-4 h-4" />
                          <span>{project.forks}</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Link href={`/projects/${project.id}`}>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="w-10 h-10 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-300 hover:bg-purple-600/50 transition-colors cursor-pointer"
                            title="查看详情"
                          >
                            <Eye className="w-5 h-5" />
                          </motion.div>
                        </Link>
                        {project.github_url && (
                          <motion.a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.1 }}
                            className="w-10 h-10 rounded-full bg-cyan-600/30 flex items-center justify-center text-cyan-300 hover:bg-cyan-600/50 transition-colors"
                            title="GitHub"
                          >
                            <Github className="w-5 h-5" />
                          </motion.a>
                        )}
                        {project.demo_url && (
                          <motion.a
                            href={project.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.1 }}
                            className="w-10 h-10 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-300 hover:bg-blue-600/50 transition-colors"
                            title="在线演示"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </motion.a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
