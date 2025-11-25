-- ============================================
-- 文章点赞系统
-- ============================================

-- 1. 创建文章点赞表
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id) -- 确保每个用户只能对同一篇文章点赞一次
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_created ON post_likes(created_at DESC);

-- 3. 启用 RLS
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- 4. 创建 RLS 策略
CREATE POLICY "用户可以查看所有点赞记录" ON post_likes
  FOR SELECT USING (true);

CREATE POLICY "登录用户可以点赞文章" ON post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以取消自己的点赞" ON post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- 5. 创建视图：文章点赞统计（包含当前用户是否点赞）
CREATE OR REPLACE VIEW posts_with_likes AS
SELECT 
  p.*,
  COUNT(pl.id) AS like_count,
  COUNT(CASE WHEN pl.user_id = auth.uid() THEN 1 END) AS user_liked
FROM posts p
LEFT JOIN post_likes pl ON p.id = pl.post_id
GROUP BY p.id;

-- 6. 创建函数：更新文章点赞数
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes = likes + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes = likes - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 创建触发器：自动更新文章点赞数
DROP TRIGGER IF EXISTS on_post_like_change ON post_likes;
CREATE TRIGGER on_post_like_change
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

-- 完成！
-- 使用说明：
-- 1. 在 Supabase Dashboard 中执行此 SQL
-- 2. 确保在应用中使用 posts_with_likes 视图来获取文章列表
-- 3. 使用 user_liked 字段来判断当前用户是否已点赞