/**
 * 项目展示页面组件 - 展示个人开源项目
 * 包含项目卡片、GitHub统计、演示链接和技术标签
 * 数据从数据库读取，可在后台管理中编辑
 */

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { Github, ExternalLink, Star, GitFork, Eye } from 'lucide-react';
import Link from 'next/link';
import { getProjects } from '@/lib/supabase-helpers';

export default function Projects() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data } = await getProjects();
      // 只显示已发布的项目
      const publishedProjects = data?.filter((p: any) => p.is_published) || [];
      setProjects(publishedProjects);
    } catch (error) {
      console.error('加载项目失败:', error);
    } finally {
      setLoading(false);
    }
  };

/**
   * 渲染函数 - 返回项目页面的主要JSX结构
   * 包含粒子背景、导航栏、项目标题和项目卡片网格
   */
  return (
    <main className="min-h-screen relative">
      {/* 粒子背景组件 - 提供动态背景效果 */}
      <ParticleBackground />
      
      {/* 导航栏组件 - 包含Logo、导航链接 */}
      <Navigation />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* 页面标题区域 - 带动画效果的标题和副标题 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            {/* 主标题 - 渐变文字效果 */}
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              我的项目
            </h1>
            {/* 副标题 */}
            <p className="text-xl text-gray-400">
              一些我引以为豪的开源项目和实验性作品
            </p>
          </motion.div>

          {/* 加载状态 */}
          {loading ? (
            <div className="text-center py-12 text-gray-400">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4">加载中...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-slate-900/50 border border-cyan-400/20 rounded-2xl">
              <p className="text-xl">暂无项目</p>
              <p className="text-sm mt-2">管理员可在后台添加项目</p>
            </div>
          ) : (
            /* 项目卡片网格 - 单列/双列响应式布局 */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {projects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-900/20 to-blue-900/20 backdrop-blur-xl border border-cyan-500/20 hover:border-cyan-500/50 transition-all"
              >
                {/* 项目图片区域 - 带悬停缩放效果 */}
                <div className="relative h-64 overflow-hidden">
                  <motion.img
                    src={project.cover_image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                  {/* 底部渐变遮罩 - 增强文字可读性 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                </div>

                {/* 项目内容区域 - 包含标题、描述、标签和链接 */}
                <div className="p-6">
                  {/* 项目标题 - 悬停时显示渐变效果 */}
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                    {project.title}
                  </h3>

                  {/* 项目描述 */}
                  <p className="text-gray-300 mb-4">
                    {project.description}
                  </p>

                  {/* 技术标签 - 横向排列 */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags?.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-cyan-600/30 rounded-full text-xs text-cyan-300 border border-cyan-500/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* 统计信息和链接 - 底部区域 */}
                  <div className="flex items-center justify-between">
                    {/* GitHub统计 - 星标数和分支数 */}
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      {/* 星标数 */}
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        <span>{project.stars}</span>
                      </div>
                      {/* 分支数 */}
                      <div className="flex items-center gap-1">
                        <GitFork className="w-4 h-4" />
                        <span>{project.forks}</span>
                      </div>
                    </div>

                    {/* 项目链接 - 查看详情、GitHub和演示链接 */}
                    <div className="flex gap-3">
                      {/* 查看详情按钮 */}
                      <Link href={`/projects/${project.id}`}>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="w-10 h-10 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-300 hover:bg-purple-600/50 transition-colors cursor-pointer"
                          title="查看详情"
                        >
                          <Eye className="w-5 h-5" />
                        </motion.div>
                      </Link>
                      {/* GitHub链接 - 圆形按钮 */}
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
                      {/* 演示链接 - 圆形按钮 */}
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

      {/* 页脚组件 - 网站底部信息 */}
      <Footer />
    </main>
  );
}
