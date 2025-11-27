-- =====================================================
-- 公告系统迁移脚本
-- 将现有的 announcements 表迁移到新的字段结构
-- =====================================================

-- 1. 检查并添加缺失的字段
ALTER TABLE IF EXISTS announcements
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP DEFAULT NULL,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP DEFAULT NULL,
ADD COLUMN IF NOT EXISTS target_audience VARCHAR(20) DEFAULT 'all',
ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;

-- 2. 如果存在旧的 start_time 字段，将其数据迁移到 start_date
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'announcements' AND column_name = 'start_time'
  ) THEN
    UPDATE announcements SET start_date = start_time WHERE start_date IS NULL;
  END IF;
END $$;

-- 3. 如果存在旧的 end_time 字段，将其数据迁移到 end_date
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'announcements' AND column_name = 'end_time'
  ) THEN
    UPDATE announcements SET end_date = end_time WHERE end_date IS NULL;
  END IF;
END $$;

-- 4. 创建或更新 announcement_views 表
CREATE TABLE IF NOT EXISTS announcement_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(announcement_id, user_id)
);

-- 5. 添加索引
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_dates ON announcements(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_announcement_views_user ON announcement_views(user_id);

-- 6. 设置 RLS 策略
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_views ENABLE ROW LEVEL SECURITY;

-- 公告策略 - 所有人可读活跃公告，管理员可管理
DROP POLICY IF EXISTS "Anyone can view active announcements" ON announcements;
CREATE POLICY "Anyone can view active announcements" ON announcements
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage announcements" ON announcements;
CREATE POLICY "Admins can manage announcements" ON announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin')
    )
  );

-- 查看记录策略
DROP POLICY IF EXISTS "Users can manage their own views" ON announcement_views;
CREATE POLICY "Users can manage their own views" ON announcement_views
  FOR ALL USING (auth.uid() = user_id);

-- 7. 创建或更新时间戳触发器
CREATE OR REPLACE FUNCTION update_announcement_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_announcement_timestamp ON announcements;
CREATE TRIGGER trigger_update_announcement_timestamp
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_announcement_timestamp();

COMMIT;
