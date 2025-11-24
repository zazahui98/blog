/**
 * 博客列表组件 - 展示博客文章卡片列表
 * 从Supabase数据库获取文章数据
 */

'use client';

import { motion } from 'framer-motion';
import BlogCard from './BlogCard';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Post = Database['public']['Tables']['posts']['Row'];

export default function BlogList() {
    // 文章列表状态 - 存储从数据库获取的文章数据
    const [posts, setPosts] = useState<any[]>([]);
    
    // 加载状态 - 控制加载动画的显示
    const [loading, setLoading] = useState(true);

    /**
     * 获取文章数据的副作用函数
     * 从Supabase数据库获取文章并按创建时间倒序排列
     */
    useEffect(() => {
        async function fetchPosts() {
            // 从posts表中查询所有数据，按created_at字段降序排列
            const { data } = await supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) {
                // 格式化文章数据，根据语言选择显示内容
                const formattedPosts = await Promise.all((data as Post[]).map(async post => {
                    // 获取每篇文章的评论数
                    const { count } = await supabase
                        .from('comments')
                        .select('*', { count: 'exact', head: true })
                        .eq('post_id', post.id)
                        .eq('is_approved', true);

                    return {
                        id: post.id, // 文章ID
                        slug: post.slug, // 文章别名
                        title: post.title, // 标题
                        excerpt: post.excerpt || post.content?.substring(0, 100) + '...', // 摘要
                        coverImage: post.cover_image, // 封面图片
                        date: new Date(post.created_at).toLocaleDateString('zh-CN'), // 发布日期
                        tags: post.tags || [], // 标签数组
                        views: post.views || 0, // 浏览数，默认为0
                        likes: post.likes || 0, // 点赞数，默认为0
                        comments: count || 0, // 真实评论数
                    };
                }));
                setPosts(formattedPosts); // 更新文章列表状态
            }
            setLoading(false); // 设置加载状态为false
        }

        fetchPosts(); // 调用获取文章函数
    }, []); // 依赖项为空数组

    /**
     * 渲染函数 - 返回博客列表的主要JSX结构
     * 包含标题区域、加载状态和文章卡片网格
     */
    return (
        <section id="blog" className="py-20 px-6">
            <div className="max-w-7xl mx-auto">
                {/* 标题区域 - 带动画效果 */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-black mb-4">
                        <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            最新文章
                        </span>
                    </h2>
                    <p className="text-gray-400 text-lg">
                        探索技术世界的精彩内容
                    </p>
                </motion.div>

                {/* 加载状态 - 显示旋转动画 */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    // 文章卡片网格 - 响应式布局
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((blog, index) => (
                            <motion.div
                                key={blog.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }} // 每个卡片延迟0.1秒
                            >
                                <BlogCard blog={blog} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
