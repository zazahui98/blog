'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Ban, CheckCircle, Clock, Monitor, MapPin, Key } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { Database, UserRole } from '@/lib/database.types';
import AddUserModal from '@/components/AddUserModal';
import ResetUserPasswordModal from '@/components/ResetUserPasswordModal';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

export default function UsersManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; username: string } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // 使用新创建的视图来获取用户资料和邮箱信息
      const { data: usersWithEmails, error } = await supabase
        .from('user_profiles_with_email')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load users with emails:', error);
        
        // 如果视图不存在，回退到基础查询
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesError) throw profilesError;
        setUsers(profiles || []);
      } else {
        setUsers(usersWithEmails || []);
      }
    } catch (error: any) {
      console.error('Failed to load users:', error);
      if (error?.message?.includes('permission denied')) {
        alert('没有权限访问用户数据');
      } else if (error?.message?.includes('network')) {
        alert('网络连接失败，请检查网络后重试');
      } else {
        alert('加载用户数据失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole } as never)
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error: any) {
      console.error('Failed to update role:', error);
      if (error?.message?.includes('permission denied')) {
        alert('没有权限修改用户角色');
      } else if (error?.message?.includes('network')) {
        alert('网络连接失败，请检查网络后重试');
      } else {
        alert('修改用户角色失败，请稍后重试');
      }
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: !isActive } as never)
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: !isActive } : u));
    } catch (error: any) {
      console.error('Failed to toggle active status:', error);
      if (error?.message?.includes('permission denied')) {
        alert('没有权限修改用户状态');
      } else if (error?.message?.includes('network')) {
        alert('网络连接失败，请检查网络后重试');
      } else {
        alert('修改用户状态失败，请稍后重试');
      }
    }
  };

  const handleBanUser = async (userId: string, currentBanned: boolean) => {
    if (!currentBanned) {
      const reason = prompt('请输入禁言原因：');
      if (!reason) return;
      
      const days = prompt('禁言天数（输入0表示永久）：', '7');
      if (days === null) return;
      
      const bannedUntil = days === '0' ? null : new Date(Date.now() + parseInt(days) * 24 * 60 * 60 * 1000).toISOString();
      
      try {
        const { error } = await supabase
          .from('user_profiles')
          .update({ 
            is_banned: true,
            ban_reason: reason,
            banned_until: bannedUntil
          } as never)
          .eq('id', userId);

        if (error) throw error;
        alert('用户已被禁言');
        loadUsers();
      } catch (error: any) {
        console.error('Failed to ban user:', error);
        if (error?.message?.includes('permission denied')) {
          alert('没有权限禁言用户');
        } else if (error?.message?.includes('network')) {
          alert('网络连接失败，请检查网络后重试');
        } else {
          alert('禁言用户失败，请稍后重试');
        }
      }
    } else {
      if (!confirm('确定要解除禁言吗？')) return;
      
      try {
        const { error } = await supabase
          .from('user_profiles')
          .update({ 
            is_banned: false,
            ban_reason: null,
            banned_until: null
          } as never)
          .eq('id', userId);

        if (error) throw error;
        alert('已解除禁言');
        loadUsers();
      } catch (error: any) {
        console.error('Failed to unban user:', error);
        if (error?.message?.includes('permission denied')) {
          alert('没有权限解除禁言');
        } else if (error?.message?.includes('network')) {
          alert('网络连接失败，请检查网络后重试');
        } else {
          alert('解除禁言失败，请稍后重试');
        }
      }
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`确定要删除用户 "${username}" 吗？\n\n此操作将：\n- 删除用户资料\n- 删除用户的所有文章\n- 删除用户的所有评论\n\n此操作不可恢复！`)) return;
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      
      alert('用户已删除');
      setUsers(users.filter(u => u.id !== userId));
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      if (error?.message?.includes('permission denied')) {
        alert('没有权限删除用户');
      } else if (error?.message?.includes('network')) {
        alert('网络连接失败，请检查网络后重试');
      } else {
        alert('删除用户失败，请稍后重试');
      }
    }
  };

  const handleResetPassword = (userId: string, username: string) => {
    setSelectedUser({ id: userId, username });
    setShowResetPasswordModal(true);
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const username = user.username?.toLowerCase() || '';
    const fullName = user.full_name?.toLowerCase() || '';
    const email = (user as any).email?.toLowerCase() || '';
    
    return username.includes(searchLower) || 
           fullName.includes(searchLower) ||
           email.includes(searchLower);
  });

  const getRoleBadge = (role: UserRole) => {
    const styles = {
      admin: 'bg-red-500/20 text-red-400',
      editor: 'bg-blue-500/20 text-blue-400',
      user: 'bg-gray-500/20 text-gray-400',
    };
    const labels = {
      admin: '管理员',
      editor: '编辑',
      user: '用户',
    };
    return { style: styles[role], label: labels[role] };
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
          <h1 className="text-3xl font-bold text-white mb-2">用户管理</h1>
          <p className="text-gray-400">管理所有注册用户</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all"
        >
          <span>+ 新增用户</span>
        </motion.button>
      </div>

      {/* 搜索栏 */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索用户..."
            className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-cyan-400/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
          />
        </div>
      </div>

      {/* 用户列表 */}
      <div className="bg-slate-900 border border-cyan-400/20 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">用户</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">邮箱</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">角色</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">状态</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">最后登录</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">登录设备</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">注册时间</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-400/10">
              {filteredUsers.map((user) => {
                const roleBadge = getRoleBadge(user.role);
                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {user.username[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{user.username}</p>
                          <p className="text-gray-400 text-sm">{user.full_name || '未设置'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-300 text-sm">
                        {user.email || '无邮箱'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${roleBadge.style} bg-transparent border-0 cursor-pointer focus:outline-none`}
                      >
                        <option value="user">用户</option>
                        <option value="editor">编辑</option>
                        <option value="admin">管理员</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
                        user.is_active 
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {user.is_active ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>活跃</span>
                          </>
                        ) : (
                          <>
                            <Ban className="w-3 h-3" />
                            <span>禁用</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.last_login_at ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-gray-300 text-sm">
                            <Clock className="w-4 h-4 text-cyan-400" />
                            <span>{new Date(user.last_login_at).toLocaleString('zh-CN')}</span>
                          </div>
                          {user.last_login_ip && (
                            <div className="flex items-center gap-2 text-gray-400 text-xs">
                              <MapPin className="w-3 h-3" />
                              <span>{user.last_login_ip}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">从未登录</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.last_login_device_model ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-gray-300 text-sm">
                            <Monitor className="w-4 h-4 text-blue-400" />
                            <span className="font-medium">{user.last_login_device_model}</span>
                          </div>
                          <div className="text-gray-400 text-xs space-y-0.5">
                            {user.last_login_os && (
                              <div>系统: {user.last_login_os}</div>
                            )}
                            {user.last_login_browser && (
                              <div>浏览器: {user.last_login_browser}</div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(user.created_at).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => handleResetPassword(user.id, user.username)}
                          className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
                          title="重置密码"
                        >
                          <Key className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => handleBanUser(user.id, (user as never)['is_banned'] || false)}
                          className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
                          title={(user as never)['is_banned'] ? '解除禁言' : '禁言用户'}
                        >
                          <Ban className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => handleToggleActive(user.id, user.is_active)}
                          className={`p-2 transition-colors ${
                            user.is_active
                              ? 'text-gray-400 hover:text-orange-400'
                              : 'text-gray-400 hover:text-green-400'
                          }`}
                          title={user.is_active ? '禁用用户' : '启用用户'}
                        >
                          {user.is_active ? (
                            <Ban className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                          title="删除用户"
                        >
                          <span className="text-lg">🗑️</span>
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            {searchTerm ? '未找到匹配的用户' : '暂无用户'}
          </div>
        )}
      </div>

      {/* 新增用户模态框 */}
      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadUsers}
      />

      {/* 重置密码模态框 */}
      <ResetUserPasswordModal
        isOpen={showResetPasswordModal}
        onClose={() => {
          setShowResetPasswordModal(false);
          setSelectedUser(null);
        }}
        onSuccess={loadUsers}
        userId={selectedUser?.id || ''}
        username={selectedUser?.username || ''}
      />
    </div>
  );
}
