'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { Database } from '@/lib/database.types';
import Link from 'next/link';

type Post = Database['public']['Tables']['posts']['Row'];

export default function PostsManagement() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      // 检查用户权限
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('请先登录');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('加载文章失败:', error);
        alert('加载文章失败: ' + error.message);
        setPosts([]);
      } else {
        setPosts(data || []);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
      alert('加载失败，请检查权限设置');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这篇文章吗？')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('删除失败:', error);
        alert('删除失败: ' + error.message);
        return;
      }
      
      setPosts(posts.filter(p => p.id !== id));
      alert('删除成功！');
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('删除失败，请检查权限');
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-cyan-400 text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">文章管理</h1>
          <p className="text-gray-400">管理所有博客文章</p>
        </div>
        <Link href="/admin/posts/new">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>创建文章</span>
          </motion.button>
        </Link>
      </div>

      {/* 搜索栏 */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索文章..."
            className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-cyan-400/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
          />
        </div>
      </div>

      {/* 文章列表 */}
      <div className="bg-slate-900 border border-cyan-400/20 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">标题</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">状态</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">浏览量</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">点赞数</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">创建时间</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-400/10">
              {filteredPosts.map((post) => (
                <motion.tr
                  key={post.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-white font-medium">{post.title}</p>
                        <p className="text-gray-400 text-sm">{post.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                      post.status === 'published' 
                        ? 'bg-green-500/20 text-green-400'
                        : post.status === 'draft'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {post.status === 'published' ? '已发布' : post.status === 'draft' ? '草稿' : '已归档'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{post.views}</td>
                  <td className="px-6 py-4 text-gray-300">{post.likes}</td>
                  <td className="px-6 py-4 text-gray-300">
                    {new Date(post.created_at).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/blog/${post.slug}`} target="_blank">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                          title="查看"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                      </Link>
                      <Link href={`/admin/posts/${post.id}`}>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                      </Link>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => handleDelete(post.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            {searchTerm ? '未找到匹配的文章' : '暂无文章'}
          </div>
        )}
      </div>
    </div>
  );
}
