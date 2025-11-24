/**
 * Supabase 辅助函数和类型
 * 用于处理新增表的类型问题
 */

import { supabase } from './supabase-client';

// 网站设置类型
export interface SiteSetting {
  id: string;
  key: string;
  value: any;
  description: string | null;
  updated_at: string;
  updated_by: string | null;
}

// 项目类型
export interface Project {
  id: string;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  content: string | null;
  cover_image: string;
  tags: string[];
  github_url: string | null;
  demo_url: string | null;
  stars: number;
  forks: number;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// 技能类型（带颜色字段）
export interface Skill {
  name: string;
  level: number;
  color?: string; // 可选颜色字段，如："cyan", "blue", "green", "purple", "orange", "red"
}

// 统计类型
export interface Stat {
  icon: string;
  value: string;
  label: string;
}

// 关于我设置类型
export interface AboutSetting {
  id: string;
  avatar_icon: string;
  intro: string;
  skills: Skill[];
  stats: Stat[];
  philosophies: any;
  updated_at: string;
}

// 辅助函数：获取网站设置
export async function getSiteSettings() {
  const { data, error } = await (supabase as any)
    .from('site_settings')
    .select('*');
  
  return { data: data as SiteSetting[] | null, error };
}

// 辅助函数：更新网站设置
export async function upsertSiteSetting(setting: Partial<SiteSetting>) {
  const { data, error } = await (supabase as any)
    .from('site_settings')
    .upsert(setting);
  
  return { data, error };
}

// 辅助函数：获取项目列表
export async function getProjects(publishedOnly = false) {
  let query = (supabase as any).from('projects').select('*').order('order_index');
  
  if (publishedOnly) {
    query = query.eq('is_published', true);
  }
  
  const { data, error } = await query;
  return { data: data as Project[] | null, error };
}

// 辅助函数：创建项目
export async function createProject(project: Partial<Project>) {
  const { data, error } = await (supabase as any)
    .from('projects')
    .insert([project]);
  
  return { data, error };
}

// 辅助函数：更新项目
export async function updateProject(id: string, project: Partial<Project>) {
  const { data, error } = await (supabase as any)
    .from('projects')
    .update(project)
    .eq('id', id);
  
  return { data, error };
}

// 辅助函数：删除项目
export async function deleteProject(id: string) {
  const { data, error } = await (supabase as any)
    .from('projects')
    .delete()
    .eq('id', id);
  
  return { data, error };
}

// 辅助函数：获取关于我设置
export async function getAboutSettings() {
  const { data, error } = await (supabase as any)
    .from('about_settings')
    .select('*')
    .single();
  
  return { data: data as AboutSetting | null, error };
}

// 辅助函数：更新关于我设置
export async function updateAboutSettings(id: string, settings: Partial<AboutSetting>) {
  const { data, error } = await (supabase as any)
    .from('about_settings')
    .update(settings)
    .eq('id', id);
  
  return { data, error };
}

// 辅助函数：创建关于我设置
export async function createAboutSettings(settings: Partial<AboutSetting>) {
  const { data, error } = await (supabase as any)
    .from('about_settings')
    .insert(settings);
  
  return { data, error };
}

