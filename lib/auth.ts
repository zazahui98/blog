/**
 * 认证相关工具函数
 */

import { supabase } from './supabase-client';
import { UserRole } from './database.types';

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  fullName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  is_active: boolean;
  email?: string;
  last_login_at?: string | null;
  last_login_ip?: string | null;
  last_login_device?: string | null;
  last_login_device_model?: string | null;
  last_login_os?: string | null;
  last_login_browser?: string | null;
  login_count?: number;
}

/**
 * 用户注册
 */
export async function signUp(data: SignUpData) {
  const { email, password, username, fullName } = data;

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        full_name: fullName || '',
      },
    },
  });

  if (error) throw error;
  return authData;
}

/**
 * 用户登录
 */
export async function signIn(data: SignInData, deviceInfo?: {
  ip: string;
  userAgent: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  osName: string;
  osVersion: string;
  browserName: string;
  browserVersion: string;
}) {
  const { email, password } = data;

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // 记录登录信息
  if (authData.user && deviceInfo) {
    try {
      await supabase.rpc('record_user_login', {
        p_user_id: authData.user.id,
        p_ip_address: deviceInfo.ip,
        p_device_type: deviceInfo.deviceType,
        p_device_brand: deviceInfo.deviceBrand,
        p_device_model: deviceInfo.deviceModel,
        p_os_name: deviceInfo.osName,
        p_os_version: deviceInfo.osVersion,
        p_browser_name: deviceInfo.browserName,
        p_browser_version: deviceInfo.browserVersion,
        p_user_agent: deviceInfo.userAgent,
      } as never);
    } catch (err) {
      console.error('Failed to record login:', err);
    }
  }

  return authData;
}

/**
 * 用户登出
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * 获取当前用户
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.log('⚠️ [getCurrentUser] 获取用户失败:', error.message);
      return null;
    }
    return user;
  } catch (error) {
    console.log('⚠️ [getCurrentUser] 捕获异常:', error);
    return null;
  }
}

/**
 * 获取当前用户配置
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    console.log('🔍 [getCurrentUserProfile] 开始获取用户配置...');
    
    const user = await getCurrentUser();
    console.log('👤 [getCurrentUserProfile] 当前用户:', user?.id, user?.email);
    
    if (!user) {
      console.log('❌ [getCurrentUserProfile] 没有登录用户');
      return null;
    }

    console.log('📡 [getCurrentUserProfile] 查询 user_profiles 表...');
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('❌ [getCurrentUserProfile] 查询错误:', error);
      console.error('错误详情:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      // 不抛出错误，返回null表示用户配置不存在
      return null;
    }
    
    if (!data) {
      console.log('⚠️ [getCurrentUserProfile] 未找到用户配置');
      return null;
    }
    
    console.log('✅ [getCurrentUserProfile] 成功获取用户配置:', data);
    return Object.assign({}, data, { email: user.email }) as UserProfile;
  } catch (error) {
    console.error('💥 [getCurrentUserProfile] 捕获异常:', error);
    // 捕获所有异常并返回null，避免页面崩溃
    return null;
  }
}

/**
 * 更新用户配置
 */
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  // 移除 email 字段，因为它不在数据库表中
  const updateData = { ...updates };
  if ('email' in updateData) {
    delete (updateData as { email?: string }).email;
  }
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updateData as never)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * 检查用户权限
 */
export async function checkUserRole(requiredRoles: UserRole[]): Promise<boolean> {
  const profile = await getCurrentUserProfile();
  if (!profile) return false;
  return requiredRoles.includes(profile.role);
}

/**
 * 检查是否为管理员
 */
export async function isAdmin(): Promise<boolean> {
  return checkUserRole(['admin']);
}

/**
 * 检查是否为编辑或管理员
 */
export async function canEdit(): Promise<boolean> {
  return checkUserRole(['admin', 'editor']);
}

/**
 * 重置密码请求
 */
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) throw error;
}

/**
 * 更新密码
 */
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
}

/**
 * 记录用户活动
 */
export async function logActivity(
  action: string,
  resourceType?: string,
  resourceId?: string,
  details?: Record<string, unknown>
) {
  try {
    const user = await getCurrentUser();
    
    const { error } = await supabase.from('activity_logs').insert({
      user_id: user?.id || null,
      action,
      resource_type: resourceType || null,
      resource_id: resourceId || null,
      details: details ? (details as never) : null,
    } as never);

    if (error) console.error('Failed to log activity:', error);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
