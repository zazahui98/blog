'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Send, MessageSquare, Plus, Trash2, Eye, Calendar, User } from 'lucide-react';
import { sendNotification, Notification } from '@/lib/supabase-helpers';
import { InputField, TextareaField, SelectField } from '@/components/FormField';
import { useFormValidation, validationRules } from '@/hooks/useFormValidation';
import { supabase } from '@/lib/supabase';

interface NotificationForm {
  title: string;
  content: string;
  type: 'comment_reply' | 'article_update' | 'system' | 'mention';
  target_type: 'all' | 'specific';
  target_user_id: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  today: number;
}

interface NotificationWithUser extends Notification {
  user_profiles?: {
    username: string;
  };
}

export default function NotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState<NotificationStats>({ total: 0, unread: 0, today: 0 });
  const [users, setUsers] = useState<{ id: string; username: string }[]>([]);
  const [notifications, setNotifications] = useState<NotificationWithUser[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  const initialFormValues: NotificationForm = {
    title: '',
    content: '',
    type: 'system',
    target_type: 'all',
    target_user_id: '',
  };

  const formValidation = useFormValidation(initialFormValues, {
    title: [validationRules.required('标题不能为空'), validationRules.maxLength(200)],
    content: [validationRules.required('内容不能为空'), validationRules.maxLength(1000)],
  });

  useEffect(() => {
    loadStats();
    loadUsers();
    loadNotifications();
  }, []);

  const loadStats = async () => {
    try {
      const { count: total } = await (supabase as any)
        .from('notifications')
        .select('*', { count: 'exact', head: true });

      const { count: unread } = await (supabase as any)
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayCount } = await (supabase as any)
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      setStats({
        total: total || 0,
        unread: unread || 0,
        today: todayCount || 0,
      });
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data } = await (supabase as any)
        .from('user_profiles')
        .select('id, username')
        .order('username');
      setUsers(data || []);
    } catch (error) {
      console.error('加载用户列表失败:', error);
    }
  };

  const loadNotifications = async () => {
    setNotificationsLoading(true);
    try {
      // 先获取通知列表
      const { data: notificationsData, error: notificationsError } = await (supabase as any)
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (notificationsError) {
        console.error('查询通知错误:', notificationsError);
        setNotifications([]);
        return;
      }
      
      if (!notificationsData || notificationsData.length === 0) {
        setNotifications([]);
        return;
      }
      
      // 获取所有相关用户的信息
      const userIds = [...new Set(notificationsData.map((n: any) => n.user_id))];
      const { data: usersData } = await (supabase as any)
        .from('user_profiles')
        .select('id, username')
        .in('id', userIds);
      
      // 合并数据
      const usersMap = new Map(usersData?.map((u: any) => [u.id, u]) || []);
      const enrichedNotifications = notificationsData.map((n: any) => ({
        ...n,
        user_profiles: usersMap.get(n.user_id),
      }));
      
      setNotifications(enrichedNotifications);
    } catch (error) {
      console.error('加载通知列表失败:', error);
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!formValidation.validateAll()) return;

    setLoading(true);
    try {
      if (formValidation.values.target_type === 'all') {
        for (const user of users) {
          await sendNotification(
            user.id,
            formValidation.values.type,
            formValidation.values.title,
            formValidation.values.content
          );
        }
      } else {
        await sendNotification(
          formValidation.values.target_user_id,
          formValidation.values.type,
          formValidation.values.title,
          formValidation.values.content
        );
      }
      
      setShowForm(false);
      formValidation.reset();
      loadStats();
      loadNotifications();
      alert('通知发送成功！');
    } catch (error) {
      console.error('发送通知失败:', error);
      alert('发送通知失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!confirm('确定要删除这条通知吗？')) return;
    
    try {
      await (supabase as any)
        .from('notifications')
        .delete()
        .eq('id', id);
      loadNotifications();
      loadStats();
    } catch (error) {
      console.error('删除通知失败:', error);
    }
  };

  const typeOptions = [
    { value: 'system', label: '系统通知' },
    { value: 'article_update', label: '文章更新' },
    { value: 'comment_reply', label: '评论回复' },
    { value: 'mention', label: '提及通知' },
  ];

  const targetOptions = [
    { value: 'all', label: '所有用户' },
    { value: 'specific', label: '特定用户' },
  ];

  const userOptions = users.map(u => ({ value: u.id, label: u.username }));

  const getTypeLabel = (type: string) => {
    return typeOptions.find(t => t.value === type)?.label || type;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'system': return 'text-cyan-400 bg-cyan-500/10';
      case 'article_update': return 'text-green-400 bg-green-500/10';
      case 'comment_reply': return 'text-blue-400 bg-blue-500/10';
      case 'mention': return 'text-purple-400 bg-purple-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };


  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-cyan-400" />
          <h1 className="text-2xl font-bold text-white">通知管理</h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          发送通知
        </motion.button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 border border-cyan-400/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Send className="w-6 h-6 text-green-400" />
            <span className="text-gray-400">总通知数</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        
        <div className="bg-slate-900/50 border border-cyan-400/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-6 h-6 text-yellow-400" />
            <span className="text-gray-400">未读通知</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.unread}</p>
        </div>
        
        <div className="bg-slate-900/50 border border-cyan-400/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-6 h-6 text-purple-400" />
            <span className="text-gray-400">今日发送</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.today}</p>
        </div>
      </div>

      {/* 发送通知表单 */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-cyan-400/20 rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">发送通知</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <InputField
                label="通知标题"
                value={formValidation.values.title}
                onChange={(e) => formValidation.setValue('title', e.target.value)}
                onBlur={() => formValidation.handleBlur('title')}
                error={formValidation.errors.title}
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <TextareaField
                label="通知内容"
                value={formValidation.values.content}
                onChange={(e) => formValidation.setValue('content', e.target.value)}
                onBlur={() => formValidation.handleBlur('content')}
                error={formValidation.errors.content}
                rows={3}
                required
              />
            </div>
            
            <SelectField
              label="通知类型"
              options={typeOptions}
              value={formValidation.values.type}
              onChange={(value) => formValidation.setValue('type', value as any)}
            />
            
            <SelectField
              label="发送目标"
              options={targetOptions}
              value={formValidation.values.target_type}
              onChange={(value) => formValidation.setValue('target_type', value as any)}
            />
            
            {formValidation.values.target_type === 'specific' && (
              <div className="md:col-span-2">
                <SelectField
                  label="选择用户"
                  options={userOptions}
                  value={formValidation.values.target_user_id}
                  onChange={(value) => formValidation.setValue('target_user_id', value)}
                />
              </div>
            )}
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setShowForm(false);
                formValidation.reset();
              }}
              className="px-4 py-2 text-gray-400 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSendNotification}
              disabled={loading || !formValidation.isValid}
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  发送中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  发送通知
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* 已发送通知列表 */}
      <div className="bg-slate-900/50 border border-cyan-400/20 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">已发送通知</h2>
        </div>
        
        {notificationsLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            暂无通知记录
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-white truncate">{notification.title}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(notification.type)}`}>
                        {getTypeLabel(notification.type)}
                      </span>
                      {notification.is_read ? (
                        <span className="px-2 py-0.5 text-xs bg-green-500/10 text-green-400 rounded-full">已读</span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs bg-yellow-500/10 text-yellow-400 rounded-full">未读</span>
                      )}
                    </div>
                    {notification.content && (
                      <p className="text-gray-400 text-sm mb-2 line-clamp-2">{notification.content}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {notification.user_profiles?.username || '未知用户'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(notification.created_at).toLocaleString('zh-CN')}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteNotification(notification.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
