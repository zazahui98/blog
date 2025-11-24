/**
 * 动态关于页面 - 从数据库读取内容
 * 替换原有的静态页面
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { Code2, Rocket, Zap, Heart, Award, Users } from 'lucide-react';
import { getAboutSettings, Skill } from '@/lib/supabase-helpers';

export default function About() {
  const [loading, setLoading] = useState(true);
  const [aboutData, setAboutData] = useState<any>(null);

  useEffect(() => {
    loadAboutData();
  }, []);

  const loadAboutData = async () => {
    try {
      const { data, error } = await getAboutSettings();
      
      if (error) throw error;
      setAboutData(data);
    } catch (error) {
      console.error('加载关于我数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 默认数据（如果数据库没有数据）
  const defaultSkills = [
    { name: 'React/Next.js', level: 95, color: 'cyan' },
    { name: 'TypeScript', level: 92, color: 'blue' },
    { name: 'Node.js', level: 88, color: 'green' },
    { name: 'System Design', level: 90, color: 'purple' },
    { name: 'DevOps', level: 85, color: 'orange' },
    { name: 'UI/UX', level: 87, color: 'red' },
  ];

  const defaultStats = [
    { icon: 'Code2', value: '50K+', label: '代码行数' },
    { icon: 'Rocket', value: '30+', label: '项目经验' },
    { icon: 'Award', value: '15+', label: '技术奖项' },
    { icon: 'Users', value: '10K+', label: '社区贡献' },
  ];

  const skills = aboutData?.skills || defaultSkills;
  const stats = aboutData?.stats || defaultStats;
  const intro = aboutData?.intro || '我是一名充满激情的全栈开发者，致力于创造优雅、高效、令人惊叹的数字体验。代码不仅是工具，更是一种艺术表达。';

  const getIcon = (iconName: string) => {
    const icons: any = { Code2, Rocket, Award, Users };
    return icons[iconName] || Code2;
  };

  // 获取技能进度条颜色类名
  const getSkillColorClass = (color?: string) => {
    const colorMap: { [key: string]: string } = {
      cyan: 'from-cyan-500 to-blue-500',
      blue: 'from-blue-500 to-indigo-500',
      green: 'from-green-500 to-emerald-500',
      purple: 'from-purple-500 to-pink-500',
      orange: 'from-orange-500 to-red-500',
      red: 'from-red-500 to-rose-500',
      yellow: 'from-yellow-500 to-orange-500',
      pink: 'from-pink-500 to-rose-500',
      indigo: 'from-indigo-500 to-purple-500',
    };
    return colorMap[color || 'cyan'] || 'from-cyan-500 to-blue-500';
  };

  // 获取技能文字颜色类名
  const getSkillTextColorClass = (color?: string) => {
    const colorMap: { [key: string]: string } = {
      cyan: 'text-cyan-400',
      blue: 'text-blue-400',
      green: 'text-green-400',
      purple: 'text-purple-400',
      orange: 'text-orange-400',
      red: 'text-red-400',
      yellow: 'text-yellow-400',
      pink: 'text-pink-400',
      indigo: 'text-indigo-400',
    };
    return colorMap[color || 'cyan'] || 'text-cyan-400';
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">加载中...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative">
      <ParticleBackground />
      <Navigation />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* 个人简介 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 p-1"
            >
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <Code2 className="w-16 h-16 text-cyan-400" />
              </div>
            </motion.div>

            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              关于我
            </h1>

            <p className="text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {intro}
            </p>
          </motion.div>

          {/* 统计数据 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
          >
            {stats.map((stat: any, index: number) => {
              const Icon = getIcon(stat.icon);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="text-center p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50"
                >
                  <Icon className="w-8 h-8 mx-auto mb-4 text-cyan-400" />
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* 技能专长 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-20"
          >
            <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              技能专长
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {skills.map((skill: any, index: number) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-semibold text-white">{skill.name}</span>
                    <span className={`font-bold ${getSkillTextColorClass(skill.color)}`}>{skill.level}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ duration: 1, delay: 0.5 + 0.1 * index }}
                      className={`bg-gradient-to-r ${getSkillColorClass(skill.color)} h-3 rounded-full`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 理念展示 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              我的理念
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  性能至上
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  每一行代码都经过精心优化，确保最佳的用户体验和系统性能。
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  用户体验
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  以用户为中心的设计理念，创造直观、愉悦的交互体验。
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center">
                  <Code2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  持续学习
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  技术日新月异，保持好奇心和学习热情，不断探索新技术。
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
