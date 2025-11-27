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

// =====================================================
// 评论系统增强功能
// =====================================================

// 评论排序选项类型
export type CommentSortOption = 'newest' | 'hottest' | 'oldest';

// 评论举报类型
export interface CommentReport {
  id: string;
  comment_id: string;
  reporter_id: string;
  reason: string;
  description?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

// 评论编辑历史类型
export interface CommentEditHistory {
  id: string;
  comment_id: string;
  old_content: string;
  new_content: string;
  edited_by: string;
  edited_at: string;
}

// 获取评论（支持排序和过滤）
export async function getCommentsSorted(
  postId: string,
  sortBy: CommentSortOption = 'newest',
  filterAuthorReply: boolean = false
) {
  let query = (supabase as any)
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .eq('is_approved', true);

  // 应用过滤
  if (filterAuthorReply) {
    query = query.eq('is_author_reply', true);
  }

  // 应用排序
  switch (sortBy) {
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'hottest':
      query = query.order('helpful_count', { ascending: false });
      break;
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;
  }

  const { data, error } = await query;
  return { data, error };
}

// 举报评论
export async function reportComment(
  commentId: string,
  reporterId: string,
  reason: string,
  description?: string
) {
  const { data, error } = await (supabase as any)
    .from('comment_reports')
    .insert({
      comment_id: commentId,
      reporter_id: reporterId,
      reason,
      description,
    });

  // 更新评论的举报计数
  if (!error) {
    // 先获取当前举报数，然后+1
    const { data: currentComment } = await (supabase as any)
      .from('comments')
      .select('report_count')
      .eq('id', commentId)
      .single();
    
    const currentCount = currentComment?.report_count || 0;
    await (supabase as any)
      .from('comments')
      .update({ report_count: currentCount + 1 })
      .eq('id', commentId);
  }

  return { data, error };
}

// 编辑评论
export async function editComment(
  commentId: string,
  newContent: string,
  userId: string
) {
  // 获取旧内容
  const { data: oldComment } = await (supabase as any)
    .from('comments')
    .select('content')
    .eq('id', commentId)
    .single();

  if (oldComment) {
    // 记录编辑历史
    await (supabase as any).from('comment_edit_history').insert({
      comment_id: commentId,
      old_content: oldComment.content,
      new_content: newContent,
      edited_by: userId,
    });
  }

  // 更新评论
  const { data, error } = await (supabase as any)
    .from('comments')
    .update({
      content: newContent,
      is_edited: true,
      edited_at: new Date().toISOString(),
    })
    .eq('id', commentId);

  return { data, error };
}

// 获取评论编辑历史
export async function getCommentEditHistory(commentId: string) {
  const { data, error } = await (supabase as any)
    .from('comment_edit_history')
    .select('*')
    .eq('comment_id', commentId)
    .order('edited_at', { ascending: false });

  return { data: data as CommentEditHistory[] | null, error };
}

// 获取评论举报列表（管理员用）
export async function getCommentReports(status?: string) {
  let query = (supabase as any)
    .from('comment_reports')
    .select(`
      *,
      comments (
        id,
        content,
        author_name
      )
    `)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  return { data: data as CommentReport[] | null, error };
}

// 处理评论举报
export async function resolveCommentReport(
  reportId: string,
  status: 'resolved' | 'dismissed',
  resolvedBy: string
) {
  const { data, error } = await (supabase as any)
    .from('comment_reports')
    .update({
      status,
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', reportId);

  return { data, error };
}

// 标记评论为作者回复
export async function markAsAuthorReply(commentId: string, isAuthorReply: boolean) {
  const { data, error } = await (supabase as any)
    .from('comments')
    .update({ is_author_reply: isAuthorReply })
    .eq('id', commentId);

  return { data, error };
}



// =====================================================
// 工具系统增强功能
// =====================================================

// 工具使用统计类型
export interface ToolUsageStat {
  id: string;
  tool_id: string;
  user_id: string;
  usage_count: number;
  last_used_at: string;
  created_at: string;
}

// 工具收藏类型
export interface ToolFavorite {
  id: string;
  tool_id: string;
  user_id: string;
  created_at: string;
}

// 工具全局统计类型
export interface ToolGlobalStat {
  id: string;
  tool_id: string;
  total_usage: number;
  unique_users: number;
  favorite_count: number;
  last_used_at: string | null;
  updated_at: string;
}

// 记录工具使用
export async function recordToolUsage(toolId: string, userId: string) {
  // 检查是否已有记录
  const { data: existing } = await (supabase as any)
    .from('tool_usage_stats')
    .select('id, usage_count')
    .eq('tool_id', toolId)
    .eq('user_id', userId)
    .single();

  if (existing) {
    // 更新使用次数
    const { data, error } = await (supabase as any)
      .from('tool_usage_stats')
      .update({
        usage_count: existing.usage_count + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
    return { data, error };
  } else {
    // 创建新记录
    const { data, error } = await (supabase as any)
      .from('tool_usage_stats')
      .insert({
        tool_id: toolId,
        user_id: userId,
        usage_count: 1,
      });
    return { data, error };
  }
}

// 收藏工具
export async function favoriteTool(toolId: string, userId: string) {
  const { data, error } = await (supabase as any)
    .from('tool_favorites')
    .insert({
      tool_id: toolId,
      user_id: userId,
    });
  return { data, error };
}

// 取消收藏工具
export async function unfavoriteTool(toolId: string, userId: string) {
  const { data, error } = await (supabase as any)
    .from('tool_favorites')
    .delete()
    .eq('tool_id', toolId)
    .eq('user_id', userId);
  return { data, error };
}

// 检查工具是否已收藏
export async function checkToolFavorite(toolId: string, userId: string) {
  const { data, error } = await (supabase as any)
    .from('tool_favorites')
    .select('id')
    .eq('tool_id', toolId)
    .eq('user_id', userId)
    .maybeSingle();
  return { isFavorited: !!data, error };
}

// 获取用户收藏的工具列表
export async function getUserFavoriteTools(userId: string) {
  const { data, error } = await (supabase as any)
    .from('tool_favorites')
    .select('tool_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data: data as { tool_id: string; created_at: string }[] | null, error };
}

// 获取用户的工具使用历史
export async function getUserToolHistory(userId: string) {
  const { data, error } = await (supabase as any)
    .from('tool_usage_stats')
    .select('tool_id, usage_count, last_used_at')
    .eq('user_id', userId)
    .order('last_used_at', { ascending: false });
  return { data: data as ToolUsageStat[] | null, error };
}

// 获取工具全局统计（管理员用）
export async function getToolGlobalStats() {
  const { data, error } = await (supabase as any)
    .from('tool_global_stats')
    .select('*')
    .order('total_usage', { ascending: false });
  return { data: data as ToolGlobalStat[] | null, error };
}

// 获取热门工具排行
export async function getPopularTools(limit: number = 5) {
  const { data, error } = await (supabase as any)
    .from('tool_global_stats')
    .select('tool_id, total_usage, favorite_count')
    .order('total_usage', { ascending: false })
    .limit(limit);
  return { data, error };
}


// =====================================================
// 项目管理增强功能
// =====================================================

// 项目排序选项类型
export type ProjectSortOption = 'latest' | 'stars' | 'trending';

// 搜索项目
export async function searchProjects(query: string) {
  const { data, error } = await (supabase as any)
    .from('projects')
    .select('*')
    .eq('is_published', true)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,title_en.ilike.%${query}%,description_en.ilike.%${query}%`)
    .order('order_index');
  
  return { data: data as Project[] | null, error };
}

// 按标签筛选项目
export async function filterProjectsByTags(tags: string[]) {
  const { data, error } = await (supabase as any)
    .from('projects')
    .select('*')
    .eq('is_published', true)
    .contains('tags', tags)
    .order('order_index');
  
  return { data: data as Project[] | null, error };
}

// 获取排序后的项目
export async function getProjectsSorted(sortBy: ProjectSortOption = 'latest') {
  let query = (supabase as any)
    .from('projects')
    .select('*')
    .eq('is_published', true);

  switch (sortBy) {
    case 'latest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'stars':
      query = query.order('stars', { ascending: false });
      break;
    case 'trending':
      // 按更新时间排序（最近更新的项目更热门）
      query = query.order('updated_at', { ascending: false });
      break;
  }

  const { data, error } = await query;
  return { data: data as Project[] | null, error };
}

// 获取所有项目标签（用于筛选面板）
export async function getAllProjectTags() {
  const { data, error } = await (supabase as any)
    .from('projects')
    .select('tags')
    .eq('is_published', true);

  if (error || !data) return { tags: [], error };

  // 提取所有唯一标签
  const allTags = new Set<string>();
  data.forEach((project: { tags: string[] }) => {
    project.tags?.forEach(tag => allTags.add(tag));
  });

  return { tags: Array.from(allTags).sort(), error: null };
}

// 综合搜索、筛选和排序项目
export async function getProjectsAdvanced(options: {
  query?: string;
  tags?: string[];
  sortBy?: ProjectSortOption;
}) {
  const { query, tags, sortBy = 'latest' } = options;

  let dbQuery = (supabase as any)
    .from('projects')
    .select('*')
    .eq('is_published', true);

  // 应用搜索
  if (query && query.trim()) {
    dbQuery = dbQuery.or(
      `title.ilike.%${query}%,description.ilike.%${query}%,title_en.ilike.%${query}%,description_en.ilike.%${query}%`
    );
  }

  // 应用标签筛选
  if (tags && tags.length > 0) {
    dbQuery = dbQuery.contains('tags', tags);
  }

  // 应用排序
  switch (sortBy) {
    case 'latest':
      dbQuery = dbQuery.order('created_at', { ascending: false });
      break;
    case 'stars':
      dbQuery = dbQuery.order('stars', { ascending: false });
      break;
    case 'trending':
      dbQuery = dbQuery.order('updated_at', { ascending: false });
      break;
  }

  const { data, error } = await dbQuery;
  return { data: data as Project[] | null, error };
}


// =====================================================
// 通知系统功能
// =====================================================

// 通知类型
export interface Notification {
  id: string;
  user_id: string;
  type: 'comment_reply' | 'article_update' | 'system' | 'mention';
  title: string;
  content: string | null;
  related_type: 'post' | 'comment' | 'project' | null;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

// 获取用户通知列表
export async function getUserNotifications(
  userId: string,
  options?: { unreadOnly?: boolean; limit?: number }
) {
  let query = (supabase as any)
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options?.unreadOnly) {
    query = query.eq('is_read', false);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  return { data: data as Notification[] | null, error };
}

// 获取未读通知数量
export async function getUnreadNotificationCount(userId: string) {
  const { count, error } = await (supabase as any)
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  return { count: count || 0, error };
}

// 标记通知为已读
export async function markNotificationAsRead(notificationId: string) {
  const { data, error } = await (supabase as any)
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  return { data, error };
}

// 标记所有通知为已读
export async function markAllNotificationsAsRead(userId: string) {
  const { data, error } = await (supabase as any)
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  return { data, error };
}

// 发送通知
export async function sendNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  content?: string,
  relatedType?: Notification['related_type'],
  relatedId?: string
) {
  const { data, error } = await (supabase as any)
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      content,
      related_type: relatedType,
      related_id: relatedId,
    });

  return { data, error };
}

// 删除通知
export async function deleteNotification(notificationId: string) {
  const { data, error } = await (supabase as any)
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  return { data, error };
}


// =====================================================
// 用户功能增强
// =====================================================

// 书签类型
export interface ArticleBookmark {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

// 阅读历史类型
export interface ReadingHistory {
  id: string;
  post_id: string;
  user_id: string;
  read_at: string;
  reading_time: number;
  progress: number;
}

// 添加书签
export async function addBookmark(postId: string, userId: string) {
  const { data, error } = await (supabase as any)
    .from('article_bookmarks')
    .insert({ post_id: postId, user_id: userId });
  return { data, error };
}

// 移除书签
export async function removeBookmark(postId: string, userId: string) {
  const { data, error } = await (supabase as any)
    .from('article_bookmarks')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);
  return { data, error };
}

// 检查是否已收藏
export async function checkBookmark(postId: string, userId: string) {
  const { data, error } = await (supabase as any)
    .from('article_bookmarks')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();
  return { isBookmarked: !!data, error };
}

// 获取用户书签列表
export async function getUserBookmarks(userId: string) {
  const { data, error } = await (supabase as any)
    .from('article_bookmarks')
    .select(`
      id,
      created_at,
      posts (
        id,
        title,
        slug,
        excerpt,
        cover_image,
        created_at
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}

// 记录阅读历史
export async function recordReadingHistory(
  postId: string, 
  userId: string,
  readingTime?: number,
  progress?: number
) {
  // 检查是否已有记录
  const { data: existing } = await (supabase as any)
    .from('reading_history')
    .select('id, reading_time')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    // 更新记录
    const { data, error } = await (supabase as any)
      .from('reading_history')
      .update({
        read_at: new Date().toISOString(),
        reading_time: (existing.reading_time || 0) + (readingTime || 0),
        progress: progress || existing.progress,
      })
      .eq('id', existing.id);
    return { data, error };
  } else {
    // 创建新记录
    const { data, error } = await (supabase as any)
      .from('reading_history')
      .insert({
        post_id: postId,
        user_id: userId,
        reading_time: readingTime || 0,
        progress: progress || 0,
      });
    return { data, error };
  }
}

// 获取用户阅读历史
export async function getUserReadingHistory(userId: string, limit: number = 20) {
  const { data, error } = await (supabase as any)
    .from('reading_history')
    .select(`
      id,
      read_at,
      reading_time,
      progress,
      posts (
        id,
        title,
        slug,
        excerpt,
        cover_image
      )
    `)
    .eq('user_id', userId)
    .order('read_at', { ascending: false })
    .limit(limit);
  return { data, error };
}

// 清除阅读历史
export async function clearReadingHistory(userId: string) {
  const { data, error } = await (supabase as any)
    .from('reading_history')
    .delete()
    .eq('user_id', userId);
  return { data, error };
}


// =====================================================
// 公告系统功能
// =====================================================

// 公告类型（支持新旧字段名）
export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_active: boolean;
  is_dismissible: boolean;
  // 新字段名
  start_date?: string | null;
  end_date?: string | null;
  target_audience?: 'all' | 'users' | 'guests';
  click_count?: number;
  // 旧字段名（兼容）
  start_time?: string | null;
  end_time?: string | null;
  link_url?: string | null;
  link_text?: string | null;
  priority: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// 获取当前有效的公告
export async function getActiveAnnouncements(userId?: string) {
  let query = (supabase as any)
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: false });

  const { data: announcements, error } = await query;
  
  if (error || !announcements) return { data: [], error };

  // 过滤掉未开始或已过期的公告
  let filtered = announcements.filter((a: any) => {
    const now = new Date();
    // 支持新旧字段名
    const startDate = a.start_date || a.start_time;
    const endDate = a.end_date || a.end_time;
    const startOk = !startDate || new Date(startDate) <= now;
    const endOk = !endDate || new Date(endDate) >= now;
    return startOk && endOk;
  });

  // 如果有用户ID，过滤掉用户已关闭的公告
  if (userId) {
    const { data: views } = await (supabase as any)
      .from('announcement_views')
      .select('announcement_id')
      .eq('user_id', userId);
    
    const viewedIds = new Set((views || []).map((v: any) => v.announcement_id));
    filtered = filtered.filter((a: any) => !viewedIds.has(a.id));
  }

  return { data: filtered as Announcement[], error: null };
}

// 获取所有公告（管理员用）
export async function getAllAnnouncements() {
  const { data, error } = await (supabase as any)
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });
  return { data: data as Announcement[] | null, error };
}

// 创建公告
export async function createAnnouncement(announcement: Partial<Announcement>) {
  const { data, error } = await (supabase as any)
    .from('announcements')
    .insert(announcement)
    .select()
    .single();
  return { data, error };
}

// 更新公告
export async function updateAnnouncement(id: string, announcement: Partial<Announcement>) {
  const { data, error } = await (supabase as any)
    .from('announcements')
    .update(announcement)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

// 删除公告
export async function deleteAnnouncement(id: string) {
  const { data, error } = await (supabase as any)
    .from('announcements')
    .delete()
    .eq('id', id);
  return { data, error };
}

// 关闭公告（用户操作）
export async function dismissAnnouncement(announcementId: string, userId: string) {
  const { data, error } = await (supabase as any)
    .from('announcement_views')
    .insert({
      announcement_id: announcementId,
      user_id: userId,
    });
  return { data, error };
}

// 推送通知给所有用户
export async function pushNotificationToAll(
  type: Notification['type'],
  title: string,
  content?: string,
  relatedType?: Notification['related_type'],
  relatedId?: string
) {
  // 获取所有用户
  const { data: users } = await (supabase as any)
    .from('user_profiles')
    .select('id');

  if (!users || users.length === 0) return { success: false, count: 0 };

  // 批量创建通知
  const notifications = users.map((user: { id: string }) => ({
    user_id: user.id,
    type,
    title,
    content,
    related_type: relatedType,
    related_id: relatedId,
  }));

  const { error } = await (supabase as any)
    .from('notifications')
    .insert(notifications);

  return { success: !error, count: users.length, error };
}

// 推送通知给指定用户组
export async function pushNotificationToUsers(
  userIds: string[],
  type: Notification['type'],
  title: string,
  content?: string,
  relatedType?: Notification['related_type'],
  relatedId?: string
) {
  const notifications = userIds.map(userId => ({
    user_id: userId,
    type,
    title,
    content,
    related_type: relatedType,
    related_id: relatedId,
  }));

  const { error } = await (supabase as any)
    .from('notifications')
    .insert(notifications);

  return { success: !error, count: userIds.length, error };
}
