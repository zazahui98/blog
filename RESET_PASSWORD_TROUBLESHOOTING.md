# 重置密码功能测试指南

## 问题诊断

如果您在部署后测试重置密码功能时，点击邮箱内的链接没有跳转到重置密码界面而是进入网站首页，可能的原因和解决方案如下：

## 1. 检查 Supabase 配置

### 重定向 URL 配置

在 Supabase Dashboard 中，确保正确配置了重定向 URL：

1. 登录 Supabase Dashboard
2. 进入 Authentication > Settings
3. 在 "Site URL" 部分设置您的主域名（例如：`https://your-domain.com`）
4. 在 "Redirect URLs" 部分添加：
   - `https://your-domain.com/auth/reset-password`
   - `https://your-domain.com/**` (允许所有路径)
   - 如果使用本地开发，也添加：`http://localhost:3000/auth/reset-password`

### 邮件模板配置

1. 在 Supabase Dashboard 中，进入 Authentication > Email Templates
2. 确认 "Reset password" 模板中的链接包含 `{{ .ConfirmationURL }}` 变量
3. 模板示例：
   ```
   <h2>重置密码</h2>
   <p>点击以下链接重置您的密码：</p>
   <p><a href="{{ .ConfirmationURL }}">重置密码</a></p>
   <p>如果您没有请求重置密码，请忽略此邮件。</p>
   ```

## 2. 环境变量配置

在您的生产环境中，确保设置了以下环境变量：

```bash
# .env.local 或生产环境变量
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 3. 测试步骤

1. **检查重置密码链接生成**：
   - 在浏览器控制台中查看 "🔗 [resetPassword] 重置密码链接:" 日志
   - 确认链接格式正确，包含您的域名

2. **检查邮件内容**：
   - 查看收到的重置密码邮件
   - 确认链接包含 `access_token` 和 `refresh_token` 参数
   - 链接格式应为：`https://your-domain.com/auth/reset-password?access_token=...&refresh_token=...`

3. **检查重置密码页面**：
   - 点击链接后，在浏览器控制台中查看 "🔍 [ResetPassword] URL参数检查:" 日志
   - 确认 `accessToken` 和 `refreshToken` 参数存在
   - 查看 "✅ [ResetPassword] 会话设置成功:" 日志

## 4. 常见问题与解决方案

### 问题1：链接跳转到首页而不是重置密码页面

**原因**：Next.js 路由配置问题或中间件重定向

**解决方案**：
1. 检查 `middleware.ts` 文件，确保不会重定向 `/auth/reset-password` 路径
2. 确认 `app/auth/reset-password/page.tsx` 文件存在且正确导出

### 问题2：重置密码页面显示"无效的密码重置链接"

**原因**：URL参数丢失或格式不正确

**解决方案**：
1. 检查 Supabase 邮件模板中的链接格式
2. 确认 `{{ .ConfirmationURL }}` 变量正确使用
3. 检查是否有其他中间件或代理服务器修改了URL

### 问题3：会话设置失败

**原因**：Token 无效或已过期

**解决方案**：
1. 确认链接在有效期内（默认1小时）
2. 检查 Supabase 项目设置中的 JWT 过期时间
3. 尝试重新生成重置密码链接

## 5. 调试技巧

1. **启用详细日志**：
   - 在浏览器控制台中查看所有以 `🔍`, `✅`, `❌` 开头的日志
   - 这些日志提供了详细的调试信息

2. **检查网络请求**：
   - 在浏览器开发者工具的 Network 标签中查看所有请求
   - 确认没有意外的重定向或错误

3. **本地测试**：
   - 在本地环境中测试重置密码功能
   - 使用 `ngrok` 或类似工具暴露本地服务器到公网
   - 在 Supabase 中添加 ngrok URL 到重定向 URL 列表

## 6. 部署检查清单

- [ ] Supabase Dashboard 中配置了正确的重定向 URL
- [ ] 邮件模板中使用了 `{{ .ConfirmationURL }}` 变量
- [ ] 生产环境设置了 `NEXT_PUBLIC_SITE_URL` 环境变量
- [ ] 部署后测试了完整的重置密码流程
- [ ] 检查了浏览器控制台中的调试日志

## 7. 联系支持

如果问题仍然存在，请提供以下信息：

1. Supabase 项目的重定向 URL 配置截图
2. 收到的重置密码邮件内容（隐藏敏感信息）
3. 浏览器控制台的完整日志
4. 部署环境的详细信息（Vercel、Netlify 等）

这些信息将帮助更快地诊断和解决问题。