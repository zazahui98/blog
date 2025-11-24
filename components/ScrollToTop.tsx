/**
 * 回到顶部组件 - 当页面滚动超过300像素时显示
 * 点击按钮平滑滚动到页面顶部，带渐变背景和动画效果
 */

'use client';

import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ScrollToTop() {
    // 可见性状态 - 控制按钮显示/隐藏
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // 滚动监听 - 当页面滚动超过300像素时显示按钮
        const toggleVisibility = () => setIsVisible(window.pageYOffset > 300);
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    // 回到顶部函数 - 平滑滚动到页面顶部
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            {isVisible && (
                // 回到顶部按钮 - 固定在右下角，带玻璃态效果
                <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-50 glass-dark p-4 rounded-full border border-cyan-500/30 hover:border-cyan-500/60 transition-all group shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    {/* 箭头图标容器 */}
                    <div className="relative">
                        {/* 向上箭头图标 - 悬停时颜色变化 */}
                        <ArrowUp className="w-6 h-6 text-cyan-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                    {/* 悬停背景光效 - 渐变模糊效果 */}
                    <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity"
                    />
                </motion.button>
            )}
        </>
    );
}
