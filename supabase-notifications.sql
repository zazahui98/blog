-- =====================================================
-- 通知系统 SQL 脚本
-- 执行前请备份数据库
-- =====================================================

-- 1. 创建通知表
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL, -- comment_reply, article_like, comment_like, system, mention
  title TEXT NOT NULL,
  content TEXT,
  related_type VARCHAR(50), -- post, comment, project
  related_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. 添加索引
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- 3. 设置 RLS 策略
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- 管理员可以查看和管理所有通知
DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;
CREATE POLICY "Admins can manage all notifications" ON notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin')
    )
  );

-- 4. 创建发送通知的函数
CREATE OR REPLACE FUNCTION send_notification(
  p_user_id UUID,
  p_type VARCHAR(50),
  p_title TEXT,
  p_content TEXT DEFAULT NULL,
  p_related_type VARCHAR(50) DEFAULT NULL,
  p_related_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- 不给自己发通知
  IF p_user_id = auth.uid() THEN
    RETURN NULL;
  END IF;

  INSERT INTO notifications (user_id, type, title, content, related_type, related_id)
  VALUES (p_user_id, p_type, p_title, p_content, p_related_type, p_related_id)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 文章点赞通知触发器
CREATE OR REPLACE FUNCTION notify_article_like()
RETURNS TRIGGER AS $$
DECLARE
  v_author_id UUID;
  v_post_title TEXT;
  v_liker_name TEXT;
BEGIN
  -- 获取文章作者ID和标题
  SELECT author_id, title INTO v_author_id, v_post_title
  FROM posts
  WHERE id = NEW.post_id;
  
  -- 获取点赞者用户名
  SELECT username INTO v_liker_name
  FROM user_profiles
  WHERE id = NEW.user_id;
  
  -- 如果点赞者不是作者本人，发送通知
  IF v_author_id IS NOT NULL AND v_author_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, title, content, related_type, related_id)
    VALUES (
      v_author_id,
      'article_like',
      COALESCE(v_liker_name, '有人') || ' 赞了你的文章',
      '文章《' || v_post_title || '》收到了一个赞',
      'post',
      NEW.post_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 如果存在 post_likes 表，创建触发器
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_likes') THEN
    DROP TRIGGER IF EXISTS trigger_notify_article_like ON post_likes;
    CREATE TRIGGER trigger_notify_article_like
      AFTER INSERT ON post_likes
      FOR EACH ROW EXECUTE FUNCTION notify_article_like();
  END IF;
END $$;

-- 6. 评论回复通知触发器
CREATE OR REPLACE FUNCTION notify_comment_reply()
RETURNS TRIGGER AS $$
DECLARE
  v_parent_user_id UUID;
  v_replier_name TEXT;
BEGIN
  -- 获取父评论的用户ID
  IF NEW.parent_id IS NOT NULL THEN
    SELECT user_id INTO v_parent_user_id
    FROM comments
    WHERE id = NEW.parent_id;
  END IF;
  
  -- 获取回复者用户名
  SELECT username INTO v_replier_name
  FROM user_profiles
  WHERE id = NEW.user_id;
  
  -- 如果回复者不是评论作者本人，发送通知
  IF v_parent_user_id IS NOT NULL AND v_parent_user_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, title, content, related_type, related_id)
    VALUES (
      v_parent_user_id,
      'comment_reply',
      COALESCE(v_replier_name, '有人') || ' 回复了你的评论',
      LEFT(NEW.content, 100),
      'comment',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 如果 comments 表有 parent_id 字段，创建触发器
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comments' AND column_name = 'parent_id'
  ) THEN
    DROP TRIGGER IF EXISTS trigger_notify_comment_reply ON comments;
    CREATE TRIGGER trigger_notify_comment_reply
      AFTER INSERT ON comments
      FOR EACH ROW 
      WHEN (NEW.parent_id IS NOT NULL)
      EXECUTE FUNCTION notify_comment_reply();
  END IF;
END $$;

-- 7. 评论点赞通知触发器
CREATE OR REPLACE FUNCTION notify_comment_like()
RETURNS TRIGGER AS $$
DECLARE
  v_comment_user_id UUID;
  v_liker_name TEXT;
BEGIN
  -- 获取评论作者ID
  SELECT user_id INTO v_comment_user_id
  FROM comments
  WHERE id = NEW.comment_id;
  
  -- 获取点赞者用户名
  SELECT username INTO v_liker_name
  FROM user_profiles
  WHERE id = NEW.user_id;
  
  -- 如果点赞者不是评论作者本人，发送通知
  IF v_comment_user_id IS NOT NULL AND v_comment_user_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, title, content, related_type, related_id)
    VALUES (
      v_comment_user_id,
      'comment_like',
      COALESCE(v_liker_name, '有人') || ' 赞了你的评论',
      NULL,
      'comment',
      NEW.comment_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 如果存在 comment_likes 表，创建触发器
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comment_likes') THEN
    DROP TRIGGER IF EXISTS trigger_notify_comment_like ON comment_likes;
    CREATE TRIGGER trigger_notify_comment_like
      AFTER INSERT ON comment_likes
      FOR EACH ROW EXECUTE FUNCTION notify_comment_like();
  END IF;
END $$;

-- 8. 新评论通知（通知文章作者）
CREATE OR REPLACE FUNCTION notify_new_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_author_id UUID;
  v_post_title TEXT;
  v_commenter_name TEXT;
BEGIN
  -- 只对顶级评论发送通知（回复由 notify_comment_reply 处理）
  IF NEW.parent_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- 获取文章作者ID和标题
  SELECT author_id, title INTO v_author_id, v_post_title
  FROM posts
  WHERE id = NEW.post_id;
  
  -- 获取评论者用户名
  SELECT username INTO v_commenter_name
  FROM user_profiles
  WHERE id = NEW.user_id;
  
  -- 如果评论者不是作者本人，发送通知
  IF v_author_id IS NOT NULL AND v_author_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, title, content, related_type, related_id)
    VALUES (
      v_author_id,
      'new_comment',
      COALESCE(v_commenter_name, '有人') || ' 评论了你的文章',
      '文章《' || v_post_title || '》收到了新评论：' || LEFT(NEW.content, 50),
      'post',
      NEW.post_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建新评论通知触发器
DROP TRIGGER IF EXISTS trigger_notify_new_comment ON comments;
CREATE TRIGGER trigger_notify_new_comment
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION notify_new_comment();

COMMIT;
