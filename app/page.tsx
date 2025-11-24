'use client';

import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import BlogList from '@/components/BlogList';
import Footer from '@/components/Footer';
import ImageBackground from '@/components/ImageBackground';
import ScrollToTop from '@/components/ScrollToTop';

/**
 * 首页组件 - 网站的主页面
 * 包含导航栏、英雄区域、博客列表、页脚等核心模块
 */
export default function Home() {
  /**
   * 渲染函数 - 返回首页的主要JSX结构
   * 按顺序渲染：背景图片、导航栏、英雄区域、博客列表、页脚、返回顶部按钮
   */
  return (
    <main className="min-h-screen relative">
      {/* 背景图片组件 - 提供动态背景效果 */}
      <ImageBackground />
      
      {/* 导航栏组件 - 包含Logo、导航链接 */}
      <Navigation />
      
      {/* 英雄区域组件 - 网站的主要展示区域 */}
      <Hero />
      
      {/* 博客列表组件 - 展示博客文章卡片 */}
      <BlogList />
      
      {/* 页脚组件 - 网站底部信息 */}
      <Footer />
      
      {/* 返回顶部按钮 - 滚动时显示的悬浮按钮 */}
      <ScrollToTop />
    </main>
  );
}
