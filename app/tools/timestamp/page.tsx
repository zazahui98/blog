'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Clock,
  RefreshCw,
  ArrowRightLeft
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function TimestampPage() {
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [inputTimestamp, setInputTimestamp] = useState('');
  const [inputDatetime, setInputDatetime] = useState('');
  const [timestampResult, setTimestampResult] = useState('');
  const [datetimeResult, setDatetimeResult] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [unit, setUnit] = useState<'s' | 'ms'>('s');

  // 实时更新当前时间戳
  useEffect(() => {
    const updateTimestamp = () => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000));
    };
    updateTimestamp();
    const interval = setInterval(updateTimestamp, 1000);
    return () => clearInterval(interval);
  }, []);

  // 时间戳转日期时间
  const timestampToDatetime = () => {
    if (!inputTimestamp) return;
    
    try {
      let ts = parseInt(inputTimestamp);
      // 如果是秒级时间戳，转换为毫秒
      if (ts < 10000000000) {
        ts *= 1000;
      }
      
      const date = new Date(ts);
      if (isNaN(date.getTime())) {
        setDatetimeResult('无效的时间戳');
        return;
      }
      
      const formats = [
        { label: '本地时间', value: date.toLocaleString('zh-CN') },
        { label: 'ISO 8601', value: date.toISOString() },
        { label: 'UTC 时间', value: date.toUTCString() },
        { label: '年-月-日', value: date.toLocaleDateString('zh-CN') },
        { label: '时:分:秒', value: date.toLocaleTimeString('zh-CN') },
      ];
      
      setDatetimeResult(JSON.stringify(formats, null, 2));
    } catch {
      setDatetimeResult('转换失败');
    }
  };

  // 日期时间转时间戳
  const datetimeToTimestamp = () => {
    if (!inputDatetime) return;
    
    try {
      const date = new Date(inputDatetime);
      if (isNaN(date.getTime())) {
        setTimestampResult('无效的日期时间');
        return;
      }
      
      const seconds = Math.floor(date.getTime() / 1000);
      const milliseconds = date.getTime();
      
      setTimestampResult(`秒级: ${seconds}\n毫秒级: ${milliseconds}`);
    } catch {
      setTimestampResult('转换失败');
    }
  };

  // 复制
  const copyText = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // 获取当前时间的各种格式
  const getCurrentFormats = () => {
    const now = new Date();
    return [
      { label: '秒级时间戳', value: Math.floor(now.getTime() / 1000).toString() },
      { label: '毫秒级时间戳', value: now.getTime().toString() },
      { label: '本地时间', value: now.toLocaleString('zh-CN') },
      { label: 'ISO 8601', value: now.toISOString() },
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navigation />
      
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* 返回按钮和标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link href="/tools" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>返回工具列表</span>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">时间戳转换</h1>
            <p className="text-gray-400">时间戳与日期时间格式互转</p>
          </motion.div>

          {/* 当前时间 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">当前时间</h2>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <RefreshCw className="w-4 h-4 text-gray-500" />
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {getCurrentFormats().map((item) => (
                <div key={item.label} className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-gray-400 text-xs mb-1">{item.label}</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-white font-mono text-sm truncate">{item.value}</p>
                    <button
                      onClick={() => copyText(item.value, item.label)}
                      className="text-gray-400 hover:text-cyan-400 transition-colors flex-shrink-0"
                    >
                      {copied === item.label ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 时间戳转日期 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>时间戳</span>
                <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                <span>日期时间</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">输入时间戳</label>
                  <input
                    type="text"
                    value={inputTimestamp}
                    onChange={(e) => setInputTimestamp(e.target.value)}
                    placeholder="例如: 1700000000"
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white font-mono placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>
                
                <button
                  onClick={timestampToDatetime}
                  disabled={!inputTimestamp}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  转换
                </button>
                
                {datetimeResult && (
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">转换结果</span>
                      <button
                        onClick={() => copyText(datetimeResult, 'datetime')}
                        className="text-cyan-400 hover:text-cyan-300 text-sm"
                      >
                        {copied === 'datetime' ? '已复制' : '复制'}
                      </button>
                    </div>
                    <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">{datetimeResult}</pre>
                  </div>
                )}
              </div>
            </motion.div>

            {/* 日期转时间戳 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>日期时间</span>
                <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                <span>时间戳</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">输入日期时间</label>
                  <input
                    type="datetime-local"
                    value={inputDatetime}
                    onChange={(e) => setInputDatetime(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>
                
                <button
                  onClick={datetimeToTimestamp}
                  disabled={!inputDatetime}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  转换
                </button>
                
                {timestampResult && (
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">转换结果</span>
                      <button
                        onClick={() => copyText(timestampResult, 'timestamp')}
                        className="text-cyan-400 hover:text-cyan-300 text-sm"
                      >
                        {copied === 'timestamp' ? '已复制' : '复制'}
                      </button>
                    </div>
                    <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">{timestampResult}</pre>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
