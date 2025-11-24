'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Globe } from 'lucide-react';
import { getSiteSettings, upsertSiteSetting } from '@/lib/supabase-helpers';

export default function SiteInfoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [siteSettings, setSiteSettings] = useState({
    site_name: '',
    site_description: '',
    github: '',
    twitter: '',
    linkedin: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
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
    } catch (error) {
      console.error('加载设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
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

      alert('网站信息保存成功！');
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">网站信息</h1>
        <p className="text-gray-400">管理网站基本信息和社交媒体链接</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-cyan-400/20 rounded-2xl p-6"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              网站名称 *
            </label>
            <input
              type="text"
              value={siteSettings.site_name}
              onChange={(e) => setSiteSettings({ ...siteSettings, site_name: e.target.value })}
              placeholder="ErGou Blog"
              className="w-full px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              网站描述 *
            </label>
            <textarea
              value={siteSettings.site_description}
              onChange={(e) => setSiteSettings({ ...siteSettings, site_description: e.target.value })}
              rows={3}
              placeholder="用代码创造艺术，用技术改变世界"
              className="w-full px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50 resize-none"
            />
          </div>

          <div className="border-t border-cyan-400/10 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              社交媒体链接
            </h3>
            
            <div className="space-y-4">
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
