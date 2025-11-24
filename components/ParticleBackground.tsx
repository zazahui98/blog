/**
 * 粒子背景组件 - 使用Canvas API创建动态粒子效果
 * 包含粒子动画、连接线效果，用于增强页面视觉体验
 */

'use client';

import { useEffect, useRef } from 'react';

export default function ParticleBackground() {
  // Canvas引用 - 用于获取canvas元素
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // 获取Canvas上下文 - 设置画布尺寸和获取2D渲染上下文
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 粒子数组 - 存储所有粒子的位置、速度和大小信息
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
    }> = [];

    // 创建粒子 - 生成50个随机位置和速度的粒子
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
      });
    }

    // 动画函数 - 清除画布并重新绘制所有粒子和连接线
    function animate() {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, i) => {
        // 更新粒子位置 - 根据速度移动粒子
        particle.x += particle.vx;
        particle.y += particle.vy;

        // 边界检测 - 粒子碰到边界时反弹
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // 绘制粒子 - 青色半透明圆点
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.5)'; // Cyan-500
        ctx.fill();

        // 绘制连接线 - 连接距离小于150像素的粒子
        particles.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            // 连接线透明度根据距离动态变化
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.2 * (1 - distance / 150)})`; // Blue-500
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    }

    animate();

    // 窗口大小调整处理 - 重新设置画布尺寸
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // 清理函数 - 移除事件监听器
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    // Canvas画布 - 固定定位，不响应鼠标事件，半透明效果
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-30"
    />
  );
}
