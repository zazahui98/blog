'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Globe, User, Briefcase } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import {
  getSiteSettings,
  upsertSiteSetting,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getAboutSettings,
  updateAboutSettings,
  createAboutSettings,
  type Project
} from '@/lib/supabase-helpers';

export default function SiteSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'site' | 'about' | 'projects'>('site');
  
  const [siteSettings, setSiteSettings] = useState({
    site_name: '',
    site_description: '',
    github: '',
    twitter: '',
    linkedin: '',
  });

  const [aboutSettings, setAboutSettings] = useState({
    intro: '',
    skills: [] as { name: string; level: number }[],
    stats: [] as { icon: string; value: string; label: string }[],
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // 加载网站设置
      const { data: siteData } = await getSiteSettings();

      if (siteData) {
        const settings: any = {};
        siteData.forEach((item) => {
          if (item.key === 'site_name') {
            const value = item.value as any;
            settings.site_name = value.zh || value || '';
          } else if (item.key === 'site_description') {
            const value = item.value as any;
            settings.site_description = value.zh || value || '';
          } else if (item.key === 'social_links') {
            const value = item.value as any;
            settings.github = value.github || '';
            settings.twitter = value.twitter || '';
            settings.linkedin = value.linkedin || '';
          }
        });
        setSiteSettings(settings);
      }

      // 加载关于我设置
      const { data: aboutData } = await getAboutSettings();

      if (aboutData) {
        setAboutSettings({
          intro: aboutData.intro || '',
          skills: aboutData.skills || [],
          stats: aboutData.stats || [],
        });
      }
    } catch (error) {
      console.error('加载设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSiteSettings = async () => {
    setSaving(true);
    try {
      // 更新网站名称
      await upsertSiteSetting({
        key: 'site_name',
        value: { zh: siteSettings.site_name },
        description: '网站名称'
      });

      // 更新网站描述
      await upsertSiteSetting({
        key: 'site_description',
        value: { zh: siteSettings.site_description },
        description: '网站描述'
      });

      // 更新社交链接
      await upsertSiteSetting({
        key: 'social_links',
        value: {
          github: siteSettings.github,
          twitter: siteSettings.twitter,
          linkedin: siteSettings.linkedin
        },
        description: '社交媒体链接'
      });

      alert('网站设置保存成功！');
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const saveAboutSettings = async () => {
    setSaving(true);
    try {
      const { data: existing } = await getAboutSettings();

      if (existing) {
        const { error } = await updateAboutSettings(existing.id, {
          intro: aboutSettings.intro,
          skills: aboutSettings.skills,
          stats: aboutSettings.stats,
          updated_at: new Date().toISOString()
        });
        
        if (error) throw error;
      } else {
        const { error } = await createAboutSettings({
          intro: aboutSettings.intro,
          skills: aboutSettings.skills,
          stats: aboutSettings.stats
        });
        
        if (error) throw error;
      }

      alert('关于我设置保存成功！');
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    setAboutSettings({
      ...aboutSettings,
      skills: [...aboutSettings.skills, { name: '', level: 80 }]
    });
  };

  const removeSkill = (index: number) => {
    setAboutSettings({
      ...aboutSettings,
      skills: aboutSettings.skills.filter((_, i) => i !== index)
    });
  };

  const updateSkill = (index: number, field: 'name' | 'level', value: string | number) => {
    const newSkills = [...aboutSettings.skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    setAboutSettings({ ...aboutSettings, skills: newSkills });
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">网站设置</h1>
        <p className="text-gray-400">管理网站信息、关于我和项目展示</p>
      </div>

      {/* 标签页 */}
      <div className="flex gap-4 mb-6">
        <TabButton
          active={activeTab === 'site'}
          onClick={() => setActiveTab('site')}
          icon={<Globe className="w-5 h-5" />}
        >
          网站信息
        </TabButton>
        <TabButton
          active={activeTab === 'about'}
          onClick={() => setActiveTab('about')}
          icon={<User className="w-5 h-5" />}
        >
          关于我
        </TabButton>
        <TabButton
          active={activeTab === 'projects'}
          onClick={() => setActiveTab('projects')}
          icon={<Briefcase className="w-5 h-5" />}
        >
          项目管理
        </TabButton>
      </div>

      {/* 网站信息 */}
      {activeTab === 'site' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-cyan-400/20 rounded-2xl p-6"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                网站名称
              </label>
              <input
                type="text"
                value={siteSettings.site_name}
                onChange={(e) => setSiteSettings({ ...siteSettings, site_name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                网站描述
              </label>
              <textarea
                value={siteSettings.site_description}
                onChange={(e) => setSiteSettings({ ...siteSettings, site_description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  GitHub
                </label>
                <input
                  type="url"
                  value={siteSettings.github}
                  onChange={(e) => setSiteSettings({ ...siteSettings, github: e.target.value })}
                  placeholder="https://github.com/username"
                  className="w-full px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Twitter
                </label>
                <input
                  type="url"
                  value={siteSettings.twitter}
                  onChange={(e) => setSiteSettings({ ...siteSettings, twitter: e.target.value })}
                  placeholder="https://twitter.com/username"
                  className="w-full px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={siteSettings.linkedin}
                  onChange={(e) => setSiteSettings({ ...siteSettings, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
                />
              </div>
            </div>

            <button
              onClick={saveSiteSettings}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? '保存中...' : '保存设置'}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* 关于我 */}
      {activeTab === 'about' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-cyan-400/20 rounded-2xl p-6"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                个人简介
              </label>
              <textarea
                value={aboutSettings.intro}
                onChange={(e) => setAboutSettings({ ...aboutSettings, intro: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50 resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-300">
                  技能列表
                </label>
                <button
                  onClick={addSkill}
                  className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
                >
                  添加技能
                </button>
              </div>
              <div className="space-y-3">
                {aboutSettings.skills.map((skill, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => updateSkill(index, 'name', e.target.value)}
                      placeholder="技能名称"
                      className="flex-1 px-4 py-2 bg-slate-800 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
                    />
                    <input
                      type="number"
                      value={skill.level}
                      onChange={(e) => updateSkill(index, 'level', parseInt(e.target.value))}
                      min="0"
                      max="100"
                      className="w-24 px-4 py-2 bg-slate-800 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
                    />
                    <button
                      onClick={() => removeSkill(index)}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={saveAboutSettings}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? '保存中...' : '保存设置'}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* 项目管理 */}
      {activeTab === 'projects' && (
        <ProjectsManager />
      )}
    </div>
  );
}

function TabButton({ 
  active, 
  onClick, 
  icon, 
  children 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
        active
          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
          : 'bg-slate-800 text-gray-400 hover:text-white'
      }`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

function ProjectsManager() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<any>(null);

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

  const handleDeleteProject = async (id: string) => {
    if (!confirm('确定要删除这个项目吗？')) return;

    try {
      const { error } = await deleteProject(id);
      if (error) throw error;
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400">加载中...</div>;
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setEditingProject({})}
        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all"
      >
        添加项目
      </button>

      <div className="grid gap-4">
        {projects.map((project) => (
          <div key={project.id} className="bg-slate-800 border border-cyan-400/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">{project.title}</h3>
                <p className="text-gray-400 text-sm">{project.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingProject(project)}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingProject && (
        <ProjectEditModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSave={() => {
            setEditingProject(null);
            loadProjects();
          }}
        />
      )}
    </div>
  );
}

function ProjectEditModal({ project, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    title: project.title || '',
    description: project.description || '',
    cover_image: project.cover_image || '',
    tags: project.tags?.join(', ') || '',
    github_url: project.github_url || '',
    demo_url: project.demo_url || '',
    stars: project.stars || 0,
    forks: project.forks || 0,
    is_published: project.is_published ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data: Partial<Project> = {
        ...formData,
        tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      };

      if (project.id) {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-cyan-400/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-bold text-white mb-6">
          {project.id ? '编辑项目' : '添加项目'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="项目标题"
            required
            className="w-full px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
          />

          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="项目描述"
            required
            rows={3}
            className="w-full px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50 resize-none"
          />

          <input
            type="url"
            value={formData.cover_image}
            onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
            placeholder="封面图片 URL"
            required
            className="w-full px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
          />

          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="标签（逗号分隔）"
            className="w-full px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="url"
              value={formData.github_url}
              onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
              placeholder="GitHub URL"
              className="px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
            />
            <input
              type="url"
              value={formData.demo_url}
              onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
              placeholder="演示 URL"
              className="px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <input
              type="number"
              value={formData.stars}
              onChange={(e) => setFormData({ ...formData, stars: parseInt(e.target.value) })}
              placeholder="Stars"
              className="px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
            />
            <input
              type="number"
              value={formData.forks}
              onChange={(e) => setFormData({ ...formData, forks: parseInt(e.target.value) })}
              placeholder="Forks"
              className="px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
            />
            <label className="flex items-center gap-2 px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="text-white">发布</span>
            </label>
          </div>

          <div className="flex gap-4">
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
