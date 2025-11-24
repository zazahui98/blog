/**
 * 设备信息解析工具
 * 解析 User-Agent 字符串，提取设备型号、操作系统、浏览器等信息
 */

export interface DeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  deviceBrand: string;
  deviceModel: string;
  osName: string;
  osVersion: string;
  browserName: string;
  browserVersion: string;
  userAgent: string;
}

/**
 * 解析 User-Agent 字符串
 */
export function parseUserAgent(userAgent: string): DeviceInfo {
  const ua = userAgent.toLowerCase();

  return {
    deviceType: getDeviceType(ua),
    deviceBrand: getDeviceBrand(ua, userAgent),
    deviceModel: getDeviceModel(ua, userAgent),
    osName: getOSName(ua),
    osVersion: getOSVersion(ua, userAgent),
    browserName: getBrowserName(ua),
    browserVersion: getBrowserVersion(ua, userAgent),
    userAgent,
  };
}

/**
 * 获取设备类型
 */
function getDeviceType(ua: string): DeviceInfo['deviceType'] {
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(ua)) {
    return 'mobile';
  }
  if (/windows|macintosh|linux/i.test(ua)) {
    return 'desktop';
  }
  return 'unknown';
}

/**
 * 获取设备品牌
 */
function getDeviceBrand(ua: string, originalUA: string): string {
  // Apple 设备
  if (/iphone|ipad|ipod|macintosh/i.test(ua)) {
    return 'Apple';
  }

  // Samsung
  if (/samsung|sm-|gt-/i.test(ua)) {
    return 'Samsung';
  }

  // Huawei
  if (/huawei|honor|hry|ane|col|eml|mar|vog|yal|jkm|lya|tah|stk|ele|pot|vce|atu|bla|clt|dub|eva|fla|frd|hma|lld|mha|nce|neo|par|pra|vky|vtr|wlz/i.test(ua)) {
    return 'Huawei';
  }

  // Xiaomi
  if (/xiaomi|mi |redmi|poco/i.test(ua)) {
    return 'Xiaomi';
  }

  // OPPO
  if (/oppo|cph|pch|pbm|pbt|pam|pbb|pbf|pck|pcm|pct|pdt|pdm|pdy|pem|pfm|pgm|phm|pjm|pkm|ppa|ppm|ppt|prm|prt|pft|pgg|pgt|phe|pht|pja|pjc|pjt|pka|pkb|pke|pkh|pkt|pla|plm|plt|pma|pmb|pme|pmm|pmt|pna|pnb|pne|pnm|pnt|ppa|ppb|ppe|ppm|ppt|pra|prb|pre|prm|prt/i.test(ua)) {
    return 'OPPO';
  }

  // vivo
  if (/vivo|v\d{4}|x\d{2}|y\d{2}|z\d{1}|s\d{1}|i\d{4}|pd\d{4}/i.test(ua)) {
    return 'vivo';
  }

  // OnePlus
  if (/oneplus|one plus/i.test(ua)) {
    return 'OnePlus';
  }

  // Google Pixel
  if (/pixel/i.test(ua)) {
    return 'Google';
  }

  // Motorola
  if (/motorola|moto/i.test(ua)) {
    return 'Motorola';
  }

  // LG
  if (/lg-|lg |lge /i.test(ua)) {
    return 'LG';
  }

  // Sony
  if (/sony|xperia/i.test(ua)) {
    return 'Sony';
  }

  // HTC
  if (/htc/i.test(ua)) {
    return 'HTC';
  }

  // Nokia
  if (/nokia/i.test(ua)) {
    return 'Nokia';
  }

  // Lenovo
  if (/lenovo/i.test(ua)) {
    return 'Lenovo';
  }

  // ASUS
  if (/asus|zenfone/i.test(ua)) {
    return 'ASUS';
  }

  // Realme
  if (/realme|rmx/i.test(ua)) {
    return 'Realme';
  }

  // Windows PC
  if (/windows/i.test(ua)) {
    return 'PC';
  }

  return 'Unknown';
}

/**
 * 获取设备型号
 */
function getDeviceModel(ua: string, originalUA: string): string {
  // iPhone 型号
  const iphoneMatch = originalUA.match(/iPhone\s*(\d+[,\s]*\d+)?/i);
  if (iphoneMatch) {
    const model = mapIPhoneModel(iphoneMatch[1] || '');
    return model || 'iPhone';
  }

  // iPad 型号
  const ipadMatch = originalUA.match(/iPad\s*(\d+[,\s]*\d+)?/i);
  if (ipadMatch) {
    return 'iPad';
  }

  // Mac 型号
  if (/macintosh|mac os x/i.test(ua)) {
    if (/intel/i.test(ua)) return 'Mac (Intel)';
    if (/arm/i.test(ua)) return 'Mac (Apple Silicon)';
    return 'Mac';
  }

  // Android 设备型号
  const androidModelMatch = originalUA.match(/;\s*([^;)]+)\s+Build/i);
  if (androidModelMatch) {
    let model = androidModelMatch[1].trim();
    // 清理型号名称
    model = model.replace(/android/gi, '').trim();
    return model || 'Android Device';
  }

  // Samsung 型号
  const samsungMatch = originalUA.match(/(SM-[A-Z0-9]+|GT-[A-Z0-9]+)/i);
  if (samsungMatch) {
    return mapSamsungModel(samsungMatch[1]);
  }

  // Huawei 型号
  const huaweiMatch = originalUA.match(/(HRY|ANE|COL|EML|MAR|VOG|YAL|JKM|LYA|TAH|STK|ELE|POT|VCE|ATU|BLA|CLT|DUB|EVA|FLA|FRD|HMA|LLD|MHA|NCE|NEO|PAR|PRA|VKY|VTR|WLZ)-[A-Z0-9]+/i);
  if (huaweiMatch) {
    return huaweiMatch[0];
  }

  // Xiaomi 型号
  const xiaomiMatch = originalUA.match(/(Mi|Redmi|POCO)\s+([A-Z0-9\s]+)/i);
  if (xiaomiMatch) {
    return `${xiaomiMatch[1]} ${xiaomiMatch[2]}`.trim();
  }

  // Windows 版本
  if (/windows nt 10/i.test(ua)) return 'Windows 10/11';
  if (/windows nt 6.3/i.test(ua)) return 'Windows 8.1';
  if (/windows nt 6.2/i.test(ua)) return 'Windows 8';
  if (/windows nt 6.1/i.test(ua)) return 'Windows 7';

  return 'Unknown Device';
}

/**
 * 映射 iPhone 型号
 */
function mapIPhoneModel(identifier: string): string {
  const models: Record<string, string> = {
    '15,2': 'iPhone 14 Pro',
    '15,3': 'iPhone 14 Pro Max',
    '14,7': 'iPhone 14',
    '14,8': 'iPhone 14 Plus',
    '14,2': 'iPhone 13 Pro',
    '14,3': 'iPhone 13 Pro Max',
    '14,4': 'iPhone 13 mini',
    '14,5': 'iPhone 13',
    '13,1': 'iPhone 12 mini',
    '13,2': 'iPhone 12',
    '13,3': 'iPhone 12 Pro',
    '13,4': 'iPhone 12 Pro Max',
  };
  return models[identifier] || 'iPhone';
}

/**
 * 映射 Samsung 型号
 */
function mapSamsungModel(model: string): string {
  const prefix = model.substring(0, 4);
  const series: Record<string, string> = {
    'SM-S': 'Galaxy S',
    'SM-N': 'Galaxy Note',
    'SM-A': 'Galaxy A',
    'SM-M': 'Galaxy M',
    'SM-F': 'Galaxy Fold/Flip',
    'SM-G': 'Galaxy',
  };
  return `${series[prefix] || 'Samsung'} ${model}`;
}

/**
 * 获取操作系统名称
 */
function getOSName(ua: string): string {
  if (/windows phone/i.test(ua)) return 'Windows Phone';
  if (/windows/i.test(ua)) return 'Windows';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/mac os x/i.test(ua)) return 'macOS';
  if (/android/i.test(ua)) return 'Android';
  if (/linux/i.test(ua)) return 'Linux';
  if (/cros/i.test(ua)) return 'Chrome OS';
  return 'Unknown OS';
}

/**
 * 获取操作系统版本
 */
function getOSVersion(ua: string, originalUA: string): string {
  // iOS 版本
  const iosMatch = originalUA.match(/OS (\d+)[_.](\d+)[_.]?(\d+)?/i);
  if (iosMatch) {
    return `${iosMatch[1]}.${iosMatch[2]}${iosMatch[3] ? '.' + iosMatch[3] : ''}`;
  }

  // macOS 版本
  const macMatch = originalUA.match(/Mac OS X (\d+)[_.](\d+)[_.]?(\d+)?/i);
  if (macMatch) {
    return `${macMatch[1]}.${macMatch[2]}${macMatch[3] ? '.' + macMatch[3] : ''}`;
  }

  // Android 版本
  const androidMatch = originalUA.match(/Android (\d+\.?\d*\.?\d*)/i);
  if (androidMatch) {
    return androidMatch[1];
  }

  // Windows 版本
  if (/windows nt 10/i.test(ua)) return '10/11';
  if (/windows nt 6.3/i.test(ua)) return '8.1';
  if (/windows nt 6.2/i.test(ua)) return '8';
  if (/windows nt 6.1/i.test(ua)) return '7';

  return '';
}

/**
 * 获取浏览器名称
 */
function getBrowserName(ua: string): string {
  if (/edg/i.test(ua)) return 'Edge';
  if (/chrome|crios|crmo/i.test(ua)) return 'Chrome';
  if (/firefox|fxios/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
  if (/opr\//i.test(ua) || /opera/i.test(ua)) return 'Opera';
  if (/trident/i.test(ua) || /msie/i.test(ua)) return 'Internet Explorer';
  if (/ucbrowser/i.test(ua)) return 'UC Browser';
  if (/samsungbrowser/i.test(ua)) return 'Samsung Browser';
  if (/miuibrowser/i.test(ua)) return 'MIUI Browser';
  return 'Unknown Browser';
}

/**
 * 获取浏览器版本
 */
function getBrowserVersion(ua: string, originalUA: string): string {
  let match;

  // Edge
  match = originalUA.match(/Edg\/(\d+\.?\d*\.?\d*\.?\d*)/i);
  if (match) return match[1];

  // Chrome
  match = originalUA.match(/Chrome\/(\d+\.?\d*\.?\d*\.?\d*)/i);
  if (match) return match[1];

  // Firefox
  match = originalUA.match(/Firefox\/(\d+\.?\d*\.?\d*)/i);
  if (match) return match[1];

  // Safari
  match = originalUA.match(/Version\/(\d+\.?\d*\.?\d*)/i);
  if (match && /safari/i.test(ua)) return match[1];

  // Opera
  match = originalUA.match(/OPR\/(\d+\.?\d*\.?\d*\.?\d*)/i);
  if (match) return match[1];

  return '';
}

/**
 * 获取客户端 IP 地址（从请求头中）
 */
export function getClientIP(headers: Headers): string {
  // 尝试多个可能包含真实 IP 的请求头
  const possibleHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip', // Cloudflare
    'x-client-ip',
    'x-cluster-client-ip',
    'forwarded',
  ];

  for (const header of possibleHeaders) {
    const value = headers.get(header);
    if (value) {
      // x-forwarded-for 可能包含多个 IP，取第一个
      const ip = value.split(',')[0].trim();
      if (ip) return ip;
    }
  }

  return 'Unknown';
}

/**
 * 格式化设备信息为可读字符串
 */
export function formatDeviceInfo(info: DeviceInfo): string {
  const parts: string[] = [];

  if (info.deviceBrand !== 'Unknown') {
    parts.push(info.deviceBrand);
  }

  if (info.deviceModel !== 'Unknown Device') {
    parts.push(info.deviceModel);
  }

  if (info.osName !== 'Unknown OS') {
    parts.push(`${info.osName} ${info.osVersion}`.trim());
  }

  if (info.browserName !== 'Unknown Browser') {
    parts.push(`${info.browserName} ${info.browserVersion}`.trim());
  }

  return parts.join(' · ') || 'Unknown Device';
}
