'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Mail, 
  Phone, 
  CreditCard, 
  User, 
  MapPin, 
  Building2,
  Play,
  Copy,
  Download,
  ArrowLeft,
  Check,
  Info
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ToolAuthGuard from '@/components/ToolAuthGuard';
import { useToolAuth } from '@/hooks/useToolAuth';

/**
 * 数据类型配置
 */
const dataTypes = [
  { id: 'email', name: '邮箱地址', icon: Mail },
  { id: 'phone', name: '手机号码', icon: Phone },
  { id: 'idcard', name: '身份证号', icon: CreditCard },
  { id: 'name', name: '姓名', icon: User },
  { id: 'address', name: '地址', icon: MapPin },
  { id: 'company', name: '公司名称', icon: Building2 },
];

/**
 * 生成结果接口
 */
interface GenerationResult {
  id: string;
  type: string;
  data: string[];
  count: number;
  createdAt: string;
}

export default function DataGeneratorPage() {
  const { isLoggedIn, canUse, remainingUses, limit, incrementUsage, loading: authLoading } = useToolAuth('data-generator');
  
  const [activeType, setActiveType] = useState('email');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // 邮箱选项
  const [emailDomain, setEmailDomain] = useState('gmail.com');
  const [emailPrefix, setEmailPrefix] = useState('');
  
  // 手机号选项
  const [phoneRegion, setPhoneRegion] = useState('china');
  const [phoneCarrier, setPhoneCarrier] = useState('');
  
  // 身份证选项
  const [idcardGender, setIdcardGender] = useState('random');
  const [idcardAgeRange, setIdcardAgeRange] = useState('18-65');
  
  // 姓名选项
  const [nameLanguage, setNameLanguage] = useState('chinese');
  
  // 地址选项
  const [addressDetailed, setAddressDetailed] = useState(true);

  /**
   * 获取数据类型名称
   */
  const getTypeName = (type: string) => {
    return dataTypes.find(t => t.id === type)?.name || type;
  };

  /**
   * 生成数据（本地生成，无需后端）
   */
  const generateData = async () => {
    // 检查使用权限
    if (!canUse) return;
    
    setLoading(true);
    
    // 模拟加载延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let generatedData: string[] = [];
    
    switch (activeType) {
      case 'email':
        generatedData = generateEmails(count, emailDomain, emailPrefix);
        break;
      case 'phone':
        generatedData = generatePhones(count, phoneRegion, phoneCarrier);
        break;
      case 'idcard':
        generatedData = generateIdCards(count, idcardGender, idcardAgeRange);
        break;
      case 'name':
        generatedData = generateNames(count, nameLanguage);
        break;
      case 'address':
        generatedData = generateAddresses(count, addressDetailed);
        break;
      case 'company':
        generatedData = generateCompanies(count);
        break;
    }
    
    const result: GenerationResult = {
      id: Date.now().toString(),
      type: activeType,
      data: generatedData,
      count: generatedData.length,
      createdAt: new Date().toISOString(),
    };
    
    setResults(prev => [result, ...prev]);
    incrementUsage(); // 增加使用次数
    setLoading(false);
  };

  /**
   * 复制数据到剪贴板
   */
  const copyToClipboard = async (data: string[], resultId: string) => {
    const text = data.join('\n');
    await navigator.clipboard.writeText(text);
    setCopiedId(resultId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  /**
   * 下载数据为文件
   */
  const downloadData = (result: GenerationResult) => {
    const text = result.data.join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${getTypeName(result.type)}_${result.count}条_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
            <h1 className="text-3xl font-bold text-white mb-2">数据生成器</h1>
            <p className="text-gray-400">批量生成各种测试数据，支持复制和下载</p>
          </motion.div>

          {/* 登录限制提示 */}
          <ToolAuthGuard
            isLoggedIn={isLoggedIn}
            canUse={canUse}
            remainingUses={remainingUses}
            limit={limit}
            toolName="数据生成器"
          />

          {/* 提示信息 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-8 flex items-start gap-3"
          >
            <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <p className="text-cyan-200 text-sm">
              所有数据均在浏览器本地生成，不会上传到服务器。生成的数据仅供测试使用。
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：配置区域 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6">
                {/* 数据类型选择 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3">选择数据类型</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {dataTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.id}
                          onClick={() => setActiveType(type.id)}
                          className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                            activeType === type.id
                              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                              : 'bg-slate-800/50 border-slate-700/50 text-gray-400 hover:border-cyan-500/30 hover:text-gray-300'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{type.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 生成数量 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">生成数量</label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={count}
                    onChange={(e) => setCount(Math.min(1000, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>

                {/* 类型特定选项 */}
                <TypeSpecificOptions
                  type={activeType}
                  emailDomain={emailDomain}
                  setEmailDomain={setEmailDomain}
                  emailPrefix={emailPrefix}
                  setEmailPrefix={setEmailPrefix}
                  phoneRegion={phoneRegion}
                  setPhoneRegion={setPhoneRegion}
                  phoneCarrier={phoneCarrier}
                  setPhoneCarrier={setPhoneCarrier}
                  idcardGender={idcardGender}
                  setIdcardGender={setIdcardGender}
                  idcardAgeRange={idcardAgeRange}
                  setIdcardAgeRange={setIdcardAgeRange}
                  nameLanguage={nameLanguage}
                  setNameLanguage={setNameLanguage}
                  addressDetailed={addressDetailed}
                  setAddressDetailed={setAddressDetailed}
                />

                {/* 生成按钮 */}
                <button
                  onClick={generateData}
                  disabled={loading || authLoading || !canUse}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                  <span>{loading ? '生成中...' : `生成${getTypeName(activeType)}`}</span>
                </button>
              </div>
            </motion.div>

            {/* 右侧：功能说明 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">功能说明</h3>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>支持批量生成各种类型的测试数据</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>可自定义生成参数和数量</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>支持数据复制和文件下载</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>本地生成，保护隐私安全</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* 生成结果 */}
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <h2 className="text-xl font-semibold text-white mb-4">生成结果</h2>
              <div className="space-y-4">
                {results.map((result) => (
                  <ResultCard
                    key={result.id}
                    result={result}
                    typeName={getTypeName(result.type)}
                    onCopy={() => copyToClipboard(result.data, result.id)}
                    onDownload={() => downloadData(result)}
                    copied={copiedId === result.id}
                  />
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


/**
 * 类型特定选项组件
 */
function TypeSpecificOptions({
  type,
  emailDomain,
  setEmailDomain,
  emailPrefix,
  setEmailPrefix,
  phoneRegion,
  setPhoneRegion,
  phoneCarrier,
  setPhoneCarrier,
  idcardGender,
  setIdcardGender,
  idcardAgeRange,
  setIdcardAgeRange,
  nameLanguage,
  setNameLanguage,
  addressDetailed,
  setAddressDetailed,
}: {
  type: string;
  emailDomain: string;
  setEmailDomain: (v: string) => void;
  emailPrefix: string;
  setEmailPrefix: (v: string) => void;
  phoneRegion: string;
  setPhoneRegion: (v: string) => void;
  phoneCarrier: string;
  setPhoneCarrier: (v: string) => void;
  idcardGender: string;
  setIdcardGender: (v: string) => void;
  idcardAgeRange: string;
  setIdcardAgeRange: (v: string) => void;
  nameLanguage: string;
  setNameLanguage: (v: string) => void;
  addressDetailed: boolean;
  setAddressDetailed: (v: boolean) => void;
}) {
  const selectClass = "w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors";
  const inputClass = "w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors";

  switch (type) {
    case 'email':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">邮箱域名</label>
            <select value={emailDomain} onChange={(e) => setEmailDomain(e.target.value)} className={selectClass}>
              <option value="gmail.com">gmail.com</option>
              <option value="qq.com">qq.com</option>
              <option value="163.com">163.com</option>
              <option value="126.com">126.com</option>
              <option value="hotmail.com">hotmail.com</option>
              <option value="yahoo.com">yahoo.com</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">用户名前缀（可选）</label>
            <input
              type="text"
              value={emailPrefix}
              onChange={(e) => setEmailPrefix(e.target.value)}
              placeholder="例如：user、test"
              className={inputClass}
            />
          </div>
        </div>
      );
    
    case 'phone':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">地区</label>
            <select value={phoneRegion} onChange={(e) => setPhoneRegion(e.target.value)} className={selectClass}>
              <option value="china">中国大陆</option>
              <option value="us">美国</option>
              <option value="international">国际通用</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">运营商（可选）</label>
            <select value={phoneCarrier} onChange={(e) => setPhoneCarrier(e.target.value)} className={selectClass}>
              <option value="">随机</option>
              <option value="mobile">中国移动</option>
              <option value="unicom">中国联通</option>
              <option value="telecom">中国电信</option>
            </select>
          </div>
        </div>
      );
    
    case 'idcard':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">性别</label>
            <select value={idcardGender} onChange={(e) => setIdcardGender(e.target.value)} className={selectClass}>
              <option value="random">随机</option>
              <option value="male">男性</option>
              <option value="female">女性</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">年龄范围</label>
            <select value={idcardAgeRange} onChange={(e) => setIdcardAgeRange(e.target.value)} className={selectClass}>
              <option value="18-30">18-30岁</option>
              <option value="30-50">30-50岁</option>
              <option value="50-80">50-80岁</option>
              <option value="18-65">18-65岁</option>
            </select>
          </div>
        </div>
      );
    
    case 'name':
      return (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">语言</label>
          <select value={nameLanguage} onChange={(e) => setNameLanguage(e.target.value)} className={selectClass}>
            <option value="chinese">中文</option>
            <option value="english">英文</option>
          </select>
        </div>
      );
    
    case 'address':
      return (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">详细程度</label>
          <select 
            value={addressDetailed ? 'detailed' : 'simple'} 
            onChange={(e) => setAddressDetailed(e.target.value === 'detailed')} 
            className={selectClass}
          >
            <option value="detailed">详细地址</option>
            <option value="simple">简单地址</option>
          </select>
        </div>
      );
    
    default:
      return null;
  }
}

/**
 * 结果卡片组件
 */
function ResultCard({
  result,
  typeName,
  onCopy,
  onDownload,
  copied,
}: {
  result: GenerationResult;
  typeName: string;
  onCopy: () => void;
  onDownload: () => void;
  copied: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const displayData = expanded ? result.data : result.data.slice(0, 5);

  return (
    <div className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl overflow-hidden">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-sm font-medium rounded-full">
            {typeName}
          </span>
          <span className="text-gray-400 text-sm">共 {result.count} 条数据</span>
          <span className="text-gray-500 text-sm">
            {new Date(result.createdAt).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 text-sm rounded-lg transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '已复制' : '复制'}</span>
          </button>
          <button
            onClick={onDownload}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 text-sm rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>下载</span>
          </button>
        </div>
      </div>
      
      {/* 数据列表 */}
      <div className="p-4">
        <div className="space-y-2">
          {displayData.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-2 bg-slate-800/30 rounded-lg"
            >
              <span className="text-gray-500 text-sm w-8">{index + 1}.</span>
              <span className="text-gray-200 font-mono text-sm flex-1">{item}</span>
            </div>
          ))}
        </div>
        
        {result.data.length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
          >
            {expanded ? '收起' : `展开全部 ${result.data.length} 条数据`}
          </button>
        )}
      </div>
    </div>
  );
}

// ============ 数据生成函数 ============

/**
 * 生成随机字符串
 */
function randomString(length: number, chars = 'abcdefghijklmnopqrstuvwxyz0123456789'): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 生成邮箱地址
 */
function generateEmails(count: number, domain: string, prefix: string): string[] {
  const emails: string[] = [];
  for (let i = 0; i < count; i++) {
    const username = prefix ? `${prefix}${randomString(6)}` : randomString(8);
    emails.push(`${username}@${domain}`);
  }
  return emails;
}

/**
 * 生成手机号码
 */
function generatePhones(count: number, region: string, carrier: string): string[] {
  const phones: string[] = [];
  
  // 中国手机号前缀
  const prefixes: Record<string, string[]> = {
    mobile: ['134', '135', '136', '137', '138', '139', '150', '151', '152', '157', '158', '159', '182', '183', '184', '187', '188'],
    unicom: ['130', '131', '132', '155', '156', '185', '186', '145', '176'],
    telecom: ['133', '153', '180', '181', '189', '177', '173'],
  };
  
  const allPrefixes = [...prefixes.mobile, ...prefixes.unicom, ...prefixes.telecom];
  
  for (let i = 0; i < count; i++) {
    if (region === 'china') {
      const selectedPrefixes = carrier && prefixes[carrier] ? prefixes[carrier] : allPrefixes;
      const prefix = selectedPrefixes[Math.floor(Math.random() * selectedPrefixes.length)];
      const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
      phones.push(prefix + suffix);
    } else if (region === 'us') {
      const areaCode = Math.floor(Math.random() * 900 + 100);
      const exchange = Math.floor(Math.random() * 900 + 100);
      const subscriber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      phones.push(`+1-${areaCode}-${exchange}-${subscriber}`);
    } else {
      const countryCode = Math.floor(Math.random() * 99 + 1);
      const number = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
      phones.push(`+${countryCode}-${number}`);
    }
  }
  return phones;
}

/**
 * 生成身份证号码
 */
function generateIdCards(count: number, gender: string, ageRange: string): string[] {
  const idcards: string[] = [];
  
  // 地区码（部分示例）
  const areaCodes = [
    '110101', '110102', '310101', '310104', '440103', '440106',
    '330102', '330106', '320102', '320106', '510104', '510107',
  ];
  
  // 解析年龄范围
  const [minAge, maxAge] = ageRange.split('-').map(Number);
  const currentYear = new Date().getFullYear();
  
  // 身份证校验码权重
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
  
  for (let i = 0; i < count; i++) {
    // 地区码
    const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
    
    // 出生日期
    const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
    const birthYear = currentYear - age;
    const birthMonth = Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0');
    const birthDay = Math.floor(Math.random() * 28 + 1).toString().padStart(2, '0');
    const birthDate = `${birthYear}${birthMonth}${birthDay}`;
    
    // 顺序码（奇数为男，偶数为女）
    let sequenceCode: number;
    if (gender === 'male') {
      sequenceCode = Math.floor(Math.random() * 500) * 2 + 1;
    } else if (gender === 'female') {
      sequenceCode = Math.floor(Math.random() * 500) * 2;
    } else {
      sequenceCode = Math.floor(Math.random() * 999) + 1;
    }
    const sequence = sequenceCode.toString().padStart(3, '0');
    
    // 计算校验码
    const id17 = areaCode + birthDate + sequence;
    let sum = 0;
    for (let j = 0; j < 17; j++) {
      sum += parseInt(id17[j]) * weights[j];
    }
    const checkCode = checkCodes[sum % 11];
    
    idcards.push(id17 + checkCode);
  }
  return idcards;
}

/**
 * 生成姓名
 */
function generateNames(count: number, language: string): string[] {
  const names: string[] = [];
  
  const chineseSurnames = ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '林', '罗', '高'];
  const chineseGivenNames = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀英', '华', '慧'];
  
  const englishFirstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'];
  const englishLastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];
  
  for (let i = 0; i < count; i++) {
    if (language === 'chinese') {
      const surname = chineseSurnames[Math.floor(Math.random() * chineseSurnames.length)];
      const givenName = chineseGivenNames[Math.floor(Math.random() * chineseGivenNames.length)];
      const givenName2 = Math.random() > 0.5 ? chineseGivenNames[Math.floor(Math.random() * chineseGivenNames.length)] : '';
      names.push(surname + givenName + givenName2);
    } else {
      const firstName = englishFirstNames[Math.floor(Math.random() * englishFirstNames.length)];
      const lastName = englishLastNames[Math.floor(Math.random() * englishLastNames.length)];
      names.push(`${firstName} ${lastName}`);
    }
  }
  return names;
}

/**
 * 生成地址
 */
function generateAddresses(count: number, detailed: boolean): string[] {
  const addresses: string[] = [];
  
  const provinces = ['北京市', '上海市', '广东省', '浙江省', '江苏省', '四川省', '湖北省', '山东省', '河南省', '福建省'];
  const cities = ['深圳市', '广州市', '杭州市', '南京市', '成都市', '武汉市', '青岛市', '郑州市', '厦门市', '苏州市'];
  const districts = ['海淀区', '朝阳区', '浦东新区', '南山区', '福田区', '西湖区', '江干区', '玄武区', '武侯区', '洪山区'];
  const streets = ['中山路', '人民路', '解放路', '建设路', '和平路', '文化路', '科技路', '创新路', '发展大道', '幸福街'];
  
  for (let i = 0; i < count; i++) {
    const province = provinces[Math.floor(Math.random() * provinces.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const district = districts[Math.floor(Math.random() * districts.length)];
    const street = streets[Math.floor(Math.random() * streets.length)];
    const number = Math.floor(Math.random() * 999) + 1;
    
    if (detailed) {
      const building = Math.floor(Math.random() * 30) + 1;
      const unit = Math.floor(Math.random() * 6) + 1;
      const room = Math.floor(Math.random() * 2000) + 101;
      addresses.push(`${province}${city}${district}${street}${number}号${building}栋${unit}单元${room}室`);
    } else {
      addresses.push(`${province}${city}${district}${street}${number}号`);
    }
  }
  return addresses;
}

/**
 * 生成公司名称
 */
function generateCompanies(count: number): string[] {
  const companies: string[] = [];
  
  const prefixes = ['华', '中', '东', '西', '南', '北', '新', '大', '国', '天', '金', '银', '盛', '恒', '永', '万', '亿', '鑫', '瑞', '祥'];
  const middles = ['科', '信', '达', '通', '联', '创', '智', '云', '数', '网', '电', '能', '源', '力', '业', '商', '贸', '投', '建', '工'];
  const suffixes = ['科技有限公司', '信息技术有限公司', '网络科技有限公司', '电子商务有限公司', '投资有限公司', '贸易有限公司', '实业有限公司', '集团有限公司', '控股有限公司', '发展有限公司'];
  const cities = ['北京', '上海', '深圳', '广州', '杭州', '南京', '成都', '武汉', '西安', '苏州'];
  
  for (let i = 0; i < count; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const middle = middles[Math.floor(Math.random() * middles.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    companies.push(`${city}${prefix}${middle}${suffix}`);
  }
  return companies;
}
