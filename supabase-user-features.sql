-- =====================================================
-- 用户功能增强 SQL 脚本
-- 执行前请备份数据库
-- =====================================================

-- 1. 创建文章书签表
CREATE TABLE IF NOT EXISTS article_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 2. 创建阅读历史表
CREATE TABLE IF NOT EXISTS reading_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  read_at TIMESTAMP DEFAULT NOW(),
  reading_time INTEGER DEFAULT 0, -- 阅读时长（秒）
  progress INTEGER DEFAULT 0, -- 阅读进度（百分比）
  UNIQUE(post_id, user_id)
);

-- 3. 添加索引
CREATE INDEX IF NOT EXISTS idx_article_bookmarks_user_id ON article_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_article_bookmarks_post_id ON article_bookmarks(post_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_read_at ON reading_history(read_at DESC);

-- 4. 设置 RLS 策略
ALTER TABLE article_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;

-- 书签策略
DROP POLICY IF EXISTS "Users can manage their own bookmarks" ON article_bookmarks;
CREATE POLICY "Users can manage their own bookmarks" ON article_bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- 阅读历史策略
DROP POLICY IF EXISTS "Users can manage their own reading history" ON reading_history;
CREATE POLICY "Users can manage their own reading history" ON reading_history
  FOR ALL USING (auth.uid() = user_id);

COMMIT;
