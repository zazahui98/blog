-- =====================================================
-- 评论系统增强 SQL 脚本
-- 执行前请备份数据库
-- =====================================================

-- 1. 添加评论排序和过滤字段
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_author_reply BOOLEAN DEFAULT FALSE;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP;

-- 2. 创建评论举报表
CREATE TABLE IF NOT EXISTS comment_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, resolved, dismissed
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. 创建评论编辑历史表
CREATE TABLE IF NOT EXISTS comment_edit_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  old_content TEXT,
  new_content TEXT,
  edited_by UUID REFERENCES auth.users(id),
  edited_at TIMESTAMP DEFAULT NOW()
);

-- 4. 添加索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_comments_post_id_created_at ON comments(post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_helpful_count ON comments(helpful_count DESC);
CREATE INDEX IF NOT EXISTS idx_comments_is_author_reply ON comments(is_author_reply);
CREATE INDEX IF NOT EXISTS idx_comment_reports_status ON comment_reports(status);
CREATE INDEX IF NOT EXISTS idx_comment_reports_comment_id ON comment_reports(comment_id);

-- 5. 创建更新 helpful_count 的函数（基于 comment_likes 表）
CREATE OR REPLACE FUNCTION update_comment_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments 
    SET helpful_count = helpful_count + 1 
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments 
    SET helpful_count = GREATEST(helpful_count - 1, 0)
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 6. 创建触发器自动更新 helpful_count
DROP TRIGGER IF EXISTS trigger_update_comment_helpful_count ON comment_likes;
CREATE TRIGGER trigger_update_comment_helpful_count
  AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW EXECUTE FUNCTION update_comment_helpful_count();

-- 7. 设置 RLS (Row Level Security) 策略
ALTER TABLE comment_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_edit_history ENABLE ROW LEVEL SECURITY;

-- 评论举报策略
DROP POLICY IF EXISTS "Users can create reports" ON comment_reports;
CREATE POLICY "Users can create reports" ON comment_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can view their own reports" ON comment_reports;
CREATE POLICY "Users can view their own reports" ON comment_reports
  FOR SELECT USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Admins can manage all reports" ON comment_reports;
CREATE POLICY "Admins can manage all reports" ON comment_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'editor')
    )
  );

-- 评论编辑历史策略
DROP POLICY IF EXISTS "Users can view edit history" ON comment_edit_history;
CREATE POLICY "Users can view edit history" ON comment_edit_history
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create edit history" ON comment_edit_history;
CREATE POLICY "Users can create edit history" ON comment_edit_history
  FOR INSERT WITH CHECK (auth.uid() = edited_by);

-- 8. 同步现有评论的 helpful_count（基于 comment_likes 表）
UPDATE comments c
SET helpful_count = (
  SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id
);

-- 9. 标记作者回复（需要根据实际的文章作者来设置）
-- 这个需要在应用层处理，因为需要知道文章作者是谁

COMMIT;
