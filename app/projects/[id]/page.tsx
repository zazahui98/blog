'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { Github, ExternalLink, Star, GitFork, ArrowLeft, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

export default function ProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    if (params.id) {
      loadProject();
    }
  }, [params.id]);

  const loadProject = async () => {
    if (!params.id) return;
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.id)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('加载项目失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen relative">
        <ParticleBackground />
        <Navigation />
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-400">加载中...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen relative">
        <ParticleBackground />
        <Navigation />
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-4">项目未找到</h1>
            <button
              onClick={() => router.push('/projects')}
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              返回项目列表
            </button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen relative">
      <ParticleBackground />
      <Navigation />

      <article className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* 返回按钮 */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push('/projects')}
            className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回项目列表</span>
          </motion.button>

          {/* 项目标题 */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"
          >
            {project.title}
          </motion.h1>

          {/* 项目简介 */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 mb-8"
          >
            {project.description}
          </motion.p>

          {/* 项目元信息 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-cyan-400/20"
          >
            {/* 统计信息 */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>{project.stars} Stars</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <GitFork className="w-5 h-5 text-cyan-400" />
                <span>{project.forks} Forks</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-5 h-5" />
                <span>{new Date(project.created_at).toLocaleDateString('zh-CN')}</span>
              </div>
            </div>

            {/* 链接按钮 */}
            <div className="flex gap-3 ml-auto">
              {project.github_url && (
                <motion.a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 rounded-lg transition-colors"
                >
                  <Github className="w-5 h-5" />
                  <span>GitHub</span>
                </motion.a>
              )}
              {project.demo_url && (
                <motion.a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>在线演示</span>
                </motion.a>
              )}
            </div>
          </motion.div>

          {/* 技术标签 */}
          {project.tags && project.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2 mb-8"
            >
              {project.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-cyan-600/20 border border-cyan-500/30 rounded-full text-sm text-cyan-300"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          )}

          {/* 封面图片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12 rounded-2xl overflow-hidden border border-cyan-400/20"
          >
            <img
              src={project.cover_image}
              alt={project.title}
              className="w-full h-auto"
            />
          </motion.div>

          {/* 项目详细内容 */}
          {project.content && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="prose prose-invert prose-cyan max-w-none"
            >
              <div
                className="rich-content"
                dangerouslySetInnerHTML={{ __html: project.content }}
              />
            </motion.div>
          )}
        </div>
      </article>

      <Footer />

      <style jsx global>{`
        .rich-content {
          color: #e5e7eb;
          line-height: 1.8;
        }
        .rich-content h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 1.5em 0 0.8em 0;
          color: #22d3ee;
          line-height: 1.3;
        }
        .rich-content h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 1.3em 0 0.7em 0;
          color: #22d3ee;
          line-height: 1.3;
        }
        .rich-content h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 1.2em 0 0.6em 0;
          color: #22d3ee;
          line-height: 1.3;
        }
        .rich-content p {
          margin: 1em 0;
          color: #e5e7eb;
        }
        .rich-content a {
          color: #22d3ee;
          text-decoration: underline;
        }
        .rich-content a:hover {
          color: #06b6d4;
        }
        .rich-content strong {
          font-weight: bold;
          color: #fff;
        }
        .rich-content em {
          font-style: italic;
        }
        .rich-content ul, .rich-content ol {
          margin: 1em 0;
          padding-left: 2em;
        }
        .rich-content li {
          margin: 0.5em 0;
        }
        .rich-content img {
          max-width: 100%;
          height: auto;
          margin: 1.5em 0;
          border-radius: 12px;
          border: 1px solid rgba(34, 211, 238, 0.2);
        }
        .rich-content hr {
          border: none;
          border-top: 2px solid rgba(34, 211, 238, 0.3);
          margin: 2em 0;
        }
        .rich-content blockquote {
          border-left: 4px solid #22d3ee;
          padding-left: 1em;
          margin: 1.5em 0;
          color: #94a3b8;
          font-style: italic;
          background: rgba(30, 41, 59, 0.5);
          padding: 1em;
          border-radius: 0.5em;
        }
        .rich-content code {
          background: #1e293b;
          padding: 0.2em 0.4em;
          border-radius: 0.25em;
          color: #22d3ee;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
        .rich-content pre {
          background: #1e293b;
          padding: 1em;
          border-radius: 0.5em;
          overflow-x: auto;
          margin: 1.5em 0;
          border: 1px solid #334155;
        }
        .rich-content pre code {
          background: none;
          padding: 0;
        }
      `}</style>
    </main>
  );
}
