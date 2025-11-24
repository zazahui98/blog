'use client';

import { motion } from 'framer-motion';
import { Code2, Sparkles } from 'lucide-react';

export default function LoadingAnimation() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="relative">
                {/* 背景光晕 */}
                <motion.div
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-3xl"
                />

                {/* 中心内容 */}
                <div className="relative z-10 flex flex-col items-center gap-6">
                    {/* Logo动画 */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50" />
                        <div className="relative z-10 bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-2xl">
                            <Code2 className="w-12 h-12 text-white" />
                        </div>
                    </motion.div>

                    {/* 文字 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-center"
                    >
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                            DevArtisan
                        </h2>
                        <p className="text-gray-400">Loading...</p>
                    </motion.div>

                    {/* 加载条 */}
                    <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        />
                    </div>

                    {/* 装饰粒子 */}
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute"
                            style={{
                                left: `${Math.cos((i * Math.PI * 2) / 6) * 100 + 50}%`,
                                top: `${Math.sin((i * Math.PI * 2) / 6) * 100 + 50}%`,
                            }}
                            animate={{
                                scale: [0, 1, 0],
                                opacity: [0, 1, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        >
                            <Sparkles className="w-4 h-4 text-purple-400" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
