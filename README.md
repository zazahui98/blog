# DevArtisan - 顶级开发者技术博客

一个展现顶级开发者技术实力的炫酷个人博客论坛网站，融合前沿技术和极致设计美学。

## 🚀 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **数据库**: Supabase
- **部署**: Vercel
- **国际化**: 中英双语切换

## ✨ 特性

- 🎨 炫酷的渐变色和动画效果
- 🌐 中英文无缝切换
- 📱 完全响应式设计
- ⚡ 极致的性能优化
- 🎭 独特的视觉设计
- 💾 真实数据驱动

## 📦 安装

\`\`\`bash
npm install
\`\`\`

## 🔧 配置 Supabase

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 在 SQL Editor 中执行以下 SQL 创建表：

\`\`\`sql
-- 创建文章表
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_en TEXT NOT NULL,
  content TEXT NOT NULL,
  content_en TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  excerpt_en TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published BOOLEAN DEFAULT false
);

-- 创建评论表
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_published ON posts(published);
CREATE INDEX idx_comments_post_id ON comments(post_id);

-- 插入示例数据
INSERT INTO posts (title, title_en, content, content_en, slug, excerpt, excerpt_en, cover_image, tags, views, likes, published) VALUES
(
  '深入理解 React Server Components',
  'Deep Dive into React Server Components',
  '<h2>什么是 React Server Components？</h2><p>React Server Components (RSC) 是 React 团队推出的革命性特性，它允许组件在服务器端渲染，从而大幅提升应用性能。</p><h3>核心优势</h3><ul><li>零客户端 JavaScript 开销</li><li>直接访问后端资源</li><li>自动代码分割</li><li>更好的 SEO 支持</li></ul><h3>工作原理</h3><p>Server Components 在服务器上执行，将渲染结果序列化后发送给客户端。这意味着你可以直接在组件中访问数据库、文件系统等后端资源，而无需通过 API 层。</p><pre><code>async function BlogPost({ id }) {\n  const post = await db.posts.findUnique({ where: { id } });\n  return &lt;article&gt;{post.content}&lt;/article&gt;;\n}</code></pre><p>这种模式彻底改变了我们构建 React 应用的方式，让全栈开发变得更加简单和高效。</p>',
  '<h2>What are React Server Components?</h2><p>React Server Components (RSC) is a revolutionary feature introduced by the React team that allows components to render on the server, significantly improving application performance.</p><h3>Core Benefits</h3><ul><li>Zero client-side JavaScript overhead</li><li>Direct access to backend resources</li><li>Automatic code splitting</li><li>Better SEO support</li></ul><h3>How It Works</h3><p>Server Components execute on the server and send serialized rendering results to the client. This means you can directly access databases, file systems, and other backend resources in your components without going through an API layer.</p><pre><code>async function BlogPost({ id }) {\n  const post = await db.posts.findUnique({ where: { id } });\n  return &lt;article&gt;{post.content}&lt;/article&gt;;\n}</code></pre><p>This pattern fundamentally changes how we build React applications, making full-stack development simpler and more efficient.</p>',
  'react-server-components',
  '探索 React Server Components 的工作原理和最佳实践，了解如何利用这一革命性特性构建高性能的现代 Web 应用。',
  'Explore the inner workings and best practices of React Server Components, and learn how to leverage this revolutionary feature to build high-performance modern web applications.',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
  ARRAY['React', 'Next.js', 'Server Components', 'Performance'],
  1247,
  89,
  true
),
(
  'TypeScript 高级类型技巧',
  'Advanced TypeScript Type Tricks',
  '<h2>掌握 TypeScript 的类型系统</h2><p>TypeScript 的类型系统非常强大，但很多开发者只使用了其中的一小部分功能。本文将介绍一些高级类型技巧。</p><h3>条件类型</h3><p>条件类型允许你根据类型关系来选择不同的类型：</p><pre><code>type IsString&lt;T&gt; = T extends string ? true : false;\ntype A = IsString&lt;string&gt;; // true\ntype B = IsString&lt;number&gt;; // false</code></pre><h3>映射类型</h3><p>映射类型可以基于旧类型创建新类型：</p><pre><code>type Readonly&lt;T&gt; = {\n  readonly [P in keyof T]: T[P];\n};</code></pre><h3>模板字面量类型</h3><p>TypeScript 4.1 引入了模板字面量类型，让字符串操作更加类型安全：</p><pre><code>type EventName&lt;T extends string&gt; = `on${Capitalize&lt;T&gt;}`;\ntype ClickEvent = EventName&lt;"click"&gt;; // "onClick"</code></pre><p>这些高级特性让 TypeScript 成为构建大型应用的理想选择。</p>',
  '<h2>Mastering TypeScript Type System</h2><p>TypeScript type system is incredibly powerful, but many developers only use a fraction of its capabilities. This article introduces some advanced type tricks.</p><h3>Conditional Types</h3><p>Conditional types allow you to select different types based on type relationships:</p><pre><code>type IsString&lt;T&gt; = T extends string ? true : false;\ntype A = IsString&lt;string&gt;; // true\ntype B = IsString&lt;number&gt;; // false</code></pre><h3>Mapped Types</h3><p>Mapped types can create new types based on old ones:</p><pre><code>type Readonly&lt;T&gt; = {\n  readonly [P in keyof T]: T[P];\n};</code></pre><h3>Template Literal Types</h3><p>TypeScript 4.1 introduced template literal types for type-safe string manipulation:</p><pre><code>type EventName&lt;T extends string&gt; = `on${Capitalize&lt;T&gt;}`;\ntype ClickEvent = EventName&lt;"click"&gt;; // "onClick"</code></pre><p>These advanced features make TypeScript an ideal choice for building large-scale applications.</p>',
  'typescript-advanced-types',
  '深入探讨 TypeScript 的高级类型系统，包括条件类型、映射类型和模板字面量类型等强大特性。',
  'Deep dive into TypeScript advanced type system, including conditional types, mapped types, and template literal types.',
  'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop',
  ARRAY['TypeScript', 'Types', 'Advanced', 'Programming'],
  892,
  67,
  true
),
(
  '构建可扩展的微前端架构',
  'Building Scalable Micro-Frontend Architecture',
  '<h2>微前端：大型应用的解决方案</h2><p>随着前端应用规模的不断增长，微前端架构成为了解决复杂性的有效方案。</p><h3>什么是微前端？</h3><p>微前端是一种将大型前端应用拆分为多个小型、独立的前端应用的架构模式。每个微应用可以独立开发、测试和部署。</p><h3>核心优势</h3><ul><li>技术栈无关：不同团队可以使用不同的框架</li><li>独立部署：减少部署风险</li><li>团队自治：提高开发效率</li><li>增量升级：逐步迁移遗留系统</li></ul><h3>实现方案</h3><p>常见的微前端实现方案包括：</p><ol><li>iframe 方案：最简单但有局限性</li><li>Web Components：标准化的组件封装</li><li>Module Federation：Webpack 5 的强大特性</li><li>Single-SPA：成熟的微前端框架</li></ol><pre><code>// Module Federation 配置示例\nmodule.exports = {\n  plugins: [\n    new ModuleFederationPlugin({\n      name: "app1",\n      remotes: {\n        app2: "app2@http://localhost:3002/remoteEntry.js"\n      }\n    })\n  ]\n};</code></pre><p>选择合适的方案需要根据团队规模、技术栈和业务需求来决定。</p>',
  '<h2>Micro-Frontends: Solution for Large Applications</h2><p>As frontend applications grow in scale, micro-frontend architecture has become an effective solution for managing complexity.</p><h3>What are Micro-Frontends?</h3><p>Micro-frontends is an architectural pattern that breaks down large frontend applications into smaller, independent frontend apps. Each micro-app can be developed, tested, and deployed independently.</p><h3>Core Benefits</h3><ul><li>Technology Agnostic: Different teams can use different frameworks</li><li>Independent Deployment: Reduced deployment risks</li><li>Team Autonomy: Improved development efficiency</li><li>Incremental Upgrades: Gradually migrate legacy systems</li></ul><h3>Implementation Approaches</h3><p>Common micro-frontend implementation approaches include:</p><ol><li>iframe: Simplest but with limitations</li><li>Web Components: Standardized component encapsulation</li><li>Module Federation: Powerful Webpack 5 feature</li><li>Single-SPA: Mature micro-frontend framework</li></ol><pre><code>// Module Federation configuration example\nmodule.exports = {\n  plugins: [\n    new ModuleFederationPlugin({\n      name: "app1",\n      remotes: {\n        app2: "app2@http://localhost:3002/remoteEntry.js"\n      }\n    })\n  ]\n};</code></pre><p>Choosing the right approach depends on team size, tech stack, and business requirements.</p>',
  'micro-frontend-architecture',
  '了解如何设计和实现可扩展的微前端架构，让大型前端应用的开发和维护变得更加简单高效。',
  'Learn how to design and implement scalable micro-frontend architecture to make large frontend applications easier to develop and maintain.',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
  ARRAY['Architecture', 'Micro-Frontend', 'Scalability', 'Engineering'],
  1534,
  112,
  true
);
\`\`\`

3. 复制项目 URL 和 anon key 到 `.env.local` 文件

## 🚀 运行

\`\`\`bash
npm run dev
\`\`\`

访问 [http://localhost:3000](http://localhost:3000)

## 📝 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 添加环境变量（Supabase URL 和 Key）
4. 部署！

## 🎨 设计特色

- 紫粉渐变色主题
- 流畅的动画过渡
- 悬浮发光效果
- 粒子背景
- 响应式布局
- 自定义滚动条

## 📄 License

MIT
