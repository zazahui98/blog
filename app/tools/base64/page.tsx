'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Binary,
  Upload,
  Download,
  ArrowDown,
  ArrowUp,
  Image as ImageIcon,
  FileText,
  Trash2
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ToolAuthGuard from '@/components/ToolAuthGuard';
import { useToolAuth } from '@/hooks/useToolAuth';

export default function Base64Page() {
  const { isLoggedIn, canUse, remainingUses, limit, incrementUsage, loading: authLoading } = useToolAuth('base64');
  
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 文本编码为 Base64
  const encodeText = () => {
    if (!input.trim() || !canUse) return;
    
    try {
      // 使用 TextEncoder 处理 Unicode 字符
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const base64 = btoa(String.fromCharCode(...data));
      setOutput(base64);
      setError('');
      incrementUsage();
    } catch (e) {
      setError('编码失败: ' + (e as Error).message);
      setOutput('');
    }
  };

  // Base64 解码为文本
  const decodeText = () => {
    if (!input.trim() || !canUse) return;
    
    try {
      const decoded = atob(input.trim());
      // 尝试解码为 UTF-8
      const bytes = new Uint8Array(decoded.length);
      for (let i = 0; i < decoded.length; i++) {
        bytes[i] = decoded.charCodeAt(i);
      }
      const decoder = new TextDecoder();
      setOutput(decoder.decode(bytes));
      setError('');
      incrementUsage();
    } catch (e) {
      setError('解码失败: 请确保输入的是有效的 Base64 字符串');
      setOutput('');
    }
  };

  // 图片转 Base64
  const imageToBase64 = (file: File) => {
    if (!canUse) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setOutput(result);
      setImagePreview(result);
      setError('');
      incrementUsage();
    };
    reader.onerror = () => {
      setError('读取图片失败');
    };
    reader.readAsDataURL(file);
  };

  // Base64 转图片预览
  const base64ToImage = () => {
    if (!input.trim() || !canUse) return;
    
    try {
      let base64 = input.trim();
      // 如果没有 data URL 前缀，添加默认的
      if (!base64.startsWith('data:')) {
        base64 = `data:image/png;base64,${base64}`;
      }
      setImagePreview(base64);
      setOutput('图片预览已生成');
      setError('');
      incrementUsage();
    } catch {
      setError('无效的 Base64 图片数据');
      setImagePreview('');
    }
  };

  // 下载图片
  const downloadImage = () => {
    if (!imagePreview) return;
    
    const link = document.createElement('a');
    link.download = `image_${Date.now()}.png`;
    link.href = imagePreview;
    link.click();
  };

  // 复制
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
    setImagePreview('');
    setError('');
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
            <h1 className="text-3xl font-bold text-white mb-2">Base64 编解码</h1>
            <p className="text-gray-400">文本和图片的 Base64 编码解码工具</p>
          </motion.div>

          {/* 登录限制提示 */}
          <ToolAuthGuard
            isLoggedIn={isLoggedIn}
            canUse={canUse}
            remainingUses={remainingUses}
            limit={limit}
            toolName="Base64编解码"
          />

          {/* Tab 切换 */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setActiveTab('text'); clearAll(); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'text'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'bg-slate-800/50 text-gray-400 border border-slate-700/50 hover:text-gray-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>文本</span>
            </button>
            <button
              onClick={() => { setActiveTab('image'); clearAll(); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'image'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'bg-slate-800/50 text-gray-400 border border-slate-700/50 hover:text-gray-300'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>图片</span>
            </button>
          </div>

          {/* 错误提示 */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6"
            >
              <p className="text-red-200 text-sm">{error}</p>
            </motion.div>
          )}

          {activeTab === 'text' ? (
            <div className="space-y-6">
              {/* 输入区域 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                  <span className="text-sm font-medium text-gray-300">输入</span>
                  <button
                    onClick={clearAll}
                    className="text-gray-400 hover:text-gray-300 text-sm flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    清空
                  </button>
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="输入要编码的文本，或要解码的 Base64 字符串..."
                  rows={6}
                  className="w-full bg-transparent px-4 py-3 text-white font-mono text-sm placeholder-gray-500 focus:outline-none resize-none"
                />
              </motion.div>

              {/* 操作按钮 */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={encodeText}
                  disabled={!input.trim() || authLoading || !canUse}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowDown className="w-4 h-4" />
                  <span>编码</span>
                </button>
                <button
                  onClick={decodeText}
                  disabled={!input.trim() || authLoading || !canUse}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 border border-slate-700/50 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowUp className="w-4 h-4" />
                  <span>解码</span>
                </button>
              </div>

              {/* 输出区域 */}
              {output && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                    <span className="text-sm font-medium text-gray-300">输出</span>
                    <button
                      onClick={copyOutput}
                      className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? '已复制' : '复制'}
                    </button>
                  </div>
                  <pre className="px-4 py-3 text-green-400 font-mono text-sm whitespace-pre-wrap break-all max-h-64 overflow-auto">
                    {output}
                  </pre>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* 图片上传 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">图片转 Base64</h3>
                
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700/50 hover:border-cyan-500/50 rounded-xl p-8 text-center cursor-pointer transition-colors"
                >
                  <Upload className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 mb-1">点击或拖拽上传图片</p>
                  <p className="text-gray-500 text-sm">支持 PNG、JPG、GIF、WebP 格式</p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && imageToBase64(e.target.files[0])}
                  className="hidden"
                />
              </motion.div>

              {/* Base64 转图片 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Base64 转图片</h3>
                
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="粘贴 Base64 编码的图片数据..."
                  rows={4}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none mb-4"
                />
                
                <button
                  onClick={base64ToImage}
                  disabled={!input.trim() || authLoading || !canUse}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  预览图片
                </button>
              </motion.div>

              {/* 结果显示 */}
              {(output || imagePreview) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">结果</h3>
                    <div className="flex gap-2">
                      {output && output !== '图片预览已生成' && (
                        <button
                          onClick={copyOutput}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 text-sm rounded-lg transition-colors"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copied ? '已复制' : '复制'}
                        </button>
                      )}
                      {imagePreview && (
                        <button
                          onClick={downloadImage}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 text-sm rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          下载
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {imagePreview && (
                    <div className="mb-4 flex justify-center">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-w-full max-h-64 rounded-lg border border-slate-700/50"
                      />
                    </div>
                  )}
                  
                  {output && output !== '图片预览已生成' && (
                    <pre className="text-green-400 font-mono text-xs whitespace-pre-wrap break-all max-h-32 overflow-auto bg-slate-800/50 rounded-lg p-3">
                      {output.length > 500 ? output.slice(0, 500) + '...' : output}
                    </pre>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
