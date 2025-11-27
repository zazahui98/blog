'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import BlogList from '@/components/BlogList';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import { motion } from 'framer-motion';

/**
 * 博客列表页面 - 展示所有博客文章
 */
export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navigation />
      <AnnouncementBanner />
      
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                技术博客
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              分享技术知识，探索编程世界
            </p>
          </motion.div>

          {/* 博客列表 */}
          <BlogList />
        </div>
      </main>

      <Footer />
    </div>
  );
}
