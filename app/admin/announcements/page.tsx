'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Megaphone, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Info,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { 
  getAllAnnouncements, 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement,
  Announcement 
} from '@/lib/supabase-helpers';
import { getCurrentUser } from '@/lib/auth';

const typeOptions = [
  { value: 'info', label: '信息', icon: Info, color: 'text-cyan-400 bg-cyan-500/20' },
  { value: 'warning', label: '警告', icon: AlertTriangle, color: 'text-yellow-400 bg-yellow-500/20' },
  { value: 'success', label: '成功', icon: CheckCircle, color: 'text-green-400 bg-green-500/20' },
  { value: 'error', label: '错误', icon: AlertCircle, color: 'text-red-400 bg-red-500/20' },
];

const audienceOptions = [
  { value: 'all', label: '所有人' },
  { value: 'users', label: '已登录用户' },
  { value: 'guests', label: '游客' },
];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info' as Announcement['type'],
    is_active: true,
    is_dismissible: true,
    start_date: '',
    end_date: '',
    target_audience: 'all' as Announcement['target_audience'],
    priority: 0,
  });

  useEffect(() => {
    const init = async () => {
      const user = await getCurrentUser();
      setUserId(user?.id || null);
      loadAnnouncements();
    };
    init();
  }, []);

  const loadAnnouncements = async () => {
    const { data } = await getAllAnnouncements();
    setAnnouncements(data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'info',
      is_active: true,
      is_dismissible: true,
      start_date: '',
      end_date: '',
      target_audience: 'all',
      priority: 0,
    });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content || !userId) return;

    const data = {
      ...formData,
      created_by: userId,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    };

    if (editingId) {
      await updateAnnouncement(editingId, data);
    } else {
      await createAnnouncement(data as any);
    }

    setShowModal(false);
    resetForm();
    loadAnnouncements();
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    // 支持新旧字段名
    const startDate = (announcement as any).start_date || (announcement as any).start_time;
    const endDate = (announcement as any).end_date || (announcement as any).end_time;
    const targetAudience = (announcement as any).target_audience || 'all';
    
    setFormData({
      title: announcement.title,
      content: announcement.content || '',
      type: announcement.type,
      is_active: announcement.is_active,
      is_dismissible: announcement.is_dismissible,
      start_date: startDate ? startDate.split('T')[0] : '',
      end_date: endDate ? endDate.split('T')[0] : '',
      target_audience: targetAudience,
      priority: announcement.priority,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个公告吗？')) {
      await deleteAnnouncement(id);
      loadAnnouncements();
    }
  };

  const handleToggleActive = async (announcement: Announcement) => {
    await updateAnnouncement(announcement.id, { is_active: !announcement.is_active });
    loadAnnouncements();
  };

  const getTypeInfo = (type: string) => {
    return typeOptions.find(t => t.value === type) || typeOptions[0];
  };


  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Megaphone className="w-8 h-8 text-cyan-400" />
          <h1 className="text-2xl font-bold text-white">公告管理</h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建公告
        </motion.button>
      </div>

      {/* 公告列表 */}
      <div className="bg-slate-900/50 border border-cyan-400/20 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">公告列表</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            暂无公告
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {announcements.map((announcement) => {
              const typeInfo = getTypeInfo(announcement.type);
              const TypeIcon = typeInfo.icon;
              return (
                <div key={announcement.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <TypeIcon className={`w-4 h-4 ${typeInfo.color.split(' ')[0]}`} />
                        <h3 className="font-medium text-white truncate">{announcement.title}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                        {!announcement.is_active && (
                          <span className="px-2 py-0.5 text-xs bg-gray-500/20 text-gray-400 rounded-full">
                            已禁用
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-2 line-clamp-2">{announcement.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>受众: {audienceOptions.find(a => a.value === announcement.target_audience)?.label}</span>
                        <span>优先级: {announcement.priority}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(announcement.created_at).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(announcement)}
                        className={`p-2 rounded-lg transition-colors ${
                          announcement.is_active
                            ? 'text-green-400 hover:bg-green-500/10'
                            : 'text-gray-500 hover:bg-gray-500/10'
                        }`}
                        title={announcement.is_active ? '禁用' : '启用'}
                      >
                        {announcement.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleEdit(announcement)}
                        className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>


      {/* 新建/编辑公告模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-cyan-400/20 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold text-white mb-4">
              {editingId ? '编辑公告' : '新建公告'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">标题 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                  placeholder="输入公告标题"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">内容 *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-400 focus:outline-none resize-none"
                  placeholder="输入公告内容"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">类型</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                  >
                    {typeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">目标受众</label>
                  <select
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                  >
                    {audienceOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">开始日期</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">结束日期</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">优先级</label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                  placeholder="数字越大优先级越高"
                />
              </div>
              
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-cyan-500 border-slate-600 rounded focus:ring-cyan-500"
                  />
                  <span className="text-gray-300 text-sm">启用公告</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_dismissible}
                    onChange={(e) => setFormData({ ...formData, is_dismissible: e.target.checked })}
                    className="w-4 h-4 text-cyan-500 border-slate-600 rounded focus:ring-cyan-500"
                  />
                  <span className="text-gray-300 text-sm">允许关闭</span>
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="flex-1 px-4 py-2 text-gray-400 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.title || !formData.content}
                className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingId ? '更新' : '创建'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
