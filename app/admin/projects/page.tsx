'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, ExternalLink, Github } from 'lucide-react';
import { getProjects, createProject, updateProject, deleteProject, type Project } from '@/lib/supabase-helpers';
import ImageUpload from '@/components/ImageUpload';
import RichTextEditor from '@/components/RichTextEditor';

export default function ProjectsManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data } = await getProjects();
      setProjects(data || []);
    } catch (error) {
      console.error('加载项目失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个项目吗？')) return;

    try {
      const { error } = await deleteProject(id);
      if (error) throw error;
      setProjects(projects.filter(p => p.id !== id));
      alert('删除成功！');
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
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
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">项目管理</h1>
          <p className="text-gray-400">管理展示在前台的项目</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>添加项目</span>
        </motion.button>
      </div>

      {/* 项目列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-cyan-400/20 rounded-2xl overflow-hidden hover:border-cyan-400/40 transition-all"
          >
            {/* 项目封面 */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={project.cover_image}
                alt={project.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  project.is_published
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {project.is_published ? '已发布' : '未发布'}
                </span>
              </div>
            </div>

            {/* 项目信息 */}
            <div className="p-4">
              <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                {project.title}
              </h3>
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                {project.description}
              </p>

              {/* 标签 */}
              <div className="flex flex-wrap gap-2 mb-3">
                {project.tags?.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* 统计 */}
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                <div className="flex items-center gap-1">
                  <span>⭐</span>
                  <span>{project.stars}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🔱</span>
                  <span>{project.forks}</span>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-2">
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg transition-colors text-sm"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg transition-colors text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleEdit(project)}
                  className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                  title="编辑"
                >
                  <Edit className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleDelete(project.id)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12 text-gray-400 bg-slate-900 border border-cyan-400/20 rounded-2xl">
          暂无项目，点击右上角添加项目
        </div>
      )}

      {/* 编辑模态框 */}
      {showModal && (
        <ProjectEditModal
          project={editingProject}
          onClose={handleCloseModal}
          onSave={() => {
            handleCloseModal();
            loadProjects();
          }}
        />
      )}
    </div>
  );
}

function ProjectEditModal({ 
  project, 
  onClose, 
  onSave 
}: { 
  project: Project | null; 
  onClose: () => void; 
  onSave: () => void;
}) {

  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    content: project?.content || '',
    cover_image: project?.cover_image || '',
    tags: project?.tags?.join(', ') || '',
    github_url: project?.github_url || '',
    demo_url: project?.demo_url || '',
    stars: project?.stars || 0,
    forks: project?.forks || 0,
    order_index: project?.order_index || 0,
    is_published: project?.is_published ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证必填字段
    if (!formData.title) {
      alert('请填写项目标题');
      return;
    }
    if (!formData.description) {
      alert('请填写项目简介');
      return;
    }
    if (!formData.cover_image) {
      alert('请上传封面图片');
      return;
    }

    try {
      const data: Partial<Project> = {
        title: formData.title,
        description: formData.description,
        content: formData.content || '',
        cover_image: formData.cover_image,
        tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        github_url: formData.github_url || null,
        demo_url: formData.demo_url || null,
        stars: formData.stars,
        forks: formData.forks,
        order_index: formData.order_index,
        is_published: formData.is_published,
      };

      if (project?.id) {
        const { error } = await updateProject(project.id, data);
        if (error) throw error;
      } else {
        const { error } = await createProject(data);
        if (error) throw error;
      }

      alert('保存成功！');
      onSave();
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-cyan-400/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-bold text-white mb-6">
          {project ? '编辑项目' : '添加项目'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">基本信息</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                项目标题 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="输入项目名称"
                className="w-full px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                项目简介 *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={2}
                placeholder="一句话简短描述（显示在卡片上）"
                className="w-full px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50 resize-none"
              />
            </div>
          </div>

          {/* 详细内容 - 富文本编辑器 */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">项目详情</h3>
            <RichTextEditor
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              placeholder="详细介绍项目的功能、技术栈、特色等..."
              minHeight="300px"
            />
            <p className="mt-2 text-xs text-gray-500">
              💡 支持粘贴图片、拖拽图片、富文本格式等
            </p>
          </div>

          <ImageUpload
            value={formData.cover_image}
            onChange={(url) => setFormData({ ...formData, cover_image: url })}
            label="封面图片 *"
            folder="projects"
            immediate={true}
          />

          {/* 技术标签 */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">技术标签</h3>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="React, Next.js, TypeScript"
              className="w-full px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
            />
            <p className="mt-1 text-xs text-gray-500">用逗号分隔多个标签</p>
          </div>

          {/* 链接 */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">项目链接</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={formData.github_url}
                  onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                  placeholder="https://github.com/username/repo"
                  className="w-full px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  演示 URL
                </label>
                <input
                  type="url"
                  value={formData.demo_url}
                  onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                  placeholder="https://demo.example.com"
                  className="w-full px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
                />
              </div>
            </div>
          </div>

          {/* 统计和设置 */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">统计和设置</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ⭐ Stars
                </label>
                <input
                  type="number"
                  value={formData.stars}
                  onChange={(e) => setFormData({ ...formData, stars: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  🔱 Forks
                </label>
                <input
                  type="number"
                  value={formData.forks}
                  onChange={(e) => setFormData({ ...formData, forks: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  排序
                </label>
                <input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl cursor-pointer hover:bg-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="text-white">发布到前台展示</span>
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all"
            >
              保存
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-gray-300 font-semibold rounded-xl transition-all"
            >
              取消
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
