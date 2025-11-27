-- =====================================================
-- 工具系统增强 SQL 脚本
-- 执行前请备份数据库
-- =====================================================

-- 1. 创建工具使用统计表
CREATE TABLE IF NOT EXISTS tool_usage_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  usage_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tool_id, user_id)
);

-- 2. 创建工具收藏表
CREATE TABLE IF NOT EXISTS tool_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tool_id, user_id)
);

-- 3. 创建工具全局统计表（用于后台展示）
CREATE TABLE IF NOT EXISTS tool_global_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id VARCHAR(50) NOT NULL UNIQUE,
  total_usage INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. 添加索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_tool_usage_stats_tool_id ON tool_usage_stats(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_usage_stats_user_id ON tool_usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_favorites_user_id ON tool_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_favorites_tool_id ON tool_favorites(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_global_stats_total_usage ON tool_global_stats(total_usage DESC);

-- 5. 创建更新全局统计的函数
CREATE OR REPLACE FUNCTION update_tool_global_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- 插入或更新全局统计
    INSERT INTO tool_global_stats (tool_id, total_usage, unique_users, last_used_at, updated_at)
    VALUES (NEW.tool_id, 1, 1, NOW(), NOW())
    ON CONFLICT (tool_id) DO UPDATE SET
      total_usage = tool_global_stats.total_usage + 1,
      unique_users = (
        SELECT COUNT(DISTINCT user_id) 
        FROM tool_usage_stats 
        WHERE tool_id = NEW.tool_id
      ),
      last_used_at = NOW(),
      updated_at = NOW();
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 6. 创建更新收藏计数的函数
CREATE OR REPLACE FUNCTION update_tool_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO tool_global_stats (tool_id, favorite_count, updated_at)
    VALUES (NEW.tool_id, 1, NOW())
    ON CONFLICT (tool_id) DO UPDATE SET
      favorite_count = tool_global_stats.favorite_count + 1,
      updated_at = NOW();
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tool_global_stats 
    SET favorite_count = GREATEST(favorite_count - 1, 0),
        updated_at = NOW()
    WHERE tool_id = OLD.tool_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 7. 创建触发器
DROP TRIGGER IF EXISTS trigger_update_tool_global_stats ON tool_usage_stats;
CREATE TRIGGER trigger_update_tool_global_stats
  AFTER INSERT ON tool_usage_stats
  FOR EACH ROW EXECUTE FUNCTION update_tool_global_stats();

DROP TRIGGER IF EXISTS trigger_update_tool_favorite_count ON tool_favorites;
CREATE TRIGGER trigger_update_tool_favorite_count
  AFTER INSERT OR DELETE ON tool_favorites
  FOR EACH ROW EXECUTE FUNCTION update_tool_favorite_count();

-- 8. 设置 RLS (Row Level Security) 策略
ALTER TABLE tool_usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_global_stats ENABLE ROW LEVEL SECURITY;

-- 工具使用统计策略
DROP POLICY IF EXISTS "Users can view their own usage stats" ON tool_usage_stats;
CREATE POLICY "Users can view their own usage stats" ON tool_usage_stats
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own usage stats" ON tool_usage_stats;
CREATE POLICY "Users can insert their own usage stats" ON tool_usage_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own usage stats" ON tool_usage_stats;
CREATE POLICY "Users can update their own usage stats" ON tool_usage_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- 工具收藏策略
DROP POLICY IF EXISTS "Users can view their own favorites" ON tool_favorites;
CREATE POLICY "Users can view their own favorites" ON tool_favorites
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own favorites" ON tool_favorites;
CREATE POLICY "Users can manage their own favorites" ON tool_favorites
  FOR ALL USING (auth.uid() = user_id);

-- 全局统计策略（所有人可读，管理员可写）
DROP POLICY IF EXISTS "Anyone can view global stats" ON tool_global_stats;
CREATE POLICY "Anyone can view global stats" ON tool_global_stats
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage global stats" ON tool_global_stats;
CREATE POLICY "Admins can manage global stats" ON tool_global_stats
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'editor')
    )
  );

-- 9. 初始化工具全局统计数据
INSERT INTO tool_global_stats (tool_id, total_usage, unique_users, favorite_count)
VALUES 
  ('data-generator', 0, 0, 0),
  ('qrcode', 0, 0, 0),
  ('json-formatter', 0, 0, 0),
  ('base64', 0, 0, 0),
  ('timestamp', 0, 0, 0),
  ('color-picker', 0, 0, 0),
  ('password-generator', 0, 0, 0),
  ('calculator', 0, 0, 0)
ON CONFLICT (tool_id) DO NOTHING;

COMMIT;
