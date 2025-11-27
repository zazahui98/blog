'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Palette,
  RefreshCw
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

// 颜色转换函数
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, x)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

export default function ColorPickerPage() {
  const [hex, setHex] = useState('#3b82f6');
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
  const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 });
  const [copied, setCopied] = useState<string | null>(null);
  const [recentColors, setRecentColors] = useState<string[]>([]);

  // 从 HEX 更新其他格式
  const updateFromHex = (newHex: string) => {
    const rgbVal = hexToRgb(newHex);
    if (rgbVal) {
      setHex(newHex.startsWith('#') ? newHex : '#' + newHex);
      setRgb(rgbVal);
      setHsl(rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b));
      addToRecent(newHex.startsWith('#') ? newHex : '#' + newHex);
    }
  };

  // 从 RGB 更新其他格式
  const updateFromRgb = (r: number, g: number, b: number) => {
    setRgb({ r, g, b });
    const newHex = rgbToHex(r, g, b);
    setHex(newHex);
    setHsl(rgbToHsl(r, g, b));
    addToRecent(newHex);
  };

  // 从 HSL 更新其他格式
  const updateFromHsl = (h: number, s: number, l: number) => {
    setHsl({ h, s, l });
    const rgbVal = hslToRgb(h, s, l);
    setRgb(rgbVal);
    const newHex = rgbToHex(rgbVal.r, rgbVal.g, rgbVal.b);
    setHex(newHex);
    addToRecent(newHex);
  };

  // 添加到最近使用
  const addToRecent = (color: string) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== color);
      return [color, ...filtered].slice(0, 10);
    });
  };

  // 生成随机颜色
  const randomColor = () => {
    const newHex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    updateFromHex(newHex);
  };

  // 复制
  const copyText = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // 预设颜色
  const presetColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#64748b', '#1e293b', '#000000',
  ];

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
            <h1 className="text-3xl font-bold text-white mb-2">颜色转换器</h1>
            <p className="text-gray-400">HEX、RGB、HSL 颜色格式互转</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：颜色选择器 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* 颜色预览 */}
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">颜色预览</h3>
                  <button
                    onClick={randomColor}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 text-sm rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    随机
                  </button>
                </div>
                
                <div className="flex gap-4">
                  <div
                    className="w-32 h-32 rounded-xl border border-slate-700/50 shadow-lg"
                    style={{ backgroundColor: hex }}
                  />
                  <div className="flex-1">
                    <input
                      type="color"
                      value={hex}
                      onChange={(e) => updateFromHex(e.target.value)}
                      className="w-full h-32 rounded-xl cursor-pointer border-0"
                    />
                  </div>
                </div>
              </div>

              {/* 预设颜色 */}
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">预设颜色</h3>
                <div className="grid grid-cols-10 gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => updateFromHex(color)}
                      className="w-8 h-8 rounded-lg border border-slate-700/50 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* 最近使用 */}
              {recentColors.length > 0 && (
                <div className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">最近使用</h3>
                  <div className="flex flex-wrap gap-2">
                    {recentColors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => updateFromHex(color)}
                        className="w-8 h-8 rounded-lg border border-slate-700/50 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* 右侧：颜色值 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* HEX */}
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">HEX</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={hex}
                    onChange={(e) => updateFromHex(e.target.value)}
                    className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                  <button
                    onClick={() => copyText(hex, 'hex')}
                    className="px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 rounded-xl transition-colors"
                  >
                    {copied === 'hex' ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* RGB */}
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">RGB</h3>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">R</label>
                    <input
                      type="number"
                      min={0}
                      max={255}
                      value={rgb.r}
                      onChange={(e) => updateFromRgb(parseInt(e.target.value) || 0, rgb.g, rgb.b)}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2 text-white font-mono text-center focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">G</label>
                    <input
                      type="number"
                      min={0}
                      max={255}
                      value={rgb.g}
                      onChange={(e) => updateFromRgb(rgb.r, parseInt(e.target.value) || 0, rgb.b)}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2 text-white font-mono text-center focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">B</label>
                    <input
                      type="number"
                      min={0}
                      max={255}
                      value={rgb.b}
                      onChange={(e) => updateFromRgb(rgb.r, rgb.g, parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2 text-white font-mono text-center focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}
                    readOnly
                    className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 text-white font-mono text-sm"
                  />
                  <button
                    onClick={() => copyText(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'rgb')}
                    className="px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 rounded-xl transition-colors"
                  >
                    {copied === 'rgb' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* HSL */}
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">HSL</h3>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">H (°)</label>
                    <input
                      type="number"
                      min={0}
                      max={360}
                      value={hsl.h}
                      onChange={(e) => updateFromHsl(parseInt(e.target.value) || 0, hsl.s, hsl.l)}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2 text-white font-mono text-center focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">S (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={hsl.s}
                      onChange={(e) => updateFromHsl(hsl.h, parseInt(e.target.value) || 0, hsl.l)}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2 text-white font-mono text-center focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">L (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={hsl.l}
                      onChange={(e) => updateFromHsl(hsl.h, hsl.s, parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2 text-white font-mono text-center focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`}
                    readOnly
                    className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 text-white font-mono text-sm"
                  />
                  <button
                    onClick={() => copyText(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'hsl')}
                    className="px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 rounded-xl transition-colors"
                  >
                    {copied === 'hsl' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
