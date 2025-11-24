'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2 } from 'lucide-react';
import { getAboutSettings, updateAboutSettings, createAboutSettings } from '@/lib/supabase-helpers';
import RichTextEditor from '@/components/RichTextEditor';

export default function AboutPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [aboutSettings, setAboutSettings] = useState({
    intro: '',
    skills: [] as { name: string; level: number; color?: string }[],
    stats: [] as { icon: string; value: string; label: string }[],
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
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

  const handleSave = async () => {
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
      skills: [...aboutSettings.skills, { name: '', level: 80, color: 'cyan' }]
    });
  };

  const removeSkill = (index: number) => {
    setAboutSettings({
      ...aboutSettings,
      skills: aboutSettings.skills.filter((_, i) => i !== index)
    });
  };

  const updateSkill = (index: number, field: 'name' | 'level' | 'color', value: string | number) => {
    const newSkills = [...aboutSettings.skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    setAboutSettings({ ...aboutSettings, skills: newSkills });
  };

  const addStat = () => {
    setAboutSettings({
      ...aboutSettings,
      stats: [...aboutSettings.stats, { icon: 'Code2', value: '0', label: '' }]
    });
  };

  const removeStat = (index: number) => {
    setAboutSettings({
      ...aboutSettings,
      stats: aboutSettings.stats.filter((_, i) => i !== index)
    });
  };

  const updateStat = (index: number, field: 'icon' | 'value' | 'label', value: string) => {
    const newStats = [...aboutSettings.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setAboutSettings({ ...aboutSettings, stats: newStats });
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
        <h1 className="text-3xl font-bold text-white mb-2">关于我</h1>
        <p className="text-gray-400">管理关于页面的个人信息、技能和统计数据</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-cyan-400/20 rounded-2xl p-6"
      >
        <div className="space-y-6">
          {/* 个人简介 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              个人简介 *
            </label>
            <RichTextEditor
              value={aboutSettings.intro}
              onChange={(intro) => setAboutSettings({ ...aboutSettings, intro })}
              placeholder="我是一名充满激情的全栈开发者..."
              minHeight="300px"
            />
            <p className="mt-2 text-xs text-gray-500">
              💡 支持富文本格式、粘贴图片、拖拽图片等
            </p>
          </div>

          {/* 技能列表 */}
          <div className="border-t border-cyan-400/10 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">技能列表</h3>
              <button
                onClick={addSkill}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>添加技能</span>
              </button>
            </div>
            <div className="space-y-3">
              {aboutSettings.skills.map((skill, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => updateSkill(index, 'name', e.target.value)}
                    placeholder="技能名称（如：React/Next.js）"
                    className="flex-1 px-4 py-2 bg-slate-800 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
                  />
                  <input
                    type="number"
                    value={skill.level}
                    onChange={(e) => updateSkill(index, 'level', parseInt(e.target.value))}
                    min="0"
                    max="100"
                    placeholder="熟练度"
                    className="w-24 px-4 py-2 bg-slate-800 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
                  />
                  <select
                    value={skill.color || 'cyan'}
                    onChange={(e) => updateSkill(index, 'color', e.target.value)}
                    className="w-32 px-4 py-2 bg-slate-800 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
                  >
                    <option value="cyan">青色</option>
                    <option value="blue">蓝色</option>
                    <option value="green">绿色</option>
                    <option value="purple">紫色</option>
                    <option value="orange">橙色</option>
                    <option value="red">红色</option>
                    <option value="yellow">黄色</option>
                    <option value="pink">粉色</option>
                    <option value="indigo">靛蓝</option>
                  </select>
                  <button
                    onClick={() => removeSkill(index)}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {aboutSettings.skills.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">
                  暂无技能，点击上方按钮添加
                </p>
              )}
            </div>
          </div>

          {/* 统计数据 */}
          <div className="border-t border-cyan-400/10 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">统计数据</h3>
              <button
                onClick={addStat}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>添加统计</span>
              </button>
            </div>
            <div className="space-y-3">
              {aboutSettings.stats.map((stat, index) => (
                <div key={index} className="flex gap-3">
                  <select
                    value={stat.icon}
                    onChange={(e) => updateStat(index, 'icon', e.target.value)}
                    className="w-32 px-4 py-2 bg-slate-800 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
                  >
                    <option value="Code2">代码</option>
                    <option value="Rocket">项目</option>
                    <option value="Award">奖项</option>
                    <option value="Users">社区</option>
                  </select>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => updateStat(index, 'value', e.target.value)}
                    placeholder="数值（如：50K+）"
                    className="w-32 px-4 py-2 bg-slate-800 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
                  />
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => updateStat(index, 'label', e.target.value)}
                    placeholder="标签（如：代码行数）"
                    className="flex-1 px-4 py-2 bg-slate-800 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
                  />
                  <button
                    onClick={() => removeStat(index)}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {aboutSettings.stats.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">
                  暂无统计数据，点击上方按钮添加
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? '保存中...' : '保存设置'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}