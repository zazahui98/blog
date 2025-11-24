-- =====================================================
-- Supabase Storage 配置脚本
-- 用于创建图片存储桶和设置访问策略
-- =====================================================

-- 1. 创建 images 存储桶（如果不存在）
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. 设置存储桶的访问策略

-- 允许所有人查看图片（公开读取）
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- 允许认证用户上传图片
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- 允许用户更新自己上传的图片
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images' AND auth.uid() = owner);

-- 允许用户删除自己上传的图片
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images' AND auth.uid() = owner);

-- 允许管理员删除任何图片
CREATE POLICY "Admins can delete any images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'images' 
  AND EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- =====================================================
-- 使用说明：
-- 1. 登录 Supabase Dashboard
-- 2. 进入 SQL Editor
-- 3. 复制粘贴此脚本
-- 4. 点击 Run 执行
-- 5. 刷新页面，在 Storage 中应该能看到 images 桶
-- =====================================================
