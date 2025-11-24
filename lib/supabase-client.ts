/**
 * Supabase 客户端配置
 * 支持服务端和客户端使用
 */

import { createBrowserClient } from '@supabase/ssr';
import { Database } from './database.types';

// 浏览器端 Supabase 客户端
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// 导出单例客户端
export const supabase = createClient();
