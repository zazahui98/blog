/**
 * 旧版 Supabase 客户端 - 保留用于向后兼容
 * 新代码请使用 supabase-client.ts
 */
import { createBrowserClient } from '@supabase/ssr';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

// 导出类型以保持向后兼容
export type { Database };
