'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flag, Check, X, AlertTriangle, MessageSquare, User, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

interface CommentReport {
  id: string;
  comment_id: string;
  reporter_id: string;
  reason: string;
  description: string | null;
  status: 'pending' | 'resolved' | 'dismissed';
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  comment?: {
    content: string;
    user_id: string;
    user_profiles?: {
      username: string;
    };
  };
  reporter?: {
    username: string;
  };
}

export default function CommentReportsPage() {
  const [reports, setReports] = useState<CommentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('pending');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const user = await getCurrentUser();
      setUserId(user?.id || null);
      loadReports();
    };
    init();
  }, [filter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('comment_reports')
        .select(`
          *,
          comment:comments(content, user_id, user_profiles(username)),
          reporter:user_profiles!comment_reports_reporter_id_fkey(username)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('加载举报列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId: string, status: 'resolved' | 'dismissed') => {
    if (!userId) return;
    
    try {
      const { error } = await (supabase as any)
        .from('comment_reports')
        .update({
          status,
          resolved_by: userId,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (error) throw error;
      loadReports();
    } catch (error) {
      console.error('处理举报失败:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/10';
      case 'resolved': return 'text-green-400 bg-green-500/10';
      case 'dismissed': return 'text-gray-400 bg-gray-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待处理';
      case 'resolved': return '已处理';
      case 'dismissed': return '已忽略';
      default: return status;
    }
  };


  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Flag className="w-8 h-8 text-cyan-400" />
          <h1 className="text-2xl font-bold text-white">评论举报管理</h1>
        </div>
        
        {/* 状态筛选 */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: '全部' },
            { key: 'pending', label: '待处理' },
            { key: 'resolved', label: '已处理' },
            { key: 'dismissed', label: '已忽略' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key as any)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === item.key
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800 text-gray-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 border border-yellow-400/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
            <span className="text-gray-400">待处理</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {reports.filter(r => r.status === 'pending').length}
          </p>
        </div>
        
        <div className="bg-slate-900/50 border border-green-400/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Check className="w-6 h-6 text-green-400" />
            <span className="text-gray-400">已处理</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {reports.filter(r => r.status === 'resolved').length}
          </p>
        </div>
        
        <div className="bg-slate-900/50 border border-gray-400/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <X className="w-6 h-6 text-gray-400" />
            <span className="text-gray-400">已忽略</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {reports.filter(r => r.status === 'dismissed').length}
          </p>
        </div>
      </div>

      {/* 举报列表 */}
      <div className="bg-slate-900/50 border border-cyan-400/20 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">举报列表</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            暂无举报记录
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {reports.map((report) => (
              <div key={report.id} className="p-6 hover:bg-slate-800/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* 举报信息 */}
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                      <span className="font-medium text-white">{report.reason}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(report.status)}`}>
                        {getStatusText(report.status)}
                      </span>
                    </div>
                    
                    {report.description && (
                      <p className="text-gray-400 text-sm mb-3">
                        {report.description}
                      </p>
                    )}
                    
                    {/* 被举报的评论 */}
                    <div className="bg-slate-800/50 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-500">被举报的评论：</span>
                      </div>
                      <p className="text-gray-300 text-sm">
                        {report.comment?.content || '评论已删除'}
                      </p>
                      {report.comment?.user_profiles?.username && (
                        <p className="text-xs text-gray-500 mt-1">
                          评论者: {report.comment.user_profiles.username}
                        </p>
                      )}
                    </div>
                    
                    {/* 举报详情 */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        举报人: {report.reporter?.username || '未知'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(report.created_at).toLocaleString('zh-CN')}
                      </span>
                    </div>
                  </div>
                  
                  {/* 操作按钮 */}
                  {report.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleResolve(report.id, 'resolved')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        处理
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleResolve(report.id, 'dismissed')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        忽略
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
