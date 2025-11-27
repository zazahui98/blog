'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * 英雄区域组件 - 网站首页的主要展示区域
 * 包含动态背景、鼠标跟随效果、打字机效果等交互功能
 */
export default function Hero() {
  // 鼠标位置状态 - 用于实现鼠标跟随效果
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // 组件挂载状态 - 确保只在客户端执行某些操作
  const [mounted, setMounted] = useState(false);
  
  // 打字机显示的文本状态
  const [displayText, setDisplayText] = useState('');

  // 副标题文本
  const subtitle = '逐 Bug 而往，循逻辑而上；越过冗余路，终遇满目芳';

  // 粒子效果状态 - 存储背景粒子的位置和动画参数
  const [particles, setParticles] = useState<{ left: string; top: string; duration: number; delay: number }[]>([]);

  /**
   * 组件挂载时的副作用处理
   * 1. 设置挂载状态
   * 2. 添加鼠标移动事件监听
   * 3. 生成背景粒子效果
   */
  useEffect(() => {
    setMounted(true);
    
    // 鼠标移动事件处理函数 - 更新鼠标位置状态
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    // 仅在客户端生成粒子效果 - 避免服务端渲染错误
    const newParticles = [...Array(20)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);

    // 添加事件监听器
    window.addEventListener('mousemove', handleMouseMove);
    
    // 清理函数 - 移除事件监听器
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  /**
   * 打字机效果实现
   * 逐字符显示副标题文本，创建打字机动画效果
   */
  useEffect(() => {
    let index = 0;
    
    // 定时器 - 每100ms显示一个字符
    const timer = setInterval(() => {
      if (index <= subtitle.length) {
        setDisplayText(subtitle.slice(0, index));
        index++;
      } else {
        // 文本显示完成后清除定时器
        clearInterval(timer);
      }
    }, 100);

    // 清理函数 - 清除定时器
    return () => clearInterval(timer);
  }, [subtitle]);

  // 鼠标跟随光晕效果 - 根据鼠标位置计算光晕偏移
  const haloX = useTransform(mouseX, [0, typeof window !== 'undefined' ? window.innerWidth : 1920], [-30, 30]);
  const haloY = useTransform(mouseY, [0, typeof window !== 'undefined' ? window.innerHeight : 1080], [-30, 30]);

  /**
   * 渲染函数 - 返回英雄区域的主要JSX结构
   * 包含多层背景动画、网格背景、鼠标跟随光晕、浮动粒子、主要内容展示和底部波浪装饰
   */
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-40 overflow-hidden">
      {/* 多层背景动画 - 蓝色系渐变圆形 */}
      <div className="absolute inset-0">
        {/* 左上角大圆形 - 青色渐变 */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl"
        />

        {/* 右下角大圆形 - 蓝色渐变 */}
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl"
        />

        {/* 中心中等圆形 - 靛蓝色渐变 */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500/12 rounded-full blur-2xl"
        />
      </div>

      {/* 网格背景 - 创建科技感的网格效果 */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* 鼠标跟随光晕 - 根据鼠标位置移动的光晕效果 */}
      {mounted && (
        <motion.div
          style={{ x: haloX, y: haloY }}
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none"
        />
      )}

      {/* 浮动装饰粒子 - 随机分布的闪烁粒子 */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400/40 rounded-full"
          style={{ left: p.left, top: p.top }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2], scale: [1, 1.5, 1] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}



      {/* 主要内容区域 - 网站标题和副标题 */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* 装饰性旋转圆形 */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8 inline-block"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-xl absolute inset-0"
            />
          </div>
        </motion.div>

        {/* 主标题 - Blog */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-8xl font-black mb-8 relative"
        >
          <motion.span
            className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient inline-block px-2 py-1 leading-tight"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
            style={{ textShadow: '0 0 30px rgba(6, 182, 212, 0.3)' }}
          >
            Blog
          </motion.span>
        </motion.h1>

        {/* 副标题 - 打字机效果 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl lg:text-3xl text-gray-200 mb-12 font-medium tracking-wide min-h-[3rem] flex items-center justify-center"
          whileHover={{ scale: 1.02 }}
        >
          <span className="inline-block relative font-serif italic">
            {/* 逐字符渲染文本，每个字符都有悬停效果 */}
            {displayText.split('').map((char, index) => (
              <motion.span
                key={index}
                className="inline-block bg-gradient-to-r from-gray-200 via-cyan-200 to-gray-200 bg-clip-text text-transparent hover:from-cyan-100 hover:via-white hover:to-cyan-100 transition-all duration-200 cursor-pointer hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                whileHover={{ scale: 1.1, y: -2 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
            {/* 打字机光标效果 */}
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-0.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-400 ml-2 align-middle hover:from-cyan-300 hover:to-blue-300 transition-all duration-300"
            />
          </span>
        </motion.div>

        {/* 装饰性分隔线 */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="w-32 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto"
        />
      </div>



      {/* 底部装饰波浪 - 水平滚动的SVG波浪 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden opacity-30">
        <motion.div
          animate={{ x: ['-100%', '0%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        >
          <svg className="w-[200%] h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z"
              fill="url(#wave-gradient)"
              opacity="0.3"
            />
            <defs>
              <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
