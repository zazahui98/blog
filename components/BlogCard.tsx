'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import Link from 'next/link';
import { Calendar, Eye, Heart, MessageCircle, TrendingUp } from 'lucide-react';
import { useState } from 'react';

/**
 * 博客卡片属性接口 - 定义博客卡片组件接收的数据结构
 */
interface BlogCardProps {
  blog: {
    id: number;           // 博客ID
    slug?: string;        // 博客URL别名（可选）
    title: string;        // 博客标题
    excerpt: string;      // 博客摘要
    coverImage: string;   // 封面图片URL
    date: string;         // 发布日期
    tags: string[];       // 标签数组
    views: number;        // 浏览次数
    likes: number;        // 点赞次数
    comments: number;     // 评论数量
    userLiked?: boolean;  // 当前用户是否已点赞
  };
}

/**
 * 博客卡片组件 - 用于展示博客文章的卡片
 * 包含封面图、标题、摘要、标签、统计信息等功能
 * @param {BlogCardProps} props - 组件属性
 */
export default function BlogCard({ blog }: BlogCardProps) {
  // 悬停状态 - 控制卡片悬停效果
  const [isHovered, setIsHovered] = useState(false);
  
  // 鼠标位置状态 - 用于实现3D倾斜效果
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // 3D旋转角度 - 根据鼠标位置计算卡片倾斜角度
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  /**
   * 鼠标移动事件处理函数
   * 计算鼠标相对于卡片中心的位置，用于3D倾斜效果
   * @param {React.MouseEvent<HTMLDivElement>} e - 鼠标事件
   */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  // 标签颜色配置 - 用于不同标签的渐变色彩
  const tagColors = [
    'from-cyan-500 to-blue-500',      // 青色到蓝色
    'from-blue-500 to-indigo-500',    // 蓝色到靛蓝
    'from-indigo-500 to-cyan-500',    // 靛蓝到青色
  ];

  /**
   * 渲染函数 - 返回博客卡片的主要JSX结构
   * 包含封面图、标题、摘要、标签、统计信息等
   */
  return (
    <Link href={`/blog/${blog.slug || blog.id}`} className="block h-full">
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          x.set(0);
          y.set(0);
        }}
        whileHover={{ scale: 1.02 }}
        className="relative overflow-hidden rounded-2xl glass-dark border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 h-full flex flex-col cursor-pointer"
      >
        {/* 悬停光效 - 从左到右滑动的光效 */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"
          animate={{ x: isHovered ? ['-100%', '100%'] : '-100%' }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />

        {/* 封面图区域 */}
        <div className="relative h-48 overflow-hidden">
          {/* 封面图片 */}
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          {/* 底部渐变遮罩 - 确保文字可读性 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* 热门标签 - 仅显示在第一篇文章 */}
          {blog.id === 1 && (
            <div className="absolute top-4 left-4 glass-dark px-3 py-1.5 rounded-full border border-blue-500/30 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300 font-medium">Hot</span>
            </div>
          )}
          
          {/* 发布日期 */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 text-sm text-gray-300">
            <Calendar className="w-4 h-4" />
            <span>{blog.date}</span>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-6 flex-1 flex flex-col">
          {/* 博客标题 - 悬停时显示渐变效果 */}
          <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-400 group-hover:bg-clip-text group-hover:text-transparent transition-all">
            {blog.title}
          </h3>
          
          {/* 博客摘要 */}
          <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-1">{blog.excerpt}</p>

          {/* 标签区域 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.tags.map((tag, index) => (
              <span
                key={tag}
                className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${tagColors[index % tagColors.length]} text-white`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* 统计信息 - 浏览数、点赞数、评论数 */}
          <div className="flex items-center gap-4 text-sm text-gray-400 pt-4 border-t border-cyan-500/10">
            {/* 浏览数 */}
            <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{blog.views}</span>
            </motion.div>
            {/* 点赞数 */}
            <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-1">
              <Heart className={`w-4 h-4 ${blog.userLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{blog.likes}</span>
            </motion.div>
            {/* 评论数 */}
            <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{blog.comments}</span>
            </motion.div>
          </div>
        </div>

        {/* 底部装饰条 - 悬停时显示 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
      </motion.div>
    </Link>
  );
}
