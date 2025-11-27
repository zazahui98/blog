'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Github, Twitter, Mail, Heart, ArrowUp, Sparkles } from 'lucide-react';

const socialLinks = [
  { icon: Github, href: 'https://github.com', label: 'GitHub', color: 'hover:bg-cyan-600' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter', color: 'hover:bg-blue-600' },
  { icon: Mail, href: 'mailto:contact@devartisan.com', label: 'Email', color: 'hover:bg-blue-600' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [uptime, setUptime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const startTime = new Date('2025-11-22T10:10:00').getTime();
    
    const updateUptime = () => {
      const now = new Date().getTime();
      const difference = now - startTime;
      
      if (difference <= 0) {
        setUptime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setUptime({ days, hours, minutes, seconds });
    };
    
    // 立即更新一次
    updateUptime();
    
    const timer = setInterval(updateUptime, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="relative glass-dark border-t border-cyan-500/20 pt-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* 品牌区 */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg blur-lg opacity-50"
                />
                <div className="relative z-10 bg-gradient-to-br from-cyan-600 to-blue-600 p-2 rounded-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                ErGou Blog
              </h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              ❗每一行代码都在闪闪发光❗
            </p>
          </div>

          {/* 快速链接 */}
          <div>
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
              快速链接
            </h4>
            <ul className="space-y-2">
              {[ {name: '首页', path: '/'}, {name: '项目', path: '/projects'}, {name: '关于', path: '/about'} ].map((link) => (
                <li key={link.name}>
                  <Link href={link.path} className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 group-hover:bg-cyan-500 transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 资源 */}
          <div>
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
              资源
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/#blog" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 group-hover:bg-blue-500 transition-colors" />
                  博客
                </Link>
              </li>
              <li>
                <Link href="/tools" className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 group-hover:bg-cyan-500 transition-colors" />
                  工具
                </Link>
              </li>
            </ul>
          </div>

          {/* 社交媒体 */}
          <div>
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
              关注我们
            </h4>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className={`glass-dark p-3 rounded-xl border border-cyan-500/20 ${social.color} transition-all flex flex-col items-center gap-2 group`}
                >
                  <social.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                  <span className="text-xs text-gray-500 group-hover:text-white transition-colors">{social.label}</span>
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* 分隔线 */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          className="h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent mb-8"
        />

        {/* 底部版权 */}
        <div className="pb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-2 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <span>© {currentYear} ErGou Blog.</span>
              <span>用</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>制作</span>
            </div>
            <div className="text-center text-gray-400 text-sm">
              本站已运行: <span className="text-cyan-400 font-medium">{uptime.days}</span>天 
              <span className="text-cyan-400 font-medium">{uptime.hours}</span>时 
              <span className="text-cyan-400 font-medium">{uptime.minutes}</span>分 
              <span className="text-cyan-400 font-medium">{uptime.seconds}</span>秒
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 返回顶部 */}
            <motion.button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass-dark px-4 py-2 rounded-full border border-cyan-500/30 hover:border-cyan-500/60 transition-all flex items-center gap-2 group"
            >
              <ArrowUp className="w-4 h-4 text-cyan-400 group-hover:-translate-y-1 transition-transform" />
              <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                返回顶部
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
}
