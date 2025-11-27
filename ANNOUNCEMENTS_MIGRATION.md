# 公告系统迁移指南

## 问题描述

数据库中已存在 `announcements` 表，但字段结构与新代码不匹配。

**旧字段名：**
- `start_time` → 新字段名：`start_date`
- `end_time` → 新字段名：`end_date`
- 缺少：`target_audience`, `click_count`

## 解决方案

### 方案 1：执行迁移脚本（推荐）

在 Supabase SQL 编辑器中执行 `supabase-announcements-migration.sql` 脚本：

```sql
-- 此脚本会：
-- 1. 添加新字段（如果不存在）
-- 2. 迁移旧字段数据到新字段
-- 3. 创建 announcement_views 表
-- 4. 设置 RLS 策略
-- 5. 创建触发器
```

### 方案 2：手动迁移

如果迁移脚本失败，可以手动执行以下步骤：

```sql
-- 1. 添加新字段
ALTER TABLE announcements
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP DEFAULT NULL,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP DEFAULT NULL,
ADD COLUMN IF NOT EXISTS target_audience VARCHAR(20) DEFAULT 'all',
ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;

-- 2. 迁移数据
UPDATE announcements SET start_date = start_time WHERE start_date IS NULL;
UPDATE announcements SET end_date = end_time WHERE end_date IS NULL;

-- 3. 创建 announcement_views 表
CREATE TABLE IF NOT EXISTS announcement_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(announcement_id, user_id)
);
```

## 代码兼容性

新代码已更新为兼容两种字段名：

- `supabase-helpers.ts` - Announcement 接口支持新旧字段名
- `AnnouncementBanner.tsx` - 自动检测字段名
- `app/admin/announcements/page.tsx` - 支持两种字段名

## 测试

迁移完成后，测试以下功能：

1. ✅ 创建新公告
2. ✅ 编辑现有公告
3. ✅ 删除公告
4. ✅ 公告横幅显示
5. ✅ 用户关闭公告

## 常见问题

### Q: 执行迁移脚本后仍然报错？

A: 检查以下几点：
- 确保有足够的数据库权限
- 检查表名是否正确（应为 `announcements`）
- 查看 Supabase 日志获取详细错误信息

### Q: 旧数据会丢失吗？

A: 不会。迁移脚本只是添加新字段并复制数据，不会删除任何现有数据。

### Q: 可以回滚吗？

A: 可以。如果需要回滚，可以删除新字段：

```sql
ALTER TABLE announcements
DROP COLUMN IF EXISTS start_date,
DROP COLUMN IF EXISTS end_date,
DROP COLUMN IF EXISTS target_audience,
DROP COLUMN IF EXISTS click_count;

DROP TABLE IF EXISTS announcement_views;
```

## 后续步骤

1. 执行迁移脚本
2. 测试公告功能
3. 删除旧字段（可选）：

```sql
ALTER TABLE announcements
DROP COLUMN IF EXISTS start_time,
DROP COLUMN IF EXISTS end_time,
DROP COLUMN IF EXISTS link_url,
DROP COLUMN IF EXISTS link_text;
```
