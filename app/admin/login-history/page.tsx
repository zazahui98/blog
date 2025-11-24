'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, Monitor, MapPin, CheckCircle, XCircle, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { Database } from '@/lib/database.types';

type LoginHistory = Database['public']['Tables']['login_history']['Row'];

interface LoginHistoryWithUser extends LoginHistory {
  username?: string;
}

export default function LoginHistoryPage() {
  const [history, setHistory] = useState<LoginHistoryWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSuccess, setFilterSuccess] = useState<'all' | 'success' | 'failed'>('all');
  const [filterDevice, setFilterDevice] = useState<string>('all');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      // 获取登录历史
      const { data: historyData, error: historyError } = await supabase
        .from('login_history')
        .select('*')
        .order('login_at', { ascending: false })
        .limit(100);

      if (historyError) throw historyError;

      // 获取用户信息
      if (historyData && historyData.length > 0) {
        const userIds = [...new Set(historyData.map((h: LoginHistory) => h.user_id).filter(Boolean))];
        const { data: usersData } = await supabase
          .from('user_profiles')
          .select('id, username')
          .in('id', userIds as string[]);

        const userMap = new Map(usersData?.map((u: { id: string; username: string }) => [u.id, u.username]) || []);

        const enrichedHistory = historyData.map((h: LoginHistory) => ({
          ...h,
          username: h.user_id ? userMap.get(h.user_id) : undefined,
        })) as LoginHistoryWithUser[];

        setHistory(enrichedHistory);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('Failed to load login history:', error);
    } finally {
      setLoading(false);
    }
  };

  const deviceTypes = ['all', ...new Set(history.map(h => h.device_type).filter(Boolean))];

  const filteredHistory = history.filter(item => {
    const matchesSearch = 
      item.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ip_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.device_model?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSuccess = 
      filterSuccess === 'all' ||
      (filterSuccess === 'success' && item.is_successful) ||
      (filterSuccess === 'failed' && !item.is_successful);

    const matchesDevice = 
      filterDevice === 'all' || item.device_type === filterDevice;

    return matchesSearch && matchesSuccess && matchesDevice;
  });

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">登录历史</h1>
        <p className="text-gray-400">查看所有用户的登录记录</p>
      </div>

      {/* 搜索和筛选 */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索用户名、IP地址或设备..."
            className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-cyan-400/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterSuccess}
              onChange={(e) => setFilterSuccess(e.target.value as typeof filterSuccess)}
              className="px-4 py-2 bg-slate-900 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
            >
              <option value="all">全部状态</option>
              <option value="success">成功</option>
              <option value="failed">失败</option>
            </select>
          </div>

          <select
            value={filterDevice}
            onChange={(e) => setFilterDevice(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/50"
          >
            <option value="all">全部设备</option>
            {deviceTypes.filter(t => t !== 'all').map(type => (
              <option key={type || 'unknown'} value={type || ''}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 登录历史列表 */}
      <div className="bg-slate-900 border border-cyan-400/20 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">用户</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">登录时间</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">IP地址</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">设备信息</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-400/10">
              {filteredHistory.map((item) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">
                      {item.username || '未知用户'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span>{new Date(item.login_at).toLocaleString('zh-CN')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span>{item.ip_address || '-'}</span>
                    </div>
                    {item.location_city && (
                      <div className="text-gray-400 text-xs mt-1">
                        {item.location_country} {item.location_city}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <Monitor className="w-4 h-4 text-purple-400" />
                        <span className="font-medium">
                          {item.device_brand && item.device_brand !== 'Unknown' 
                            ? `${item.device_brand} ${item.device_model || ''}`.trim()
                            : item.device_model || '-'
                          }
                        </span>
                      </div>
                      <div className="text-gray-400 text-xs space-y-0.5 ml-6">
                        {item.os_name && (
                          <div>
                            系统: {item.os_name} {item.os_version || ''}
                          </div>
                        )}
                        {item.browser_name && (
                          <div>
                            浏览器: {item.browser_name} {item.browser_version || ''}
                          </div>
                        )}
                        {item.device_type && (
                          <div className="capitalize">
                            类型: {item.device_type}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.is_successful ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        <span>成功</span>
                      </span>
                    ) : (
                      <div>
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400">
                          <XCircle className="w-3 h-3" />
                          <span>失败</span>
                        </span>
                        {item.failure_reason && (
                          <div className="text-gray-400 text-xs mt-1">
                            {item.failure_reason}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredHistory.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            {searchTerm || filterSuccess !== 'all' || filterDevice !== 'all'
              ? '未找到匹配的记录'
              : '暂无登录历史'
            }
          </div>
        )}
      </div>

      {/* 统计信息 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-cyan-400/20 rounded-xl p-4">
          <div className="text-gray-400 text-sm mb-1">总登录次数</div>
          <div className="text-2xl font-bold text-white">{history.length}</div>
        </div>
        <div className="bg-slate-900 border border-cyan-400/20 rounded-xl p-4">
          <div className="text-gray-400 text-sm mb-1">成功登录</div>
          <div className="text-2xl font-bold text-green-400">
            {history.filter(h => h.is_successful).length}
          </div>
        </div>
        <div className="bg-slate-900 border border-cyan-400/20 rounded-xl p-4">
          <div className="text-gray-400 text-sm mb-1">失败登录</div>
          <div className="text-2xl font-bold text-red-400">
            {history.filter(h => !h.is_successful).length}
          </div>
        </div>
      </div>
    </div>
  );
}
