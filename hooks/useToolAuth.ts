'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { User } from '@supabase/supabase-js';

/**
 * 工具使用限制配置
 */
const GUEST_LIMITS = {
  'data-generator': 5,    // 每日生成次数
  'qrcode': 10,           // 每日生成次数
  'json-formatter': 20,   // 每日格式化次数
  'calculator': 999,      // 计算器不限制
  'timestamp': 999,       // 时间戳不限制
  'base64': 20,           // 每日编解码次数
  'color-picker': 999,    // 颜色选择器不限制
  'password-generator': 10, // 每日生成次数
};

/**
 * 工具认证 Hook
 * 管理用户登录状态和工具使用次数限制
 */
export function useToolAuth(toolId: keyof typeof GUEST_LIMITS) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [usageCount, setUsageCount] = useState(0);
  
  const limit = GUEST_LIMITS[toolId] || 10;
  const isLoggedIn = !!user;
  const canUse = isLoggedIn || usageCount < limit;
  const remainingUses = isLoggedIn ? Infinity : Math.max(0, limit - usageCount);

  // 获取当前用户
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    
    getUser();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 从 localStorage 获取使用次数
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const storageKey = `tool_usage_${toolId}`;
    const dateKey = `tool_usage_date_${toolId}`;
    
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem(dateKey);
    
    // 如果是新的一天，重置计数
    if (storedDate !== today) {
      localStorage.setItem(dateKey, today);
      localStorage.setItem(storageKey, '0');
      setUsageCount(0);
    } else {
      const count = parseInt(localStorage.getItem(storageKey) || '0');
      setUsageCount(count);
    }
  }, [toolId]);

  // 增加使用次数
  const incrementUsage = useCallback(() => {
    if (isLoggedIn) return; // 登录用户不计数
    
    const storageKey = `tool_usage_${toolId}`;
    const newCount = usageCount + 1;
    localStorage.setItem(storageKey, newCount.toString());
    setUsageCount(newCount);
  }, [toolId, usageCount, isLoggedIn]);

  // 检查是否可以使用
  const checkCanUse = useCallback(() => {
    if (isLoggedIn) return true;
    return usageCount < limit;
  }, [isLoggedIn, usageCount, limit]);

  return {
    user,
    loading,
    isLoggedIn,
    canUse,
    remainingUses,
    usageCount,
    limit,
    incrementUsage,
    checkCanUse,
  };
}
