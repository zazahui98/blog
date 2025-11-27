'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Calculator,
  ArrowRightLeft,
  Trash2
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState<'base' | 'bitwise' | 'expression'>('base');
  const [decValue, setDecValue] = useState('');
  const [binValue, setBinValue] = useState('');
  const [octValue, setOctValue] = useState('');
  const [hexValue, setHexValue] = useState('');
  const [bitwiseA, setBitwiseA] = useState('');
  const [bitwiseB, setBitwiseB] = useState('');
  const [bitwiseResult, setBitwiseResult] = useState('');
  const [expression, setExpression] = useState('');
  const [expressionResult, setExpressionResult] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  // 进制转换
  const convertFromDec = (dec: string) => {
    const num = parseInt(dec, 10);
    if (isNaN(num)) {
      setBinValue(''); setOctValue(''); setHexValue('');
      return;
    }
    setBinValue(num.toString(2));
    setOctValue(num.toString(8));
    setHexValue(num.toString(16).toUpperCase());
  };

  const convertFromBin = (bin: string) => {
    const num = parseInt(bin, 2);
    if (isNaN(num)) {
      setDecValue(''); setOctValue(''); setHexValue('');
      return;
    }
    setDecValue(num.toString(10));
    setOctValue(num.toString(8));
    setHexValue(num.toString(16).toUpperCase());
  };

  const convertFromOct = (oct: string) => {
    const num = parseInt(oct, 8);
    if (isNaN(num)) {
      setDecValue(''); setBinValue(''); setHexValue('');
      return;
    }
    setDecValue(num.toString(10));
    setBinValue(num.toString(2));
    setHexValue(num.toString(16).toUpperCase());
  };

  const convertFromHex = (hex: string) => {
    const num = parseInt(hex, 16);
    if (isNaN(num)) {
      setDecValue(''); setBinValue(''); setOctValue('');
      return;
    }
    setDecValue(num.toString(10));
    setBinValue(num.toString(2));
    setOctValue(num.toString(8));
  };

  // 位运算
  const performBitwise = (op: string) => {
    const a = parseInt(bitwiseA, 10);
    const b = parseInt(bitwiseB, 10);
    
    if (isNaN(a)) {
      setBitwiseResult('请输入有效的数字 A');
      return;
    }
    
    let result: number;
    switch (op) {
      case 'AND': result = a & b; break;
      case 'OR': result = a | b; break;
      case 'XOR': result = a ^ b; break;
      case 'NOT': result = ~a; break;
      case 'LEFT': result = a << (b || 1); break;
      case 'RIGHT': result = a >> (b || 1); break;
      default: return;
    }
    
    setBitwiseResult(`
十进制: ${result}
二进制: ${(result >>> 0).toString(2)}
十六进制: ${(result >>> 0).toString(16).toUpperCase()}
    `.trim());
  };

  // 表达式计算
  const calculateExpression = () => {
    try {
      // 安全的表达式计算（只允许数学运算）
      const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, '');
      if (!sanitized) {
        setExpressionResult('请输入有效的数学表达式');
        return;
      }
      const result = Function(`"use strict"; return (${sanitized})`)();
      setExpressionResult(String(result));
    } catch {
      setExpressionResult('表达式错误');
    }
  };

  // 复制
  const copyText = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // 清空
  const clearAll = () => {
    setDecValue(''); setBinValue(''); setOctValue(''); setHexValue('');
    setBitwiseA(''); setBitwiseB(''); setBitwiseResult('');
    setExpression(''); setExpressionResult('');
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
            <h1 className="text-3xl font-bold text-white mb-2">程序员计算器</h1>
            <p className="text-gray-400">进制转换、位运算、表达式计算</p>
          </motion.div>

          {/* Tab 切换 */}
          <div className="flex gap-2 mb-6">
            {[
              { id: 'base', label: '进制转换' },
              { id: 'bitwise', label: '位运算' },
              { id: 'expression', label: '表达式计算' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'bg-slate-800/50 text-gray-400 border border-slate-700/50 hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 进制转换 */}
          {activeTab === 'base' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">进制转换</h3>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 text-gray-400 hover:text-gray-300 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  清空
                </button>
              </div>
              
              <div className="space-y-4">
                {/* 十进制 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">十进制 (DEC)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={decValue}
                      onChange={(e) => {
                        setDecValue(e.target.value);
                        convertFromDec(e.target.value);
                      }}
                      placeholder="输入十进制数..."
                      className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                    <button
                      onClick={() => copyText(decValue, 'dec')}
                      disabled={!decValue}
                      className="px-3 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {copied === 'dec' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                {/* 二进制 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">二进制 (BIN)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={binValue}
                      onChange={(e) => {
                        setBinValue(e.target.value);
                        convertFromBin(e.target.value);
                      }}
                      placeholder="输入二进制数..."
                      className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                    <button
                      onClick={() => copyText(binValue, 'bin')}
                      disabled={!binValue}
                      className="px-3 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {copied === 'bin' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                {/* 八进制 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">八进制 (OCT)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={octValue}
                      onChange={(e) => {
                        setOctValue(e.target.value);
                        convertFromOct(e.target.value);
                      }}
                      placeholder="输入八进制数..."
                      className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                    <button
                      onClick={() => copyText(octValue, 'oct')}
                      disabled={!octValue}
                      className="px-3 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {copied === 'oct' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                {/* 十六进制 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">十六进制 (HEX)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={hexValue}
                      onChange={(e) => {
                        setHexValue(e.target.value.toUpperCase());
                        convertFromHex(e.target.value);
                      }}
                      placeholder="输入十六进制数..."
                      className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                    <button
                      onClick={() => copyText(hexValue, 'hex')}
                      disabled={!hexValue}
                      className="px-3 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {copied === 'hex' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 位运算 */}
          {activeTab === 'bitwise' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-6">位运算</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">数字 A</label>
                  <input
                    type="number"
                    value={bitwiseA}
                    onChange={(e) => setBitwiseA(e.target.value)}
                    placeholder="输入整数..."
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">数字 B（可选）</label>
                  <input
                    type="number"
                    value={bitwiseB}
                    onChange={(e) => setBitwiseB(e.target.value)}
                    placeholder="输入整数..."
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {['AND', 'OR', 'XOR', 'NOT', 'LEFT', 'RIGHT'].map((op) => (
                  <button
                    key={op}
                    onClick={() => performBitwise(op)}
                    className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 border border-slate-700/50 rounded-lg font-mono transition-colors"
                  >
                    {op === 'AND' ? 'A & B' :
                     op === 'OR' ? 'A | B' :
                     op === 'XOR' ? 'A ^ B' :
                     op === 'NOT' ? '~A' :
                     op === 'LEFT' ? 'A << B' : 'A >> B'}
                  </button>
                ))}
              </div>
              
              {bitwiseResult && (
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-300">结果</span>
                    <button
                      onClick={() => copyText(bitwiseResult, 'bitwise')}
                      className="text-cyan-400 hover:text-cyan-300 text-sm"
                    >
                      {copied === 'bitwise' ? '已复制' : '复制'}
                    </button>
                  </div>
                  <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">{bitwiseResult}</pre>
                </div>
              )}
            </motion.div>
          )}

          {/* 表达式计算 */}
          {activeTab === 'expression' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-6">表达式计算</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">数学表达式</label>
                  <input
                    type="text"
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && calculateExpression()}
                    placeholder="例如: (1 + 2) * 3 / 4"
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>
                
                <button
                  onClick={calculateExpression}
                  disabled={!expression}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Calculator className="w-5 h-5" />
                  <span>计算</span>
                </button>
                
                {expressionResult && (
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">结果</span>
                      <button
                        onClick={() => copyText(expressionResult, 'expr')}
                        className="text-cyan-400 hover:text-cyan-300 text-sm"
                      >
                        {copied === 'expr' ? '已复制' : '复制'}
                      </button>
                    </div>
                    <p className="text-green-400 font-mono text-2xl">{expressionResult}</p>
                  </div>
                )}
                
                <div className="text-gray-500 text-sm">
                  <p>支持的运算符: + - * / % ( )</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
