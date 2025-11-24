'use client';

import { motion } from 'framer-motion';
import { Settings, Database, Mail, Shield, Bell } from 'lucide-react';

export default function SystemSettings() {
  return (
    <div>
      {/* 头部 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">系统设置</h1>
        <p className="text-gray-400">配置系统参数和选项</p>
      </div>

      {/* 设置卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 数据库设置 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-cyan-400/20 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-cyan-500/10 rounded-xl">
              <Database className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold text-white">数据库</h2>
          </div>
          <p className="text-gray-400 mb-4">
            数据库连接和备份设置
          </p>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg transition-colors">
            配置
          </button>
        </motion.div>

        {/* 邮件设置 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 border border-cyan-400/20 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Mail className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">邮件</h2>
          </div>
          <p className="text-gray-400 mb-4">
            邮件服务器和模板配置
          </p>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg transition-colors">
            配置
          </button>
        </motion.div>

        {/* 安全设置 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900 border border-cyan-400/20 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-500/10 rounded-xl">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white">安全</h2>
          </div>
          <p className="text-gray-400 mb-4">
            密码策略和访问控制
          </p>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg transition-colors">
            配置
          </button>
        </motion.div>

        {/* 通知设置 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900 border border-cyan-400/20 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <Bell className="w-6 h-6 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white">通知</h2>
          </div>
          <p className="text-gray-400 mb-4">
            系统通知和提醒设置
          </p>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg transition-colors">
            配置
          </button>
        </motion.div>
      </div>

      {/* 提示信息 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 bg-cyan-500/10 border border-cyan-400/30 rounded-2xl p-6"
      >
        <div className="flex items-start gap-3">
          <Settings className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-white font-semibold mb-2">系统设置功能</h3>
            <p className="text-gray-400 text-sm">
              这是系统设置页面的占位符。您可以根据需要添加具体的配置选项，
              如网站信息、SEO 设置、第三方集成等。
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
