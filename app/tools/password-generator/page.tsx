'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Key,
  RefreshCw,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ToolAuthGuard from '@/components/ToolAuthGuard';
import { useToolAuth } from '@/hooks/useToolAuth';

export default function PasswordGeneratorPage() {
  const { isLoggedIn, canUse, remainingUses, limit, incrementUsage, loading: authLoading } = useToolAuth('password-generator');
  
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // 字符集
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const ambiguous = 'il1Lo0O';

  // 生成密码
  const generatePassword = () => {
    if (!canUse) return;
    
    let chars = '';
    if (includeUppercase) chars += uppercase;
    if (includeLowercase) chars += lowercase;
    if (includeNumbers) chars += numbers;
    if (includeSymbols) chars += symbols;
    
    if (excludeAmbiguous) {
      chars = chars.split('').filter(c => !ambiguous.includes(c)).join('');
    }
    
    if (!chars) {
      setPassword('请至少选择一种字符类型');
      return;
    }
    
    let newPassword = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      newPassword += chars[array[i] % chars.length];
    }
    
    setPassword(newPassword);
    setHistory(prev => [newPassword, ...prev].slice(0, 10));
    incrementUsage();
  };

  // 复制密码
  const copyPassword = async (pwd: string = password) => {
    if (!pwd) return;
    await navigator.clipboard.writeText(pwd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 计算密码强度
  const getPasswordStrength = (pwd: string): { level: number; label: string; color: string } => {
    if (!pwd) return { level: 0, label: '无', color: 'gray' };
    
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (pwd.length >= 16) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    
    if (score <= 2) return { level: 1, label: '弱', color: 'red' };
    if (score <= 4) return { level: 2, label: '中', color: 'yellow' };
    if (score <= 5) return { level: 3, label: '强', color: 'green' };
    return { level: 4, label: '非常强', color: 'cyan' };
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navigation />
      
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
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
            <h1 className="text-3xl font-bold text-white mb-2">密码生成器</h1>
            <p className="text-gray-400">生成安全的随机密码</p>
          </motion.div>

          {/* 登录限制提示 */}
          <ToolAuthGuard
            isLoggedIn={isLoggedIn}
            canUse={canUse}
            remainingUses={remainingUses}
            limit={limit}
            toolName="密码生成器"
          />

          {/* 密码显示 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-4 font-mono text-lg text-white break-all min-h-[60px] flex items-center">
                {password || <span className="text-gray-500">点击生成按钮创建密码</span>}
              </div>
              <button
                onClick={() => copyPassword()}
                disabled={!password}
                className="p-3 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 rounded-xl transition-colors disabled:opacity-50"
              >
                {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
              </button>
              <button
                onClick={generatePassword}
                disabled={authLoading || !canUse}
                className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl transition-all disabled:opacity-50"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            
            {/* 密码强度 */}
            {password && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">强度:</span>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${strength.level * 25}%` }}
                    className={`h-full rounded-full ${
                      strength.color === 'red' ? 'bg-red-500' :
                      strength.color === 'yellow' ? 'bg-yellow-500' :
                      strength.color === 'green' ? 'bg-green-500' :
                      'bg-cyan-500'
                    }`}
                  />
                </div>
                <span className={`text-sm font-medium ${
                  strength.color === 'red' ? 'text-red-400' :
                  strength.color === 'yellow' ? 'text-yellow-400' :
                  strength.color === 'green' ? 'text-green-400' :
                  'text-cyan-400'
                }`}>
                  {strength.label}
                </span>
              </div>
            )}
          </motion.div>

          {/* 配置选项 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6 mb-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">配置选项</h3>
            
            {/* 长度 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">密码长度</label>
                <span className="text-cyan-400 font-mono">{length}</span>
              </div>
              <input
                type="range"
                min={4}
                max={64}
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>4</span>
                <span>64</span>
              </div>
            </div>
            
            {/* 字符类型 */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeUppercase}
                  onChange={(e) => setIncludeUppercase(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                />
                <span className="text-gray-300">大写字母 (A-Z)</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLowercase}
                  onChange={(e) => setIncludeLowercase(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                />
                <span className="text-gray-300">小写字母 (a-z)</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                />
                <span className="text-gray-300">数字 (0-9)</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                />
                <span className="text-gray-300">特殊符号 (!@#$%...)</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={excludeAmbiguous}
                  onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                />
                <span className="text-gray-300">排除易混淆字符 (i, l, 1, L, o, 0, O)</span>
              </label>
            </div>
            
            {/* 生成按钮 */}
            <button
              onClick={generatePassword}
              disabled={authLoading || !canUse}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Key className="w-5 h-5" />
              <span>生成密码</span>
            </button>
          </motion.div>

          {/* 历史记录 */}
          {history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">历史记录</h3>
              <div className="space-y-2">
                {history.map((pwd, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl"
                  >
                    <span className="flex-1 font-mono text-sm text-gray-300 truncate">{pwd}</span>
                    <button
                      onClick={() => copyPassword(pwd)}
                      className="text-gray-400 hover:text-cyan-400 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
