'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Database, 
  QrCode, 
  FileText, 
  Calculator,
  ArrowRight,
  Sparkles,
  Clock,
  Binary,
  Palette,
  Key,
  Heart,
  Star
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ToolFavoriteButton from '@/components/ToolFavoriteButton';
import { useUserFavoriteTools } from '@/hooks/useToolFavorite';
import { getCurrentUser } from '@/lib/auth';

/**
 * 工具项配置
 */
const tools = [
  {
    id: 'data-generator',
    name: '数据生成器',
    description: '批量生成邮箱、手机号、身份证、姓名、地址等测试数据',
    icon: Database,
    href: '/tools/data-generator',
    color: 'from-cyan-500 to-blue-500',
    available: true,
  },
  {
    id: 'qrcode',
    name: '二维码工具',
    description: '生成和解析二维码，支持自定义样式和Logo',
    icon: QrCode,
    href: '/tools/qrcode',
    color: 'from-purple-500 to-pink-500',
    available: true,
  },
  {
    id: 'json-formatter',
    name: 'JSON格式化',
    description: 'JSON数据格式化、压缩、校验、转换工具',
    icon: FileText,
    href: '/tools/json-formatter',
    color: 'from-green-500 to-emerald-500',
    available: true,
  },
  {
    id: 'timestamp',
    name: '时间戳转换',
    description: '时间戳与日期时间互转，支持多种格式',
    icon: Clock,
    href: '/tools/timestamp',
    color: 'from-orange-500 to-amber-500',
    available: true,
  },
  {
    id: 'base64',
    name: 'Base64编解码',
    description: '文本和图片的Base64编码解码工具',
    icon: Binary,
    href: '/tools/base64',
    color: 'from-indigo-500 to-violet-500',
    available: true,
  },
  {
    id: 'color-picker',
    name: '颜色转换器',
    description: 'HEX、RGB、HSL颜色格式互转，调色板',
    icon: Palette,
    href: '/tools/color-picker',
    color: 'from-pink-500 to-rose-500',
    available: true,
  },
  {
    id: 'password-generator',
    name: '密码生成器',
    description: '生成安全随机密码，支持自定义规则',
    icon: Key,
    href: '/tools/password-generator',
    color: 'from-red-500 to-orange-500',
    available: true,
  },
  {
    id: 'calculator',
    name: '程序员计算器',
    description: '进制转换、位运算、表达式计算',
    icon: Calculator,
    href: '/tools/calculator',
    color: 'from-teal-500 to-cyan-500',
    available: true,
  },
];

export default function ToolsPage() {
  const { favorites, isLoading: favoritesLoading } = useUserFavoriteTools();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, []);

  // 将收藏的工具排在前面
  const sortedTools = useMemo(() => {
    if (!favorites.length) return tools;
    
    const favoriteTools = tools.filter(tool => favorites.includes(tool.id));
    const otherTools = tools.filter(tool => !favorites.includes(tool.id));
    
    return [...favoriteTools, ...otherTools];
  }, [favorites]);

  const favoriteCount = favorites.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navigation />
      
      {/* 主内容区域 */}
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-300 text-sm font-medium">实用工具集</span>
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                在线工具箱
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              精选开发者常用工具，提升工作效率
            </p>

            {/* 收藏统计 */}
            {isLoggedIn && favoriteCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full"
              >
                <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                <span className="text-red-300 text-sm">
                  已收藏 {favoriteCount} 个工具
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* 收藏工具区域 */}
          {isLoggedIn && favoriteCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <h2 className="text-lg font-semibold text-white">我的收藏</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedTools.slice(0, favoriteCount).map((tool, index) => (
                  <motion.div
                    key={`fav-${tool.id}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={tool.href}>
                      <ToolCard tool={tool} isFavorited showFavoriteButton={isLoggedIn} />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 分隔线 */}
          {isLoggedIn && favoriteCount > 0 && (
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
              <span className="text-gray-500 text-sm">全部工具</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            </div>
          )}

          {/* 工具卡片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(isLoggedIn && favoriteCount > 0 ? sortedTools.slice(favoriteCount) : sortedTools).map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {tool.available ? (
                  <Link href={tool.href}>
                    <ToolCard 
                      tool={tool} 
                      isFavorited={favorites.includes(tool.id)}
                      showFavoriteButton={isLoggedIn}
                    />
                  </Link>
                ) : (
                  <ToolCard tool={tool} disabled />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/**
 * 工具卡片组件
 */
function ToolCard({ 
  tool, 
  disabled = false,
  isFavorited = false,
  showFavoriteButton = false,
}: { 
  tool: typeof tools[0]; 
  disabled?: boolean;
  isFavorited?: boolean;
  showFavoriteButton?: boolean;
}) {
  const Icon = tool.icon;
  
  return (
    <motion.div
      whileHover={disabled ? {} : { scale: 1.02, y: -4 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`relative group p-6 rounded-2xl border transition-all duration-300 ${
        disabled
          ? 'bg-slate-900/30 border-slate-700/30 cursor-not-allowed opacity-60'
          : isFavorited
            ? 'bg-slate-900/50 border-red-500/30 hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/10 cursor-pointer'
            : 'bg-slate-900/50 border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10 cursor-pointer'
      }`}
    >
      {/* 背景渐变 */}
      {!disabled && (
        <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
      )}

      {/* 收藏标记 */}
      {isFavorited && (
        <div className="absolute top-3 right-3">
          <div className="p-1.5 bg-red-500/20 rounded-lg">
            <Heart className="w-4 h-4 text-red-400 fill-red-400" />
          </div>
        </div>
      )}
      
      <div className="relative flex items-start gap-4">
        {/* 图标 */}
        <div className={`p-3 rounded-xl bg-gradient-to-br ${tool.color} ${disabled ? 'opacity-50' : ''}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        {/* 内容 */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`text-lg font-semibold ${disabled ? 'text-gray-500' : 'text-white'}`}>
              {tool.name}
            </h3>
            {disabled && (
              <span className="px-2 py-0.5 text-xs bg-slate-700/50 text-slate-400 rounded-full">
                即将上线
              </span>
            )}
          </div>
          <p className={`text-sm ${disabled ? 'text-gray-600' : 'text-gray-400'}`}>
            {tool.description}
          </p>
        </div>
        
        {/* 收藏按钮或箭头 */}
        <div className="self-center flex items-center gap-2">
          {showFavoriteButton && !disabled && (
            <ToolFavoriteButton toolId={tool.id} size="sm" />
          )}
          {!disabled && !isFavorited && (
            <motion.div
              initial={{ x: 0, opacity: 0.5 }}
              whileHover={{ x: 4, opacity: 1 }}
            >
              <ArrowRight className="w-5 h-5 text-cyan-400" />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
