'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { Calendar, Eye, Heart, Tag, ArrowLeft } from 'lucide-react';
import CommentForm from '@/components/CommentForm';
import CommentList from '@/components/CommentList';
import LikeButton from '@/components/LikeButton';
/**
 * 博客文章详情页组件 - 展示单篇博客文章的完整内容
 * 包含文章封面图、标题、元信息、标签和正文内容
 * 自动更新浏览量统计
 */

import Link from 'next/link';

export default function BlogPost() {
  // URL参数 - 获取文章slug
  const params = useParams();
  // 文章数据 - 存储从数据库获取的文章信息
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取文章数据 - 根据slug从数据库查询文章
    async function fetchPost() {
      const slug = params.slug as string;
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (data) {
        setPost(data);
        // 更新浏览量 - 文章被查看时自动增加浏览数
        const postData = data as { id: string; views: number };
        await supabase
          .from('posts')
          .update({ views: postData.views + 1 } as never)
          .eq('id', postData.id);
      }
      setLoading(false);
    }

    fetchPost();
  }, [params.slug]);

  if (loading) {
    // 加载状态 - 显示旋转动画
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!post) {
    // 文章未找到 - 显示错误提示
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl text-gray-400">
          文章未找到
        </p>
      </div>
    );
  }

  // 标题内容
  const title = post.title;
  // 正文内容
  const content = post.content;

  return (
    // 主页面容器 - 包含导航栏、文章内容和页脚
    <main className="min-h-screen">
      {/* 导航栏组件 - 包含Logo、导航链接 */}
      <Navigation />
      
      <article className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* 返回按钮 - 带悬停动画效果 */}
          <Link href="/">
            <motion.button
              whileHover={{ x: -5 }}
              className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回首页</span>
            </motion.button>
          </Link>

          {/* 封面图片 - 带动画效果的图片展示 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-96 rounded-2xl overflow-hidden mb-8"
          >
            <img
              src={post.cover_image}
              alt={title}
              className="w-full h-full object-cover"
            />
            {/* 底部渐变遮罩 - 增强文字可读性 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </motion.div>

          {/* 元信息区域 - 显示发布日期、浏览量和点赞数 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap items-center gap-6 text-gray-400 mb-6"
          >
            {/* 发布日期 - 带日历图标 */}
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{new Date((post as { created_at: string }).created_at).toLocaleDateString('zh-CN')}</span>
            </div>
            {/* 浏览量统计 - 带眼睛图标 */}
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              <span>{(post as { views: number }).views}</span>
            </div>
            {/* 点赞数统计 - 带心形图标 */}
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              <span>{(post as { likes: number }).likes}</span>
            </div>
          </motion.div>

          {/* 文章标题 - 带动画效果的渐变文字 */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            {title}
          </motion.h1>

          {/* 标签和点赞区域 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-between gap-6 mb-12"
          >
            {/* 标签区域 - 显示文章相关标签 */}
            <div className="flex flex-wrap gap-3">
              {post.tags.map((tag: string) => (
                // 标签项 - 带图标和边框的圆角标签
                <span
                  key={tag}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600/30 rounded-full text-purple-300 border border-purple-500/30"
                >
                  <Tag className="w-4 h-4" />
                  {tag}
                </span>
              ))}
            </div>

            {/* 点赞按钮 */}
            <LikeButton postId={post.id} initialLikes={post.likes} />
          </motion.div>

          {/* 文章内容 - 使用dangerouslySetInnerHTML渲染HTML内容 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="prose prose-invert prose-lg max-w-none prose-headings:text-purple-400 prose-a:text-pink-400 prose-code:text-purple-300 prose-pre:bg-black/50 prose-pre:border prose-pre:border-purple-500/30"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* 评论区 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 pt-16 border-t border-cyan-400/20"
          >
            <h2 className="text-3xl font-bold text-white mb-8">
              评论
            </h2>
            
            {/* 评论表单 */}
            <div className="mb-12">
              <CommentForm 
                postId={post.id} 
                onSuccess={() => setPost({ ...post })} 
              />
            </div>

            {/* 评论列表 */}
            <CommentList 
              postId={post.id}
              refreshTrigger={post.views}
            />
          </motion.div>
        </div>
      </article>
      
      {/* 页脚组件 - 网站底部信息 */}
      <Footer />
    </main>
  );
}
