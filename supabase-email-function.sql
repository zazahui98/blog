-- 获取用户邮箱信息的RPC函数
-- 在 Supabase SQL Editor 中执行此脚本

-- 创建获取用户邮箱的函数
CREATE OR REPLACE FUNCTION get_user_emails(user_ids UUID[])
RETURNS TABLE(id UUID, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT au.id::UUID, au.email::TEXT
  FROM auth.users au
  WHERE au.id = ANY(user_ids);
END;
$$;

-- 授予函数执行权限
GRANT EXECUTE ON FUNCTION get_user_emails(UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_emails(UUID[]) TO anon;

-- 创建更简单的视图来获取用户邮箱
CREATE OR REPLACE VIEW user_profiles_with_email AS
SELECT 
  up.*,
  au.email
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id;

-- 授予视图查询权限
GRANT SELECT ON user_profiles_with_email TO authenticated;
GRANT SELECT ON user_profiles_with_email TO anon;

-- 完成！
-- 现在可以在用户管理页面中使用这些功能来获取用户邮箱信息