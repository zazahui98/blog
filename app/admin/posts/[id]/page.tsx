'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { Database } from '@/lib/database.types';
import Link from 'next/link';
import RichTextEditor from '@/components/RichTextEditor';
import ImageUpload from '@/components/ImageUpload';

type Post = Database['public']['Tables']['posts']['Row'];

export default function EditPost() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    cover_image: '',
    tags: [] as string[],
    slug: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    published: false,
  });

  useEffect(() => {
    if (postId && postId !== 'new') {
      loadPost();
    } else {
      setLoading(false);
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      // 检查用户权限
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('请先登录');
        router.push('/admin');
        return;
      }

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (error) {
        console.error('加载文章失败:', error);
        alert('加载文章失败: ' + error.message);
        router.push('/admin/posts');
        return;
      }
      
      setPost(data);
      const postData = data as Post;
      setFormData({
        title: postData.title,
        content: postData.content,
        excerpt: postData.excerpt,
        cover_image: postData.cover_image,
        tags: postData.tags || [],
        slug: postData.slug,
        status: (postData.status as 'draft' | 'published' | 'archived') || 'draft',
        published: postData.published,
      });
    } catch (error) {
      console.error('Failed to load post:', error);
      alert('加载文章失败，请检查权限');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 检查用户权限
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('请先登录');
        setSaving(false);
        return;
      }

      // 准备数据
      const postData = {
        ...formData,
        author_id: user.id,
        updated_at: new Date().toISOString()
      };

      if (postId === 'new') {
        // 创建新文章
        const { error } = await supabase
          .from('posts')
          .insert([postData as never]);

        if (error) {
          console.error('创建失败:', error);
          alert('创建失败: ' + error.message);
          return;
        }
        alert('文章创建成功！');
        router.push('/admin/posts');
      } else {
        // 更新文章
        const { error } = await supabase
          .from('posts')
          .update(postData as never)
          .eq('id', postId);

        if (error) {
          console.error('更新失败:', error);
          alert('更新失败: ' + error.message);
          return;
        }
        alert('文章更新成功！');
      }
    } catch (error) {
      console.error('Failed to save post:', error);
      alert('保存失败，请检查权限设置');
    } finally {
      setSaving(false);
    }
  };

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
        <div className="flex items-center gap-4">
          <Link href="/admin/posts">
            <motion.button
              whileHover={{ x: -4 }}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </motion.button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {postId === 'new' ? '创建文章' : '编辑文章'}
            </h1>
            <p className="text-gray-400">填写文章信息</p>
          </div>
        </div>
      </div>

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息卡片 */}
        <div className="bg-slate-900 border border-cyan-400/20 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">基本信息</h3>
          
          {/* 标题 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              标题 *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="输入文章标题"
              className="w-full px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL Slug *
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="my-article-slug"
              className="w-full px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400/50"
            />
            <p className="mt-1 text-xs text-gray-500">
              URL 友好的标识符，只能包含小写字母、数字和连字符
            </p>
          </div>
        </div>

        {/* 封面图片 */}
        <ImageUpload
          value={formData.cover_image}
          onChange={(url) => setFormData({ ...formData, cover_image: url })}
          label="封面图片 *"
          folder="posts"
        />

        {/* 封面和摘要卡片 */}
        <div className="bg-slate-900 border border-cyan-400/20 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">封面和摘要</h3>
          
          <ImageUpload
            value={formData.cover_image}
            onChange={(url) => setFormData({ ...formData, cover_image: url })}
            label="封面图片 *"
            folder="posts"
          />

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              摘要 *
            </label>
            <textarea
              required
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              placeholder="简短描述文章内容，吸引读者点击..."
              className="w-full px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50 resize-none"
            />
          </div>
        </div>

        {/* 内容编辑器 */}
        <div className="bg-slate-900 border border-cyan-400/20 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">文章内容</h3>
          <RichTextEditor
            value={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
            placeholder="开始写作... 支持粘贴图片、拖拽图片"
          />
        </div>

        {/* 标签和设置 */}
        <div className="bg-slate-900 border border-cyan-400/20 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">标签和设置</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              标签（逗号分隔）
            </label>
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
              placeholder="React, Next.js, TypeScript"
              className="w-full px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                状态
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' | 'archived' })}
                className="w-full px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
              >
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
                <option value="archived">已归档</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                发布状态
              </label>
              <label className="flex items-center gap-3 px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl cursor-pointer hover:bg-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="text-white">公开发布</span>
              </label>
            </div>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? '保存中...' : '保存文章'}</span>
          </button>
          <Link href="/admin/posts">
            <button
              type="button"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-gray-300 font-semibold rounded-xl transition-all"
            >
              取消
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}
