-- ============================================
-- 用户认证和权限管理系统数据库设置
-- ============================================

-- 1. 创建用户角色枚举类型
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'user');

-- 2. 创建用户配置表（扩展 Supabase Auth 用户信息）
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role user_role DEFAULT 'user' NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 更新 posts 表，添加作者关联
ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'));

-- 4. 更新 comments 表，添加用户关联
ALTER TABLE comments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- 5. 创建文章分类表
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 创建文章-分类关联表（多对多）
CREATE TABLE IF NOT EXISTS post_categories (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- 7. 创建用户活动日志表
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 创建索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(is_approved);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);

-- 9. 启用 RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 10. 创建 RLS 策略

-- user_profiles 策略
CREATE POLICY "用户可以查看所有活跃用户资料" ON user_profiles
  FOR SELECT USING (is_active = true);

CREATE POLICY "用户可以更新自己的资料" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "管理员可以管理所有用户" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- posts 策略（更新）
DROP POLICY IF EXISTS "Anyone can view published posts" ON posts;

CREATE POLICY "所有人可以查看已发布的文章" ON posts
  FOR SELECT USING (status = 'published' AND published = true);

CREATE POLICY "作者可以查看自己的所有文章" ON posts
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "作者和编辑可以创建文章" ON posts
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor', 'user')
    )
  );

CREATE POLICY "作者可以更新自己的文章" ON posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "管理员可以管理所有文章" ON posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- comments 策略（更新）
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;

CREATE POLICY "所有人可以查看已审核的评论" ON comments
  FOR SELECT USING (is_approved = true);

CREATE POLICY "用户可以查看自己的所有评论" ON comments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "登录用户可以发表评论" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的评论" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "管理员和编辑可以管理所有评论" ON comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- categories 策略
CREATE POLICY "所有人可以查看分类" ON categories
  FOR SELECT USING (true);

CREATE POLICY "管理员和编辑可以管理分类" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- post_categories 策略
CREATE POLICY "所有人可以查看文章分类关联" ON post_categories
  FOR SELECT USING (true);

CREATE POLICY "作者可以管理自己文章的分类" ON post_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE id = post_id AND author_id = auth.uid()
    )
  );

-- activity_logs 策略
CREATE POLICY "用户可以查看自己的活动日志" ON activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "管理员可以查看所有活动日志" ON activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 11. 创建触发器函数：自动创建用户配置
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. 创建触发器：用户注册时自动创建配置
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 13. 创建触发器函数：更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 14. 为相关表添加 updated_at 触发器
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. 插入默认分类
INSERT INTO categories (name, slug, description) VALUES
  ('前端开发', 'frontend', '前端技术相关文章'),
  ('后端开发', 'backend', '后端技术相关文章'),
  ('全栈开发', 'fullstack', '全栈开发相关文章'),
  ('DevOps', 'devops', '运维和部署相关文章'),
  ('数据库', 'database', '数据库技术相关文章'),
  ('架构设计', 'architecture', '系统架构设计文章')
ON CONFLICT (slug) DO NOTHING;

-- 16. 创建管理员账号（需要手动设置）
-- 注意：首个注册的用户需要手动在 Supabase Dashboard 中将 role 设置为 'admin'
-- 或者运行以下 SQL（替换 email）：
-- UPDATE user_profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'your-admin@email.com');

-- 17. 创建视图：文章统计
CREATE OR REPLACE VIEW post_stats AS
SELECT 
  p.id,
  p.title,
  p.author_id,
  up.username as author_name,
  p.views,
  p.likes,
  COUNT(DISTINCT c.id) as comment_count,
  p.created_at,
  p.status
FROM posts p
LEFT JOIN user_profiles up ON p.author_id = up.id
LEFT JOIN comments c ON p.id = c.post_id AND c.is_approved = true
GROUP BY p.id, p.title, p.author_id, up.username, p.views, p.likes, p.created_at, p.status;

-- 18. 创建视图：用户统计
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  up.id,
  up.username,
  up.full_name,
  up.role,
  COUNT(DISTINCT p.id) as post_count,
  COUNT(DISTINCT c.id) as comment_count,
  up.created_at
FROM user_profiles up
LEFT JOIN posts p ON up.id = p.author_id
LEFT JOIN comments c ON up.id = c.user_id
GROUP BY up.id, up.username, up.full_name, up.role, up.created_at;

-- 完成！
-- 接下来需要在 Supabase Dashboard 中：
-- 1. 启用 Email Auth
-- 2. 配置邮件模板
-- 3. 设置重定向 URL
