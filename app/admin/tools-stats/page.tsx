'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Heart,
  Clock,
  Database,
  QrCode,
  FileText,
  Calculator,
  Binary,
  Palette,
  Key,
  RefreshCw
} from 'lucide-react';
import { getToolGlobalStats, ToolGlobalStat } from '@/lib/supabase-helpers';

// 工具图标映射
const toolIcons: Record<string, any> = {
  'data-generator': Database,
  'qrcode': QrCode,
  'json-formatter': FileText,
  'timestamp': Clock,
  'base64': Binary,
  'color-picker': Palette,
  'password-generator': Key,
  'calculator': Calculator,
};

// 工具名称映射
const toolNames: Record<string, string> = {
  'data-generator': '数据生成器',
  'qrcode': '二维码工具',
  'json-formatter': 'JSON格式化',
  'timestamp': '时间戳转换',
  'base64': 'Base64编解码',
  'color-picker': '颜色转换器',
  'password-generator': '密码生成器',
  'calculator': '程序员计算器',
};

export default function ToolsStatsPage() {
  const [stats, setStats] = useState<ToolGlobalStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    const { data, error } = await getToolGlobalStats();
    if (data) {
      setStats(data);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  // 计算总计
  const totalUsage = stats.reduce((sum, s) => sum + s.total_usage, 0);
  const totalUsers = stats.reduce((sum, s) => sum + s.unique_users, 0);
  const totalFavorites = stats.reduce((sum, s) => sum + s.favorite_count, 0);

  // 找出最热门的工具
  const mostPopular = stats.length > 0 ? stats[0] : null;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-slate-700 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-slate-800 rounded-xl" />
            ))}
          </div>
          <div className="h-96 bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-cyan-400" />
          <h1 className="text-2xl font-bold text-white">工具使用统计</h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          刷新数据
        </motion.button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="总使用次数"
          value={totalUsage.toLocaleString()}
          color="cyan"
        />
        <StatCard
          icon={Users}
          label="独立用户数"
          value={totalUsers.toLocaleString()}
          color="blue"
        />
        <StatCard
          icon={Heart}
          label="总收藏数"
          value={totalFavorites.toLocaleString()}
          color="red"
        />
        <StatCard
          icon={toolIcons[mostPopular?.tool_id || 'data-generator'] || Database}
          label="最热门工具"
          value={toolNames[mostPopular?.tool_id || ''] || '-'}
          color="purple"
        />
      </div>

      {/* 工具详细统计表格 */}
      <div className="bg-slate-900/50 border border-cyan-400/20 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">各工具使用详情</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  工具
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  使用次数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  独立用户
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  收藏数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  最后使用
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  使用占比
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {stats.map((stat, index) => {
                const Icon = toolIcons[stat.tool_id] || Database;
                const percentage = totalUsage > 0 ? (stat.total_usage / totalUsage * 100).toFixed(1) : '0';
                
                return (
                  <motion.tr
                    key={stat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/20 rounded-lg">
                          <Icon className="w-5 h-5 text-cyan-400" />
                        </div>
                        <span className="text-white font-medium">
                          {toolNames[stat.tool_id] || stat.tool_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-cyan-400 font-semibold">
                        {stat.total_usage.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-blue-400">
                        {stat.unique_users.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-red-400" />
                        <span className="text-red-400">
                          {stat.favorite_count}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                      {stat.last_used_at 
                        ? new Date(stat.last_used_at).toLocaleString('zh-CN')
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                          />
                        </div>
                        <span className="text-gray-400 text-sm w-12">
                          {percentage}%
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: any; 
  label: string; 
  value: string; 
  color: 'cyan' | 'blue' | 'red' | 'purple';
}) {
  const colorClasses = {
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400',
    red: 'from-red-500/20 to-red-500/5 border-red-500/30 text-red-400',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-xl bg-gradient-to-br ${colorClasses[color]} border`}
    >
      <div className="flex items-center gap-3 mb-3">
        <Icon className="w-6 h-6" />
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </motion.div>
  );
}
