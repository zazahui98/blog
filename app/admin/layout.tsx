'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  MessageSquare, 
  FolderOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Briefcase,
  History,
  Wrench,
  Bell,
  Megaphone,
  Flag
} from 'lucide-react';
import { getCurrentUserProfile, signOut, UserProfile } from '@/lib/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const profile = await getCurrentUserProfile();
      
      if (!profile || (profile.role !== 'admin' && profile.role !== 'editor')) {
        router.push('/');
        return;
      }
      
      setUser(profile);
    } catch (error) {
      console.error('认证检查失败:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">加载中...</div>
      </div>
    );
  }

  const menuItems = [
    { icon: LayoutDashboard, label: '仪表盘', href: '/admin', roles: ['admin', 'editor'] },
    { icon: FileText, label: '文章管理', href: '/admin/posts', roles: ['admin', 'editor'] },
    { icon: Briefcase, label: '项目管理', href: '/admin/projects', roles: ['admin', 'editor'] },
    { icon: MessageSquare, label: '评论管理', href: '/admin/comments', roles: ['admin', 'editor'] },
    { icon: Flag, label: '举报管理', href: '/admin/comment-reports', roles: ['admin', 'editor'] },
    { icon: FolderOpen, label: '分类管理', href: '/admin/categories', roles: ['admin', 'editor'] },
    { icon: Megaphone, label: '公告管理', href: '/admin/announcements', roles: ['admin'] },
    { icon: Bell, label: '通知管理', href: '/admin/notifications', roles: ['admin'] },
    { icon: Wrench, label: '工具统计', href: '/admin/tools-stats', roles: ['admin'] },
    { icon: Users, label: '用户管理', href: '/admin/users', roles: ['admin'] },
    { icon: History, label: '登录历史', href: '/admin/login-history', roles: ['admin'] },
    { icon: Settings, label: '网站信息', href: '/admin/site-info', roles: ['admin'] },
    { icon: Settings, label: '关于我', href: '/admin/about', roles: ['admin'] },
    { icon: Settings, label: '系统设置', href: '/admin/settings', roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || 'user')
  );

  return (
    <div className="min-h-screen bg-slate-950">
      {/* 侧边栏 */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 80 }}
        className="fixed left-0 top-0 h-full bg-slate-900 border-r border-cyan-400/20 z-40"
      >
        <div className="p-4">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8">
            {sidebarOpen && (
              <Link href="/">
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                  ErGou Admin
                </h1>
              </Link>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-gray-400" />
              ) : (
                <Menu className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>

          {/* 菜单项 */}
          <nav className="space-y-2">
            {filteredMenuItems.map((item) => {
              // 精确匹配当前页面路径，避免子路径错误匹配
              const isActive = pathname === item.href || 
                              // 特殊处理子页面，确保只有特定子路径才匹配
                              (pathname.includes('/') && 
                               item.href !== '/admin' && 
                               pathname.startsWith(item.href + '/'));
              
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all cursor-pointer ${
                      isActive 
                        ? 'text-white bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-l-2 border-cyan-400'
                        : 'text-gray-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-cyan-400' : ''}`} />
                    {sidebarOpen && <span>{item.label}</span>}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* 用户信息 */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="p-3 bg-slate-800 rounded-lg">
              {sidebarOpen ? (
                <>
                  <p className="text-sm font-medium text-white truncate">
                    {user?.username}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  <button
                    onClick={handleSignOut}
                    className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>退出登录</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.aside>

      {/* 主内容区 */}
      <main
        className="transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? 256 : 80 }}
      >
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
