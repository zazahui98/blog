# 详细实现指南

## 📌 快速导航

- [第一阶段：评论系统](#第一阶段评论系统增强)
- [第二阶段：工具系统](#第二阶段工具系统增强)
- [第三阶段：项目管理](#第三阶段项目管理增强)
- [第四阶段：搜索SEO](#第四阶段搜索和seo)
- [第五阶段：监控分析](#第五阶段监控和分析)
- [第六阶段：通知系统](#第六阶段通知系统)
- [第七阶段：用户功能](#第七阶段用户功能增强)
- [第八阶段：内容增强](#第八阶段内容增强)
- [第九阶段：性能优化](#第九阶段性能优化)
- [第十阶段：安全加固](#第十阶段安全加固)

---

## 第一阶段：评论系统增强

### 1.1 评论排序功能

**需要修改的文件**:
- `components/CommentList.tsx` - 添加排序选项
- `lib/supabase-helpers.ts` - 添加排序查询函数

**实现步骤**:
1. 在 CommentList 组件顶部添加排序按钮组
2. 根据选择的排序方式调整查询
3. 支持三种排序: 最新、最热、最早

**代码示例**:
```typescript
// 排序选项
type SortOption = 'newest' | 'hottest' | 'oldest';

// 查询函数
export async function getCommentsSorted(
  postId: string,
  sortBy: SortOption = 'newest'
) {
  let query = supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .eq('is_approved', true);

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

  return query;
}
```

### 1.2 评论过滤功能

**实现步骤**:
1. 添加过滤按钮 (仅显示作者回复)
2. 修改查询条件

**代码示例**:
```typescript
export async function getCommentsFiltered(
  postId: string,
  filterAuthorReply: boolean = false
) {
  let query = supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .eq('is_approved', true);

  if (filterAuthorReply) {
    query = query.eq('is_author_reply', true);
  }

  return query;
}
```

### 1.3 评论举报功能

**需要创建的文件**:
- `components/CommentReportModal.tsx` - 举报对话框

**实现步骤**:
1. 在每条评论旁添加举报按钮
2. 点击打开举报对话框
3. 提交举报到数据库

**代码示例**:
```typescript
// components/CommentReportModal.tsx
export default function CommentReportModal({
  commentId,
  onClose,
}: {
  commentId: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('comment_reports')
      .insert({
        comment_id: commentId,
        reporter_id: user?.id,
        reason,
      });

    if (!error) {
      message.success('举报成功');
      onClose();
    }
    setLoading(false);
  };

  return (
    // 举报对话框 UI
  );
}
```

### 1.4 评论编辑功能

**实现步骤**:
1. 在用户自己的评论上显示编辑按钮
2. 点击进入编辑模式
3. 保存编辑并记录历史

**代码示例**:
```typescript
export async function editComment(
  commentId: string,
  newContent: string,
  userId: string
) {
  // 获取旧内容
  const { data: oldComment } = await supabase
    .from('comments')
    .select('content')
    .eq('id', commentId)
    .single();

  // 记录编辑历史
  await supabase.from('comment_edit_history').insert({
    comment_id: commentId,
    old_content: oldComment?.content,
    new_content: newContent,
    edited_by: userId,
  });

  // 更新评论
  return supabase
    .from('comments')
    .update({
      content: newContent,
      is_edited: true,
      edited_at: new Date().toISOString(),
    })
    .eq('id', commentId);
}
```

### 1.5 评论线程折叠

**实现步骤**:
1. 添加折叠/展开按钮
2. 使用状态管理折叠状态
3. 动画展开/折叠

---

## 第二阶段：工具系统增强

### 2.1 工具收藏功能

**实现步骤**:
1. 在工具页面添加收藏按钮
2. 点击收藏/取消收藏
3. 收藏的工具在工具箱内展示在前排

**代码示例**:
```typescript
// 收藏工具
export async function favoriteToolexport async function favoriteTool(
  toolId: string,
  userId: string
) {
  return supabase.from('tool_favorites').insert({
    tool_id: toolId,
    user_id: userId,
  });
}

// 取消收藏
export async function unfavoriteTool(
  toolId: string,
  userId: string
) {
  return supabase
    .from('tool_favorites')
    .delete()
    .eq('tool_id', toolId)
    .eq('user_id', userId);
}

// 获取用户收藏的工具
export async function getUserFavoriteTools(userId: string) {
  return supabase
    .from('tool_favorites')
    .select('tool_id')
    .eq('user_id', userId);
}
```

### 2.2 工具使用统计

**实现步骤**:
1. 每次使用工具时记录统计
2. 在后台管理显示统计数据
3. 显示热门工具排行

**代码示例**:
```typescript
// 记录工具使用
export async function recordToolUsage(
  toolId: string,
  userId?: string
) {
  const { data: existing } = await supabase
    .from('tool_usage_stats')
    .select('id, usage_count')
    .eq('tool_id', toolId)
    .eq('user_id', userId)
    .single();

  if (existing) {
    return supabase
      .from('tool_usage_stats')
      .update({
        usage_count: existing.usage_count + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    return supabase.from('tool_usage_stats').insert({
      tool_id: toolId,
      user_id: userId,
      usage_count: 1,
    });
  }
}

// 获取工具统计
export async function getToolStats() {
  return supabase
    .from('tool_usage_stats')
    .select('tool_id, usage_count, last_used_at')
    .order('usage_count', { ascending: false });
}
```

---

## 第三阶段：项目管理增强

### 3.1 项目搜索功能

**实现步骤**:
1. 在项目列表顶部添加搜索框
2. 实时搜索项目名称和描述
3. 显示搜索结果

**代码示例**:
```typescript
export async function searchProjects(query: string) {
  return supabase
    .from('projects')
    .select('*')
    .or(
      `title.ilike.%${query}%,description.ilike.%${query}%`
    )
    .eq('is_published', true);
}
```

### 3.2 项目筛选功能

**实现步骤**:
1. 添加筛选面板
2. 支持按标签、语言等筛选
3. 支持多选筛选

**代码示例**:
```typescript
export async function filterProjects(
  tags?: string[],
  language?: string
) {
  let query = supabase
    .from('projects')
    .select('*')
    .eq('is_published', true);

  if (tags && tags.length > 0) {
    query = query.contains('tags', tags);
  }

  if (language) {
    query = query.contains('tags', [language]);
  }

  return query;
}
```

### 3.3 项目排序功能

**实现步骤**:
1. 添加排序选项按钮
2. 支持按热度、时间、星数排序

**代码示例**:
```typescript
type ProjectSortOption = 'trending' | 'latest' | 'stars';

export async function getProjectsSorted(
  sortBy: ProjectSortOption = 'latest'
) {
  let query = supabase
    .from('projects')
    .select('*')
    .eq('is_published', true);

  switch (sortBy) {
    case 'trending':
      // 基于最近的浏览量
      query = query.order('updated_at', { ascending: false });
      break;
    case 'latest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'stars':
      query = query.order('stars', { ascending: false });
      break;
  }

  return query;
}
```

---

## 第四阶段：搜索和SEO

### 4.1 全站搜索实现

**需要创建的文件**:
- `app/search/page.tsx` - 搜索结果页面
- `lib/search.ts` - 搜索函数

**实现步骤**:
1. 创建搜索 API 路由
2. 创建搜索结果页面
3. 在导航栏添加搜索框

**代码示例**:
```typescript
// lib/search.ts
export async function searchAll(query: string) {
  const [posts, projects, users] = await Promise.all([
    supabase
      .from('posts')
      .select('id, title, slug, excerpt, cover_image')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(5),
    supabase
      .from('projects')
      .select('id, title, description, cover_image')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(5),
    supabase
      .from('user_profiles')
      .select('id, username, avatar_url')
      .ilike('username', `%${query}%`)
      .limit(5),
  ]);

  return { posts: posts.data, projects: projects.data, users: users.data };
}
```

### 4.2 SEO 优化

**需要安装**:
```bash
npm install next-seo
```

**实现步骤**:
1. 在 `_app.tsx` 配置 DefaultSeo
2. 为每个页面添加动态 Meta 标签
3. 生成 Sitemap
4. 添加 robots.txt

**代码示例**:
```typescript
// next-seo.config.ts
export default {
  titleTemplate: '%s | ErGou Blog',
  defaultTitle: 'ErGou Blog - 技术博客',
  description: '分享技术知识，探索编程世界',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://yourdomain.com',
    siteName: 'ErGou Blog',
  },
};

// app/blog/[slug]/page.tsx
import { NextSeo } from 'next-seo';

export default function BlogPost({ post }) {
  return (
    <>
      <NextSeo
        title={post.title}
        description={post.excerpt}
        openGraph={{
          title: post.title,
          description: post.excerpt,
          images: [{ url: post.cover_image }],
        }}
      />
      {/* 页面内容 */}
    </>
  );
}
```

---

## 第五阶段：监控和分析

### 5.1 集成 Sentry

**需要安装**:
```bash
npm install @sentry/nextjs
```

**实现步骤**:
1. 初始化 Sentry
2. 配置错误捕获
3. 在后台查看错误日志

**代码示例**:
```typescript
// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### 5.2 集成 LogRocket

**需要安装**:
```bash
npm install logrocket
```

**实现步骤**:
1. 初始化 LogRocket
2. 记录用户行为
3. 在后台查看用户会话

**代码示例**:
```typescript
// lib/logrocket.ts
import LogRocket from 'logrocket';

export function initLogRocket() {
  if (typeof window !== 'undefined') {
    LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET_ID);
  }
}
```

---

## 第六阶段：通知系统

### 6.1 站内消息通知

**实现步骤**:
1. 创建通知表
2. 在导航栏添加通知铃铛
3. 创建通知中心页面

**代码示例**:
```typescript
// 发送通知
export async function sendNotification(
  userId: string,
  type: string,
  title: string,
  content: string,
  relatedId?: string
) {
  return supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    content,
    related_id: relatedId,
  });
}

// 获取未读通知
export async function getUnreadNotifications(userId: string) {
  return supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('is_read', false)
    .order('created_at', { ascending: false });
}
```

---

## 第七阶段：用户功能增强

### 7.1 文章书签功能

**实现步骤**:
1. 在文章页面添加书签按钮
2. 保存书签到数据库
3. 在用户个人中心显示书签列表

**代码示例**:
```typescript
// 添加书签
export async function bookmarkArticle(
  postId: string,
  userId: string
) {
  return supabase.from('article_bookmarks').insert({
    post_id: postId,
    user_id: userId,
  });
}

// 获取用户书签
export async function getUserBookmarks(userId: string) {
  return supabase
    .from('article_bookmarks')
    .select('posts(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}
```

---

## 第八阶段：内容增强

### 8.1 代码高亮主题切换

**实现步骤**:
1. 在用户设置中添加主题选择
2. 保存用户偏好
3. 应用到所有代码块

**支持的主题**:
- Dracula
- Nord
- Monokai
- GitHub Light
- GitHub Dark

---

## 第九阶段：性能优化

### 9.1 代码重复提取

**需要创建的文件**:
- `components/FormField.tsx` - 通用表单字段
- `hooks/useFormValidation.ts` - 表单验证 hook
- `components/ToolCard.tsx` - 工具卡片组件

### 9.2 数据库查询优化

**优化策略**:
1. 使用 JOIN 替代多次查询
2. 实现查询缓存
3. 使用数据库索引

### 9.3 图片优化

**实现步骤**:
1. 使用 Next.js Image 组件
2. 实现图片懒加载
3. 使用 WebP 格式

---

## 第十阶段：安全加固

### 10.1 输入验证

**需要安装**:
```bash
npm install zod
```

**实现步骤**:
1. 为所有表单创建验证 schema
2. 在提交前验证
3. 显示验证错误

**代码示例**:
```typescript
// lib/validation.ts
import { z } from 'zod';

export const CommentSchema = z.object({
  content: z.string()
    .min(1, '评论不能为空')
    .max(5000, '评论不能超过5000字'),
  post_id: z.string().uuid('无效的文章ID'),
});

export type Comment = z.infer<typeof CommentSchema>;
```

### 10.2 XSS 防护

**需要安装**:
```bash
npm install dompurify
```

**实现步骤**:
1. 清理用户输入的 HTML
2. 使用 Content Security Policy

**代码示例**:
```typescript
import DOMPurify from 'dompurify';

export function sanitizeHTML(html: string) {
  return DOMPurify.sanitize(html);
}
```

---

## 🎯 总结

这份实现指南提供了每个阶段的详细步骤和代码示例。

**建议的开发顺序**:
1. 先完成第一阶段（评论系统）
2. 再完成第四阶段（搜索和SEO）
3. 然后完成第九和第十阶段（性能和安全）
4. 最后完成其他功能

**需要确认**:
- 是否同意这个实现顺序？
- 是否需要调整任何功能的优先级？
- 是否有其他技术选型的建议？
