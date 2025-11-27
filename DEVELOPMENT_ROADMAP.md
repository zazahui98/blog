# 博客系统开发路线图 - 优先级功能实现计划

**文档版本**: 1.0  
**创建日期**: 2025年11月27日  
**目标**: 系统化实现用户提出的所有功能需求

---

## 📋 功能需求总览

### 第一阶段：评论系统增强 (优先级: 🔴 高) ✅ 已完成
- [x] 评论排序功能 (最新/最热/最早)
- [x] 评论过滤功能 (仅显示作者回复)
- [x] 评论举报功能
- [x] 评论编辑功能
- [x] 评论线程折叠功能

### 第二阶段：工具系统增强 (优先级: 🟠 中) ✅ 已完成
- [x] 工具使用统计 (后台管理展示)
- [x] 工具小红心收藏功能
- [x] 工具使用历史记录
- [x] 收藏的工具在工具箱内展示在前排

### 第三阶段：项目管理增强 (优先级: 🟠 中) ✅ 已完成
- [x] 项目搜索功能
- [x] 项目筛选功能 (按标签、语言等)
- [x] 项目排序功能 (热度、时间、星数)

### 第四阶段：搜索和SEO (优先级: 🔴 高) ✅ 已完成
- [x] 全站搜索功能 (Supabase 全文搜索)
- [x] SEO 优化 (SEO 配置模块)
- [x] 动态 Meta 标签生成
- [x] Sitemap 生成
- [x] Schema.org 结构化数据

### 第五阶段：监控和分析 (优先级: 🟠 中)
- [ ] 集成 Sentry 错误追踪
- [ ] 集成 LogRocket 用户行为分析
- [ ] 文章热度分析
- [ ] 用户行为分析
- [ ] 流量来源分析

### 第六阶段：通知系统 (优先级: 🟠 中) ✅ 已完成
- [x] 站内消息通知
- [x] 评论回复通知
- [x] 文章更新通知
- [x] 文章点赞通知（自动触发）
- [x] 评论点赞通知（自动触发）
- [x] 新评论通知（自动触发）
- [x] 通知管理后台
- [x] 用户通知中心页面

### 第七阶段：用户功能增强 (优先级: 🟡 低) ✅ 已完成
- [x] 文章书签功能
- [x] 文章收藏功能
- [x] 阅读历史记录

### 第八阶段：内容增强 (优先级: 🟡 低) 🔄 部分完成
- [ ] 文章版本历史
- [ ] 代码高亮主题切换
- [x] 文章目录自动生成 (TableOfContents组件)

### 第九阶段：性能优化 (优先级: 🔴 高) 🔄 部分完成
- [x] 代码重复提取为通用组件 (FormField)
- [x] 表单验证逻辑统一 (useFormValidation)
- [ ] 数据库查询优化 (N+1 问题)
- [ ] 数据缓存策略
- [x] 图片懒加载 (LazyImage组件)
- [ ] 代码分割优化
- [x] 骨架屏加载 (Skeleton组件)
- [ ] 渐进式加载

### 第十阶段：安全加固 (优先级: 🔴 高) ✅ 部分完成
- [ ] CSRF 保护 (需要配置中间件)
- [x] 速率限制 (rate-limit.ts)
- [x] 输入验证 (validation.ts)
- [x] XSS 防护 (escapeHtml函数)

---

## 🎯 详细实现计划

### 第一阶段：评论系统增强

#### 1.1 数据库扩展
```sql
-- 添加评论排序和过滤字段
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_author_reply BOOLEAN DEFAULT FALSE;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP;

-- 创建评论举报表
CREATE TABLE IF NOT EXISTS comment_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, resolved, dismissed
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建评论编辑历史表
CREATE TABLE IF NOT EXISTS comment_edit_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  old_content TEXT,
  new_content TEXT,
  edited_by UUID REFERENCES auth.users(id),
  edited_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.2 前端组件更新
- 更新 `CommentList.tsx` 添加排序选项
- 更新 `CommentForm.tsx` 添加编辑功能
- 创建 `CommentReportModal.tsx` 举报组件
- 创建 `CommentFilter.tsx` 过滤组件

#### 1.3 API 路由
- `POST /api/comments/[id]/report` - 举报评论
- `PUT /api/comments/[id]` - 编辑评论
- `GET /api/comments?sort=newest|hottest|oldest&filter=author_reply` - 获取评论

---

### 第二阶段：工具系统增强

#### 2.1 数据库扩展
```sql
-- 创建工具使用统计表
CREATE TABLE IF NOT EXISTS tool_usage_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  usage_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tool_id, user_id)
);

-- 创建工具收藏表
CREATE TABLE IF NOT EXISTS tool_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tool_id, user_id)
);
```

#### 2.2 前端功能
- 在工具页面添加收藏按钮
- 收藏的工具在工具箱内展示在前排
- 在后台管理添加工具使用统计仪表板

#### 2.3 API 路由
- `POST /api/tools/[id]/favorite` - 收藏工具
- `DELETE /api/tools/[id]/favorite` - 取消收藏
- `GET /api/admin/tools/stats` - 获取工具统计

---

### 第三阶段：项目管理增强

#### 3.1 前端功能
- 在项目列表添加搜索框
- 添加筛选面板 (按标签、语言、状态)
- 添加排序选项 (热度、时间、星数)

#### 3.2 API 路由
- `GET /api/projects/search?q=keyword` - 搜索项目
- `GET /api/projects/filter?tags=tag1,tag2&language=js` - 筛选项目
- `GET /api/projects?sort=trending|latest|stars` - 排序项目

---

### 第四阶段：搜索和SEO

#### 4.1 全站搜索实现
```typescript
// lib/search.ts
export async function searchContent(query: string, type?: 'posts' | 'projects' | 'all') {
  // 使用 Supabase 全文搜索
  // 返回文章、项目、用户等搜索结果
}
```

#### 4.2 SEO 优化
- 集成 next-seo 库
- 为每个页面生成动态 Meta 标签
- 生成 Sitemap
- 添加 robots.txt
- 添加 Schema.org 结构化数据

#### 4.3 新增页面
- `/search` - 搜索结果页面

---

### 第五阶段：监控和分析

#### 5.1 集成 Sentry
```typescript
// lib/sentry.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

#### 5.2 集成 LogRocket
```typescript
// lib/logrocket.ts
import LogRocket from 'logrocket';

LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET_ID);
```

#### 5.3 数据分析表
```sql
-- 创建文章热度分析表
CREATE TABLE IF NOT EXISTS article_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id),
  views_today INTEGER DEFAULT 0,
  views_week INTEGER DEFAULT 0,
  views_month INTEGER DEFAULT 0,
  likes_today INTEGER DEFAULT 0,
  comments_today INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建用户行为分析表
CREATE TABLE IF NOT EXISTS user_behavior_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(50), -- view, like, comment, share
  resource_type VARCHAR(50), -- post, project, tool
  resource_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 第六阶段：通知系统

#### 6.1 数据库扩展
```sql
-- 创建通知表
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  type VARCHAR(50), -- comment_reply, article_update, etc
  title TEXT NOT NULL,
  content TEXT,
  related_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 6.2 前端功能
- 在导航栏添加通知铃铛
- 创建通知中心页面
- 实现实时通知推送

#### 6.3 API 路由
- `GET /api/notifications` - 获取通知
- `PUT /api/notifications/[id]/read` - 标记为已读
- `POST /api/notifications/send` - 发送通知

---

### 第七阶段：用户功能增强

#### 7.1 数据库扩展
```sql
-- 创建文章书签表
CREATE TABLE IF NOT EXISTS article_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 创建阅读历史表
CREATE TABLE IF NOT EXISTS reading_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id),
  user_id UUID REFERENCES auth.users(id),
  read_at TIMESTAMP DEFAULT NOW(),
  reading_time INTEGER -- 阅读时长（秒）
);
```

#### 7.2 前端功能
- 在文章页面添加书签按钮
- 在用户个人中心显示书签列表
- 显示阅读历史

---

### 第八阶段：内容增强

#### 8.1 文章版本历史
```sql
CREATE TABLE IF NOT EXISTS post_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id),
  version_number INTEGER,
  title TEXT,
  content TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 8.2 代码高亮主题
- 在用户设置中添加代码高亮主题选择
- 支持多种主题 (Dracula, Nord, Monokai 等)

#### 8.3 文章目录
- 自动从 H2/H3 标题生成目录
- 添加目录导航功能

---

### 第九阶段：性能优化

#### 9.1 代码重复提取
- 创建通用表单组件 `FormField.tsx`
- 创建通用验证 hook `useFormValidation.ts`
- 创建通用工具卡片组件 `ToolCard.tsx`

#### 9.2 数据库查询优化
```typescript
// 优化前：N+1 查询
const posts = await supabase.from('posts').select('*');
for (const post of posts) {
  const comments = await supabase
    .from('comments')
    .select('count')
    .eq('post_id', post.id);
}

// 优化后：单次查询
const posts = await supabase
  .from('posts')
  .select(`
    *,
    comments(count)
  `);
```

#### 9.3 缓存策略
- 使用 React Query 缓存数据
- 实现 ISR (增量静态再生成)
- 使用 CDN 缓存静态资源

#### 9.4 图片优化
- 使用 Next.js Image 组件
- 实现图片懒加载
- 使用 WebP 格式

---

### 第十阶段：安全加固

#### 10.1 CSRF 保护
```typescript
// middleware.ts
import { csrf } from '@edge-csrf/nextjs';

const csrfProtect = csrf();

export const middleware = csrfProtect;
```

#### 10.2 速率限制
```typescript
// lib/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'),
});
```

#### 10.3 输入验证
```typescript
// lib/validation.ts
import { z } from 'zod';

export const CommentSchema = z.object({
  content: z.string().min(1).max(5000),
  post_id: z.string().uuid(),
});
```

#### 10.4 XSS 防护
- 使用 DOMPurify 清理 HTML
- 使用 Content Security Policy (CSP)

---

## 📊 实现时间表

| 阶段 | 功能 | 预计工时 | 优先级 | 状态 |
|------|------|---------|--------|------|
| 1 | 评论系统增强 | 40h | 🔴 高 | ✅ 已完成 |
| 2 | 工具系统增强 | 20h | 🟠 中 | ✅ 已完成 |
| 3 | 项目管理增强 | 20h | 🟠 中 | ✅ 已完成 |
| 4 | 搜索和SEO | 30h | 🔴 高 | ✅ 已完成 |
| 5 | 监控和分析 | 25h | 🟠 中 | ⏳ 待开始 |
| 6 | 通知系统 | 30h | 🟠 中 | ✅ 已完成 |
| 7 | 用户功能增强 | 20h | 🟡 低 | ✅ 已完成 |
| 8 | 内容增强 | 25h | 🟡 低 | ⏳ 待开始 |
| 9 | 性能优化 | 35h | 🔴 高 | 🔄 部分完成 |
| 10 | 安全加固 | 30h | 🔴 高 | 🔄 部分完成 |

**总计**: 275 小时 (约 7 周)

---

## 🔧 技术栈补充

### 新增依赖
```json
{
  "dependencies": {
    "next-seo": "^6.0.0",
    "@sentry/nextjs": "^7.0.0",
    "logrocket": "^7.0.0",
    "@upstash/ratelimit": "^1.0.0",
    "@edge-csrf/nextjs": "^1.0.0",
    "dompurify": "^3.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zod": "^3.0.0"
  }
}
```

---

## ✅ 验收标准

### 每个阶段完成后需要验证：
- [ ] 所有功能按需求实现
- [ ] 代码通过 ESLint 检查
- [ ] TypeScript 类型检查通过
- [ ] 单元测试覆盖率 > 80%
- [ ] 性能指标达标 (Lighthouse > 90)
- [ ] 安全审计通过
- [ ] 用户体验测试通过

---

## 📝 开发规范

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 ESLint 配置
- 使用 Prettier 格式化代码
- 添加详细的代码注释

### 提交规范
- 使用 Conventional Commits
- 每个功能一个分支
- PR 需要代码审查

### 测试规范
- 单元测试使用 Jest
- 集成测试使用 Playwright
- 性能测试使用 Lighthouse

---

## 🚀 部署计划

### 分阶段部署
- 每个阶段完成后进行灰度发布
- 监控错误率和性能指标
- 如有问题立即回滚

### 监控指标
- 错误率 < 0.1%
- 页面加载时间 < 3s
- 用户满意度 > 4.5/5

---

**下一步**: 请确认这份开发文档是否满足你的需求，如有调整请告诉我！
