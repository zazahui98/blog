'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Star, Home, FolderGit2, User, Menu, X, BookOpen, Wrench, Search, LayoutDashboard, Settings, LogOut, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCurrentUserProfile, getCurrentUser, signOut } from '@/lib/auth';
import UserMenu from './UserMenu';
import GlobalSearch from './GlobalSearch';
import NotificationBell from './NotificationBell';
import AnnouncementBanner from './AnnouncementBanner';
import { useToast } from '@/hooks/useToast';

/**
 * 导航栏组件 - 网站顶部导航菜单
 * 包含Logo、导航链接、移动端菜单等功能
 */
export default function Navigation() {
  
  // 滚动状态 - 控制导航栏样式变化
  const [isScrolled, setIsScrolled] = useState(false);
  
  // 移动端菜单状态 - 控制移动端菜单的显示/隐藏
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 搜索模态框状态
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // 最后滚动位置 - 用于判断滚动方向
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // 用户角色状态
  const [userRole, setUserRole] = useState<string>(''); // 空字符串表示未登录
  
  // 未读消息数量
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  // Toast 提示
  const { showToast } = useToast();

  /**
   * 滚动事件处理副作用
   * 1. 监听页面滚动，控制导航栏样式
   * 2. 向下滑动时自动关闭移动端菜单
   */
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // 滚动超过50px时改变导航栏样式
      setIsScrolled(currentScrollY > 50);
      
      // 向下滑动时关闭菜单（防止遮挡内容）
      if (isMobileMenuOpen && currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsMobileMenuOpen(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    // 添加滚动事件监听器
    window.addEventListener('scroll', handleScroll);
    
    // 清理函数 - 移除事件监听器
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileMenuOpen, lastScrollY]);

  // 获取用户登录状态和角色
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const profile = await getCurrentUserProfile();
          if (profile) {
            setUserRole(profile.role);
            // 获取未读消息数量
            const { getUnreadNotificationCount } = await import('@/lib/supabase-helpers');
            const { count } = await getUnreadNotificationCount(user.id);
            setUnreadCount(count);
          }
        } else {
          setUserRole(''); // 未登录时清空角色
          setUnreadCount(0); // 未登录时清空未读消息数量
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        setUserRole(''); // 出错时清空角色
        setUnreadCount(0); // 出错时清空未读消息数量
      }
    };

    loadUserInfo();
  }, []);

  // 键盘快捷键打开搜索
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /**
   * 点击外部区域关闭菜单
   * 当移动端菜单打开时，点击导航栏外部区域自动关闭菜单
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const navElement = document.querySelector('nav');
      
      // 如果点击的是导航栏外部区域，关闭菜单
      if (isMobileMenuOpen && navElement && !navElement.contains(target)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobileMenuOpen]);

  // 导航项配置 - 定义导航栏的各个链接项
  const navItems = [
    { icon: Home, label: '首页', href: '/' },      // 首页
    { icon: BookOpen, label: '博客', href: '/#blog' }, // 博客
    { icon: FolderGit2, label: '项目', href: '/projects' }, // 项目
    { icon: Wrench, label: '工具', href: '/tools' }, // 工具
    { icon: User, label: '关于', href: '/about' }, // 关于
  ];

  /**
   * 渲染函数 - 返回导航栏的主要JSX结构
   * 包含Logo、桌面端导航链接、移动端菜单按钮等
   */
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'backdrop-blur-xl bg-slate-900/20 border border-cyan-400/10 py-2 shadow-xl shadow-cyan-500/10 rounded-full max-w-4xl' // 滚动后的样式 - 更透明
          : 'backdrop-blur-lg bg-slate-900/70 border border-cyan-400/30 py-3 shadow-xl shadow-cyan-500/20 rounded-full max-w-5xl' // 初始样式 - 更不透明
      }`}
    >
      <div className="mx-auto px-8 flex items-center justify-between w-full">
        {/* Logo区域 - 包含旋转图标和网站名称 */}
        <Link href="/">
          <motion.div 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              {/* Logo背景光晕 - 持续旋转的渐变圆形 */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 rounded-full blur-md opacity-60 group-hover:opacity-80 transition-opacity"
              />
              {/* Logo容器 - 包含星形图标 */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 15 }}
                className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-2 rounded-full border border-cyan-400/30 shadow-lg shadow-cyan-500/20"
              >
                {/* 星形图标 - 持续旋转 */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                >
                  <Star className="w-6 h-6 text-cyan-300 group-hover:text-cyan-200 transition-colors" />
                </motion.div>
              </motion.div>
            </div>
            {/* 网站名称 - 渐变文字效果 */}
            <span className="text-xl font-black bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent group-hover:from-cyan-200 group-hover:via-blue-200 group-hover:to-purple-200 transition-all duration-300">
              ErGou
            </span>
          </motion.div>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item, index) => (
            <motion.div key={item.href} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Link href={item.href}>
                <motion.div 
                  whileHover={{ scale: 1.05, y: -1 }} 
                  className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white transition-all duration-300 group relative rounded-full"
                >
                  <item.icon className="w-4 h-4 group-hover:text-cyan-300 transition-colors group-hover:scale-110" />
                  <span className="font-medium text-sm">{item.label}</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ scale: 0.8 }}
                    whileHover={{ scale: 1 }}
                  />
                  <motion.div
                    className="absolute bottom-0 left-1/2 right-1/2 h-0.5 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 rounded-full"
                    initial={{ scaleX: 0, left: '50%', right: '50%' }}
                    whileHover={{ scaleX: 1, left: '30%', right: '30%' }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </Link>
            </motion.div>
          ))}
          
          {/* 搜索按钮 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white transition-all duration-300 group relative rounded-full"
          >
            <Search className="w-4 h-4 group-hover:text-cyan-300 transition-colors" />
            <span className="font-medium text-sm hidden lg:inline">搜索</span>
            <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-slate-800/50 text-gray-500 rounded border border-slate-700">
              ⌘K
            </kbd>
          </motion.button>
          
          {/* 通知铃铛 */}
          <NotificationBell />
          
          {/* 用户菜单 */}
          <UserMenu />
        </div>

        {/* 移动端：汉堡菜单 */}
        <motion.button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="md:hidden bg-slate-800/50 backdrop-blur-sm p-2 rounded-full border border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-300 shadow-lg shadow-cyan-500/20 ml-2"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-cyan-300" /> : <Menu className="w-5 h-5 text-cyan-300" />}
        </motion.button>
      </div>

      {/* 背景遮罩 */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* 移动端菜单 */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ 
            scale: 0.8, 
            opacity: 0, 
            y: -20,
            rotateX: 10
          }}
          animate={{ 
            scale: 1, 
            opacity: 1, 
            y: 0,
            rotateX: 0
          }}
          exit={{ 
            scale: 0.8, 
            opacity: 0, 
            y: -20,
            rotateX: 10
          }}
          transition={{ 
            type: 'spring', 
            stiffness: 400, 
            damping: 25,
            mass: 0.8
          }}
          className="md:hidden fixed top-20 left-1/2 transform -translate-x-1/2 w-[calc(100%-1rem)] max-w-md z-50"
        >
          <motion.div 
            className="bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-400/40 rounded-3xl p-6 shadow-2xl shadow-cyan-500/40"
            style={{
              boxShadow: '0 0 40px rgba(6, 182, 212, 0.15), 0 20px 60px rgba(0, 0, 0, 0.3)'
            }}
          >
            {/* 装饰性顶部线条 */}
            <motion.div 
              className="h-1 w-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto mb-4"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            />
            
            {/* 用户信息区域 - 重新设计为垂直布局 */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-4"
            >
              {/* 第一行：个人信息卡片 */}
              <div className="mb-3">
                <UserMenu isMobile={true} onMenuClose={() => setIsMobileMenuOpen(false)} />
              </div>

              {/* 第二行：功能按钮区域 - 按照指定布局 */}
              <div className="space-y-2">
                {/* 第一行：搜索和通知（所有用户显示） */}
                <div className="grid grid-cols-2 gap-2">
                  {/* 搜索按钮 */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setIsSearchOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex flex-col items-center gap-1 p-2 text-gray-300 hover:text-white transition-all duration-300 rounded-xl hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 group border border-cyan-400/20"
                  >
                    <Search className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-medium">搜索</span>
                  </motion.button>
                  
                  {/* 通知铃铛 */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      // 移动端直接跳转到通知页面，保持与其他按钮一致的简单逻辑
                      window.location.href = '/notifications';
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex flex-col items-center gap-1 p-2 text-gray-300 hover:text-white transition-all duration-300 rounded-xl hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 group border border-cyan-400/20 relative"
                  >
                    <Bell className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-medium">通知</span>
                    {/* 未读消息提示 - 简化版本 */}
                    <NotificationBadge count={unreadCount} />
                  </motion.button>
                </div>
                
                {/* 第二行：后台/设置和设置/退出（仅登录用户显示） */}
                {userRole && (
                  <div className="grid grid-cols-2 gap-2">
                    {/* 管理员显示后台按钮，普通用户显示设置按钮 */}
                    {(userRole === 'admin' || userRole === 'editor') ? (
                      <motion.a
                        href="/admin"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex flex-col items-center gap-1 p-2 text-gray-300 hover:text-white transition-all duration-300 rounded-xl hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 group border border-cyan-400/20"
                      >
                        <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-medium">后台</span>
                      </motion.a>
                    ) : (
                      <motion.a
                        href="/profile"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex flex-col items-center gap-1 p-2 text-gray-300 hover:text-white transition-all duration-300 rounded-xl hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 group border border-cyan-400/20"
                      >
                        <Settings className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-medium">设置</span>
                      </motion.a>
                    )}
                    
                    {/* 管理员显示设置按钮，普通用户显示退出按钮 */}
                    {userRole === 'admin' || userRole === 'editor' ? (
                      <motion.a
                        href="/profile"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex flex-col items-center gap-1 p-2 text-gray-300 hover:text-white transition-all duration-300 rounded-xl hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 group border border-cyan-400/20"
                      >
                        <Settings className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-medium">设置</span>
                      </motion.a>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          // 普通用户直接显示退出按钮
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex flex-col items-center gap-1 p-2 text-red-400 hover:text-red-300 transition-all duration-300 rounded-xl hover:bg-red-500/10 border border-red-400/20"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-xs font-medium">退出</span>
                      </motion.button>
                    )}
                  </div>
                )}
                
                {/* 第三行：退出按钮（仅管理员和编辑显示）*/}
                {(userRole === 'admin' || userRole === 'editor') && (
                  <div className="grid grid-cols-1 gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        try {
                          await signOut();
                          setUserRole(''); // 清空角色状态
                          showToast('已退出登录', 'success');
                        } catch (error) {
                          console.error('退出登录失败:', error);
                          showToast('退出登录失败', 'error');
                        }
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex flex-col items-center gap-1 p-2 text-red-400 hover:text-red-300 transition-all duration-300 rounded-xl hover:bg-red-500/10 border border-red-400/20 mx-auto w-1/2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-xs font-medium">退出</span>
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* 分隔线 */}
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent mb-3" />

            {/* 导航链接区域 - 重新设计 */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-3"
            >
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-300 group text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 border border-transparent hover:border-cyan-400/20"
                    >
                      <item.icon className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-xs font-medium group-hover:scale-105 transition-transform duration-300">{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* 全局搜索模态框 */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </motion.nav>
  );
}

// 导出公告横幅组件供布局使用
export { AnnouncementBanner };

/**
 * 通知徽章组件 - 显示未读消息数量
 */
function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null;
  
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium"
    >
      {count > 9 ? '9+' : count}
    </motion.span>
  );
}
