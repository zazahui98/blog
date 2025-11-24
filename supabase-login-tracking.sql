-- ============================================
-- 用户登录追踪系统
-- ============================================

-- 1. 在 user_profiles 表中添加登录追踪字段
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_login_ip TEXT,
ADD COLUMN IF NOT EXISTS last_login_device TEXT,
ADD COLUMN IF NOT EXISTS last_login_device_model TEXT,
ADD COLUMN IF NOT EXISTS last_login_os TEXT,
ADD COLUMN IF NOT EXISTS last_login_browser TEXT,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- 2. 创建登录历史记录表
CREATE TABLE IF NOT EXISTS login_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  device_brand TEXT, -- 'Apple', 'Samsung', 'Huawei' 等
  device_model TEXT, -- 'iPhone 15 Pro', 'Galaxy S24 Ultra' 等
  os_name TEXT, -- 'iOS', 'Android', 'Windows' 等
  os_version TEXT, -- '17.2', '14', '11' 等
  browser_name TEXT, -- 'Chrome', 'Safari', 'Firefox' 等
  browser_version TEXT, -- '120.0', '17.2' 等
  user_agent TEXT, -- 完整的 User-Agent 字符串
  location_country TEXT,
  location_city TEXT,
  is_successful BOOLEAN DEFAULT true,
  failure_reason TEXT
);

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_login_history_user ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_login_at ON login_history(login_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_ip ON login_history(ip_address);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_login ON user_profiles(last_login_at DESC);

-- 4. 启用 RLS
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

-- 5. 创建 RLS 策略
CREATE POLICY "用户可以查看自己的登录历史" ON login_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "管理员可以查看所有登录历史" ON login_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "系统可以插入登录记录" ON login_history
  FOR INSERT WITH CHECK (true);

-- 6. 创建函数：记录用户登录
CREATE OR REPLACE FUNCTION record_user_login(
  p_user_id UUID,
  p_ip_address TEXT,
  p_device_type TEXT,
  p_device_brand TEXT,
  p_device_model TEXT,
  p_os_name TEXT,
  p_os_version TEXT,
  p_browser_name TEXT,
  p_browser_version TEXT,
  p_user_agent TEXT,
  p_location_country TEXT DEFAULT NULL,
  p_location_city TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- 插入登录历史记录
  INSERT INTO login_history (
    user_id,
    ip_address,
    device_type,
    device_brand,
    device_model,
    os_name,
    os_version,
    browser_name,
    browser_version,
    user_agent,
    location_country,
    location_city,
    is_successful
  ) VALUES (
    p_user_id,
    p_ip_address,
    p_device_type,
    p_device_brand,
    p_device_model,
    p_os_name,
    p_os_version,
    p_browser_name,
    p_browser_version,
    p_user_agent,
    p_location_country,
    p_location_city,
    true
  );

  -- 更新用户配置表的最后登录信息
  UPDATE user_profiles SET
    last_login_at = NOW(),
    last_login_ip = p_ip_address,
    last_login_device = p_device_type,
    last_login_device_model = p_device_model,
    last_login_os = p_os_name,
    last_login_browser = p_browser_name,
    login_count = COALESCE(login_count, 0) + 1
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 创建函数：记录登录失败
CREATE OR REPLACE FUNCTION record_login_failure(
  p_email TEXT,
  p_ip_address TEXT,
  p_user_agent TEXT,
  p_failure_reason TEXT
)
RETURNS void AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- 尝试获取用户 ID
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;

  -- 插入失败记录
  INSERT INTO login_history (
    user_id,
    ip_address,
    user_agent,
    is_successful,
    failure_reason
  ) VALUES (
    v_user_id,
    p_ip_address,
    p_user_agent,
    false,
    p_failure_reason
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 创建视图：用户登录统计
CREATE OR REPLACE VIEW user_login_stats AS
SELECT 
  up.id,
  up.username,
  au.email,
  up.last_login_at,
  up.last_login_ip,
  up.last_login_device,
  up.last_login_device_model,
  up.last_login_os,
  up.last_login_browser,
  up.login_count,
  COUNT(DISTINCT lh.ip_address) as unique_ip_count,
  COUNT(DISTINCT lh.device_model) as unique_device_count,
  COUNT(CASE WHEN lh.is_successful = false THEN 1 END) as failed_login_count,
  MAX(lh.login_at) FILTER (WHERE lh.is_successful = true) as last_successful_login,
  MAX(lh.login_at) FILTER (WHERE lh.is_successful = false) as last_failed_login
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
LEFT JOIN login_history lh ON up.id = lh.user_id
GROUP BY 
  up.id, 
  up.username, 
  au.email,
  up.last_login_at,
  up.last_login_ip,
  up.last_login_device,
  up.last_login_device_model,
  up.last_login_os,
  up.last_login_browser,
  up.login_count;

-- 9. 创建函数：清理旧的登录历史（保留最近 90 天）
CREATE OR REPLACE FUNCTION cleanup_old_login_history()
RETURNS void AS $$
BEGIN
  DELETE FROM login_history
  WHERE login_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 创建定时任务（需要 pg_cron 扩展）
-- 如果启用了 pg_cron，取消下面的注释
-- SELECT cron.schedule('cleanup-login-history', '0 2 * * 0', 'SELECT cleanup_old_login_history()');

-- 完成！
-- 使用说明：
-- 1. 在 Supabase Dashboard 中执行此 SQL
-- 2. 在应用中调用 record_user_login 函数记录登录信息
-- 3. 可以查询 login_history 表获取详细的登录历史
-- 4. 可以查询 user_login_stats 视图获取用户登录统计
