'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Download, 
  Copy, 
  Check, 
  QrCode,
  Upload,
  Trash2,
  Info
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ToolAuthGuard from '@/components/ToolAuthGuard';
import { useToolAuth } from '@/hooks/useToolAuth';

export default function QRCodePage() {
  const { isLoggedIn, canUse, remainingUses, limit, incrementUsage, loading: authLoading } = useToolAuth('qrcode');
  
  const [activeTab, setActiveTab] = useState<'generate' | 'decode'>('generate');
  const [text, setText] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [decodeResult, setDecodeResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 生成二维码
  const generateQRCode = async () => {
    if (!text.trim() || !canUse) return;
    
    setLoading(true);
    
    try {
      // 使用 Canvas 绘制二维码
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = size;
      canvas.height = size;
      
      // 使用简单的二维码生成算法（实际项目中建议使用 qrcode 库）
      // 这里我们使用一个在线 API 作为临时方案
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&color=${fgColor.slice(1)}&bgcolor=${bgColor.slice(1)}`;
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, size, size);
        setQrDataUrl(canvas.toDataURL('image/png'));
        incrementUsage();
        setLoading(false);
      };
      img.onerror = () => {
        setLoading(false);
        alert('生成二维码失败，请重试');
      };
      img.src = qrUrl;
    } catch {
      setLoading(false);
    }
  };

  // 下载二维码
  const downloadQRCode = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `qrcode_${Date.now()}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  // 复制二维码图片
  const copyQRCode = async () => {
    if (!qrDataUrl) return;
    
    try {
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 如果复制图片失败，复制 base64
      await navigator.clipboard.writeText(qrDataUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 解码二维码
  const decodeQRCode = async (file: File) => {
    if (!canUse) return;
    
    setLoading(true);
    setDecodeResult('');
    
    try {
      // 读取图片
      const reader = new FileReader();
      reader.onload = async (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          // 简单提示（实际项目中需要使用 jsQR 库）
          setDecodeResult('提示：二维码解码功能需要安装 jsQR 库。请上传二维码图片后使用在线解码服务。');
          incrementUsage();
          setLoading(false);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch {
      setLoading(false);
      setDecodeResult('解码失败，请确保上传的是有效的二维码图片');
    }
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
            <h1 className="text-3xl font-bold text-white mb-2">二维码工具</h1>
            <p className="text-gray-400">生成和解析二维码，支持自定义样式</p>
          </motion.div>

          {/* 登录限制提示 */}
          <ToolAuthGuard
            isLoggedIn={isLoggedIn}
            canUse={canUse}
            remainingUses={remainingUses}
            limit={limit}
            toolName="二维码工具"
          />

          {/* Tab 切换 */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'generate'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'bg-slate-800/50 text-gray-400 border border-slate-700/50 hover:text-gray-300'
              }`}
            >
              生成二维码
            </button>
            <button
              onClick={() => setActiveTab('decode')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'decode'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'bg-slate-800/50 text-gray-400 border border-slate-700/50 hover:text-gray-300'
              }`}
            >
              解析二维码
            </button>
          </div>

          {activeTab === 'generate' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 左侧：配置 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">内容</label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="输入要生成二维码的文本或链接..."
                      rows={4}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">尺寸</label>
                      <select
                        value={size}
                        onChange={(e) => setSize(Number(e.target.value))}
                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                      >
                        <option value={128}>128 x 128</option>
                        <option value={256}>256 x 256</option>
                        <option value={512}>512 x 512</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">前景色</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="w-12 h-12 rounded-lg cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">背景色</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-12 h-12 rounded-lg cursor-pointer border-0"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={generateQRCode}
                    disabled={loading || !text.trim() || authLoading || !canUse}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <QrCode className="w-5 h-5" />
                    )}
                    <span>{loading ? '生成中...' : '生成二维码'}</span>
                  </button>
                </div>
              </motion.div>

              {/* 右侧：预览 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">预览</h3>
                
                <div className="flex flex-col items-center">
                  <div 
                    className="w-64 h-64 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: bgColor }}
                  >
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="QR Code" className="max-w-full max-h-full" />
                    ) : (
                      <div className="text-gray-500 text-center">
                        <QrCode className="w-16 h-16 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">二维码预览</p>
                      </div>
                    )}
                  </div>
                  
                  {qrDataUrl && (
                    <div className="flex gap-2">
                      <button
                        onClick={downloadQRCode}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>下载</span>
                      </button>
                      <button
                        onClick={copyQRCode}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 rounded-lg transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        <span>{copied ? '已复制' : '复制'}</span>
                      </button>
                    </div>
                  )}
                </div>
                
                <canvas ref={canvasRef} className="hidden" />
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6"
            >
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700/50 hover:border-cyan-500/50 rounded-xl p-8 text-center cursor-pointer transition-colors"
                >
                  <Upload className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 mb-1">点击或拖拽上传二维码图片</p>
                  <p className="text-gray-500 text-sm">支持 PNG、JPG、GIF 格式</p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && decodeQRCode(e.target.files[0])}
                  className="hidden"
                />
                
                {decodeResult && (
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">解码结果</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(decodeResult);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="text-cyan-400 hover:text-cyan-300 text-sm"
                      >
                        {copied ? '已复制' : '复制'}
                      </button>
                    </div>
                    <p className="text-white break-all">{decodeResult}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
