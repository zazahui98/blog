/**
 * 全站搜索功能
 * 支持搜索文章、项目和用户
 */

import { supabase } from './supabase-client';

// 搜索结果类型
export interface SearchResult {
  posts: PostSearchResult[];
  projects: ProjectSearchResult[];
  users: UserSearchResult[];
}

export interface PostSearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  created_at: string;
}

export interface ProjectSearchResult {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  tags: string[];
}

export interface UserSearchResult {
  id: string;
  username: string;
  avatar_url: string | null;
}

// 全站搜索
export async function searchAll(query: string): Promise<SearchResult> {
  if (!query.trim()) {
    return { posts: [], projects: [], users: [] };
  }

  const searchTerm = query.trim();

  const [postsResult, projectsResult, usersResult] = await Promise.all([
    // 搜索文章
    (supabase as any)
      .from('posts')
      .select('id, title, slug, excerpt, cover_image, created_at')
      .eq('is_published', true)
      .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .limit(5),

    // 搜索项目
    (supabase as any)
      .from('projects')
      .select('id, title, description, cover_image, tags')
      .eq('is_published', true)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .limit(5),

    // 搜索用户
    (supabase as any)
      .from('user_profiles')
      .select('id, username, avatar_url')
      .ilike('username', `%${searchTerm}%`)
      .limit(5),
  ]);

  return {
    posts: (postsResult.data || []) as PostSearchResult[],
    projects: (projectsResult.data || []) as ProjectSearchResult[],
    users: (usersResult.data || []) as UserSearchResult[],
  };
}

// 搜索文章
export async function searchPosts(query: string, limit: number = 10) {
  if (!query.trim()) return { data: [], error: null };

  const { data, error } = await (supabase as any)
    .from('posts')
    .select('id, title, slug, excerpt, cover_image, created_at, category')
    .eq('is_published', true)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data: data || [], error };
}

// 搜索项目
export async function searchProjectsOnly(query: string, limit: number = 10) {
  if (!query.trim()) return { data: [], error: null };

  const { data, error } = await (supabase as any)
    .from('projects')
    .select('id, title, description, cover_image, tags, stars, forks')
    .eq('is_published', true)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(limit);

  return { data: data || [], error };
}

// 获取搜索建议（热门搜索词）
export async function getSearchSuggestions() {
  // 这里可以从数据库获取热门搜索词
  // 暂时返回静态数据
  return [
    'React',
    'TypeScript',
    'Next.js',
    'Tailwind CSS',
    'Node.js',
    'Python',
    'Docker',
    'Kubernetes',
  ];
}
