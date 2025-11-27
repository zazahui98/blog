/**
 * 简单的内存速率限制
 * 用于API路由的请求限制
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// 内存存储（生产环境建议使用 Redis）
const rateLimitStore = new Map<string, RateLimitEntry>();

// 清理过期条目
function cleanupExpired() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

// 每分钟清理一次
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpired, 60000);
}

export interface RateLimitConfig {
  maxRequests: number;  // 最大请求数
  windowMs: number;     // 时间窗口（毫秒）
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * 检查速率限制
 * @param identifier 标识符（如 IP 地址或用户 ID）
 * @param config 速率限制配置
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 60, windowMs: 60000 }
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  
  let entry = rateLimitStore.get(key);
  
  // 如果没有记录或已过期，创建新记录
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
    
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: entry.resetTime,
    };
  }
  
  // 检查是否超过限制
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    };
  }
  
  // 增加计数
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

// 预设的速率限制配置
export const rateLimitConfigs = {
  // 通用 API 限制：每分钟 60 次
  default: { maxRequests: 60, windowMs: 60000 },
  
  // 登录限制：每分钟 5 次
  login: { maxRequests: 5, windowMs: 60000 },
  
  // 注册限制：每小时 3 次
  register: { maxRequests: 3, windowMs: 3600000 },
  
  // 评论限制：每分钟 10 次
  comment: { maxRequests: 10, windowMs: 60000 },
  
  // 搜索限制：每分钟 30 次
  search: { maxRequests: 30, windowMs: 60000 },
  
  // 文件上传限制：每分钟 5 次
  upload: { maxRequests: 5, windowMs: 60000 },
};

/**
 * 获取客户端 IP 地址
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

/**
 * 创建速率限制响应
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: '请求过于频繁，请稍后再试',
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.resetTime.toString(),
        'Retry-After': (result.retryAfter || 60).toString(),
      },
    }
  );
}
