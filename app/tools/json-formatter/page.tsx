'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  FileText,
  Minimize2,
  Maximize2,
  Trash2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ToolAuthGuard from '@/components/ToolAuthGuard';
import { useToolAuth } from '@/hooks/useToolAuth';

export default function JsonFormatterPage() {
  const { isLoggedIn, canUse, remainingUses, limit, incrementUsage, loading: authLoading } = useToolAuth('json-formatter');
  
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [indentSize, setIndentSize] = useState(2);

  // 格式化 JSON
  const formatJson = () => {
    if (!input.trim() || !canUse) return;
    
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indentSize));
      setError('');
      incrementUsage();
    } catch (e) {
      setError(`JSON 解析错误: ${(e as Error).message}`);
      setOutput('');
    }
  };

  // 压缩 JSON
  const minifyJson = () => {
    if (!input.trim() || !canUse) return;
    
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError('');
      incrementUsage();
    } catch (e) {
      setError(`JSON 解析错误: ${(e as Error).message}`);
      setOutput('');
    }
  };

  // 验证 JSON
  const validateJson = () => {
    if (!input.trim()) return;
    
    try {
      JSON.parse(input);
      setError('');
      setOutput('✓ JSON 格式正确');
    } catch (e) {
      setError(`JSON 格式错误: ${(e as Error).message}`);
      setOutput('');
    }
  };

  // 复制输出
  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 清空
  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  // 示例 JSON
  const loadExample = () => {
    const example = {
      name: "张三",
      age: 28,
      email: "zhangsan@example.com",
      skills: ["JavaScript", "TypeScript", "React", "Node.js"],
      address: {
        city: "北京",
        district: "海淀区",
        street: "中关村大街1号"
      },
      isActive: true
    };
    setInput(JSON.stringify(example));
    setOutput('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navigation />
      
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
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
            <h1 className="text-3xl font-bold text-white mb-2">JSON 格式化工具</h1>
            <p className="text-gray-400">格式化、压缩、校验 JSON 数据</p>
          </motion.div>

          {/* 登录限制提示 */}
          <ToolAuthGuard
            isLoggedIn={isLoggedIn}
            canUse={canUse}
            remainingUses={remainingUses}
            limit={limit}
            toolName="JSON格式化"
          />

          {/* 操作按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-3 mb-6"
          >
            <button
              onClick={formatJson}
              disabled={!input.trim() || authLoading || !canUse}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Maximize2 className="w-4 h-4" />
              <span>格式化</span>
            </button>
            <button
              onClick={minifyJson}
              disabled={!input.trim() || authLoading || !canUse}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 border border-slate-700/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minimize2 className="w-4 h-4" />
              <span>压缩</span>
            </button>
            <button
              onClick={validateJson}
              disabled={!input.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 border border-slate-700/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" />
              <span>验证</span>
            </button>
            <button
              onClick={loadExample}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 border border-slate-700/50 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>示例</span>
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 border border-slate-700/50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>清空</span>
            </button>
            
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-gray-400 text-sm">缩进:</span>
              <select
                value={indentSize}
                onChange={(e) => setIndentSize(Number(e.target.value))}
                className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50"
              >
                <option value={2}>2 空格</option>
                <option value={4}>4 空格</option>
                <option value={1}>Tab</option>
              </select>
            </div>
          </motion.div>

          {/* 错误提示 */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </motion.div>
          )}

          {/* 编辑器区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 输入 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                <span className="text-sm font-medium text-gray-300">输入</span>
                <span className="text-xs text-gray-500">{input.length} 字符</span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="在此粘贴 JSON 数据..."
                className="w-full h-96 bg-transparent px-4 py-3 text-white font-mono text-sm placeholder-gray-500 focus:outline-none resize-none"
                spellCheck={false}
              />
            </motion.div>

            {/* 输出 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                <span className="text-sm font-medium text-gray-300">输出</span>
                <button
                  onClick={copyOutput}
                  disabled={!output}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? '已复制' : '复制'}</span>
                </button>
              </div>
              <pre className="w-full h-96 px-4 py-3 text-green-400 font-mono text-sm overflow-auto">
                {output || <span className="text-gray-500">格式化结果将显示在这里...</span>}
              </pre>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
