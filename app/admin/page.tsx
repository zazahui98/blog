'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, MessageSquare, Eye, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

interface Stats {
  totalPosts: number;
  totalUsers: number;
  totalComments: number;
  totalViews: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    totalUsers: 0,
    totalComments: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [postsResult, usersResult, commentsResult, viewsResult] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
        supabase.from('posts').select('views'),
      ]);

      const totalViews = viewsResult.data?.reduce((sum, post) => sum + ((post as { views?: number }).views || 0), 0) || 0;

      setStats({
        totalPosts: postsResult.count || 0,
        totalUsers: usersResult.count || 0,
        totalComments: commentsResult.count || 0,
        totalViews,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: '总文章数',
      value: stats.totalPosts,
      icon: FileText,
      color: 'from-cyan-500 to-blue-500',
      bgColor: 'bg-cyan-500/10',
      iconColor: 'text-cyan-400',
    },
    {
      title: '总用户数',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-400',
    },
    {
      title: '总评论数',
      value: stats.totalComments,
      icon: MessageSquare,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-400',
    },
    {
      title: '总浏览量',
      value: stats.totalViews,
      icon: Eye,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
      iconColor: 'text-orange-400',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-cyan-400 text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">仪表盘</h1>
        <p className="text-gray-400">欢迎回到管理后台</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-900 border border-cyan-400/20 rounded-2xl p-6 hover:border-cyan-400/40 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${card.bgColor} rounded-xl`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-gray-400 text-sm mb-1">{card.title}</h3>
            <p className="text-3xl font-bold text-white">{card.value.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      {/* 快速操作 */}
      <div className="bg-slate-900 border border-cyan-400/20 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">快速操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.a
            href="/admin/posts/new"
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
          >
            <FileText className="w-8 h-8 text-cyan-400 mb-2" />
            <h3 className="text-white font-semibold mb-1">创建文章</h3>
            <p className="text-gray-400 text-sm">发布新的博客文章</p>
          </motion.a>

          <motion.a
            href="/admin/users"
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
          >
            <Users className="w-8 h-8 text-purple-400 mb-2" />
            <h3 className="text-white font-semibold mb-1">管理用户</h3>
            <p className="text-gray-400 text-sm">查看和管理用户</p>
          </motion.a>

          <motion.a
            href="/admin/comments"
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
          >
            <MessageSquare className="w-8 h-8 text-green-400 mb-2" />
            <h3 className="text-white font-semibold mb-1">审核评论</h3>
            <p className="text-gray-400 text-sm">管理用户评论</p>
          </motion.a>
        </div>
      </div>
    </div>
  );
}
