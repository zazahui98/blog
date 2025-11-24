/**
 * 动态项目页面 - 从数据库读取项目
 * 替换原有的静态页面
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { Github, ExternalLink, Star, GitFork } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

export default function Projects() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('is_published', true)
        .order('order_index');

      if (data) {
        setProjects(data);
      }
    } catch (error) {
      console.error('加载项目失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">加载中...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative">
      <ParticleBackground />
      <Navigation />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              我的项目
            </h1>
            <p className="text-xl text-gray-400">
              一些我引以为豪的开源项目和实验性作品
            </p>
          </motion.div>

          {projects.length === 0 ? (
            <div className="text-center text-gray-400 py-20">
              暂无项目
            </div>
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

                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                      {project.title}
                    </h3>

                    <p className="text-gray-300 mb-4">
                      {project.description}
                    </p>

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
                        {project.github_url && (
                          <motion.a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.1 }}
                            className="w-10 h-10 rounded-full bg-cyan-600/30 flex items-center justify-center text-cyan-300 hover:bg-cyan-600/50 transition-colors"
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
