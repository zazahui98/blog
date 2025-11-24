# 部署指南 / Deployment Guide

## 📋 前置要求

- Node.js 18+ 
- npm 或 yarn
- Supabase 账号
- Vercel 账号（用于部署）

## 🗄️ Supabase 配置

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并登录
2. 点击 "New Project" 创建新项目
3. 填写项目名称、数据库密码和区域（建议选择离你最近的区域）
4. 等待项目创建完成（约 2 分钟）

### 2. 执行数据库脚本

1. 在 Supabase 项目中，点击左侧菜单的 "SQL Editor"
2. 点击 "New Query"
3. 复制 `supabase-setup.sql` 文件的全部内容
4. 粘贴到编辑器中
5. 点击 "Run" 执行脚本
6. 确认所有表和数据都已创建成功

### 3. 获取 API 密钥

1. 点击左侧菜单的 "Settings" → "API"
2. 复制以下信息：
   - Project URL (类似: `https://xxxxx.supabase.co`)
   - anon public key (以 `eyJ` 开头的长字符串)

### 4. 配置环境变量

在项目根目录创建 `.env.local` 文件：

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=你的_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_supabase_anon_key
\`\`\`

## 🚀 本地开发

### 安装依赖

\`\`\`bash
cd tech-blog-forum
npm install
\`\`\`

### 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

## 📦 部署到 Vercel

### 方法一：通过 Vercel CLI

1. 安装 Vercel CLI：
\`\`\`bash
npm install -g vercel
\`\`\`

2. 登录 Vercel：
\`\`\`bash
vercel login
\`\`\`

3. 部署项目：
\`\`\`bash
vercel
\`\`\`

4. 添加环境变量：
\`\`\`bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
\`\`\`

5. 重新部署：
\`\`\`bash
vercel --prod
\`\`\`

### 方法二：通过 Vercel Dashboard

1. 将代码推送到 GitHub：
\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/tech-blog-forum.git
git push -u origin main
\`\`\`

2. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
3. 点击 "New Project"
4. 导入你的 GitHub 仓库
5. 配置项目：
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

6. 添加环境变量：
   - 点击 "Environment Variables"
   - 添加 `NEXT_PUBLIC_SUPABASE_URL`
   - 添加 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

7. 点击 "Deploy" 开始部署

8. 等待部署完成（约 2-3 分钟）

9. 访问 Vercel 提供的域名查看你的网站！

## 🎨 自定义配置

### 修改网站信息

编辑 `app/layout.tsx` 修改网站标题和描述：

\`\`\`typescript
export const metadata: Metadata = {
  title: "你的网站标题",
  description: "你的网站描述",
};
\`\`\`

### 修改品牌名称

在 `components/Navigation.tsx` 中修改：

\`\`\`typescript
<span className="text-2xl font-bold...">
  你的品牌名
</span>
\`\`\`

### 修改社交链接

在 `components/Footer.tsx` 中修改社交媒体链接。

### 添加 Google Analytics

在 `app/layout.tsx` 中添加 Google Analytics 脚本。

## 🔧 常见问题

### Q: 数据库连接失败？
A: 检查 `.env.local` 文件中的 Supabase URL 和 Key 是否正确。

### Q: 图片无法显示？
A: 确保图片 URL 可以公开访问，或者使用 Supabase Storage 存储图片。

### Q: 部署后样式错误？
A: 清除浏览器缓存，或者在 Vercel 中重新部署。

### Q: 如何添加新文章？
A: 在 Supabase 的 Table Editor 中直接添加数据，或者创建一个管理后台。

## 📝 后续优化建议

1. **添加管理后台**：使用 Next.js API Routes + Supabase Auth 创建管理界面
2. **评论系统**：实现文章评论功能
3. **搜索功能**：添加全文搜索
4. **RSS 订阅**：生成 RSS feed
5. **SEO 优化**：添加 sitemap 和 robots.txt
6. **性能监控**：集成 Vercel Analytics
7. **CDN 加速**：使用 Cloudflare 或其他 CDN 服务

## 🎉 完成！

恭喜！你的个人技术博客已经成功部署。现在可以开始分享你的技术见解了！

如有问题，欢迎提 Issue 或 PR。
