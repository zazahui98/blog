-- DevArtisan Blog Database Setup
-- 在 Supabase SQL Editor 中执行此脚本

-- 创建文章表
CREATE TABLE IF NOT EXISTS posts (
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
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);

-- 启用 Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 创建策略：所有人可以读取已发布的文章
CREATE POLICY "Anyone can view published posts" ON posts
  FOR SELECT USING (published = true);

-- 创建策略：所有人可以读取评论
CREATE POLICY "Anyone can view comments" ON comments
  FOR SELECT USING (true);

-- 插入示例数据
INSERT INTO posts (title, title_en, content, content_en, slug, excerpt, excerpt_en, cover_image, tags, views, likes, published) VALUES
(
  '深入理解 React Server Components',
  'Deep Dive into React Server Components',
  '<h2>什么是 React Server Components？</h2><p>React Server Components (RSC) 是 React 团队推出的革命性特性，它允许组件在服务器端渲染，从而大幅提升应用性能。</p><h3>核心优势</h3><ul><li>零客户端 JavaScript 开销</li><li>直接访问后端资源</li><li>自动代码分割</li><li>更好的 SEO 支持</li></ul><h3>工作原理</h3><p>Server Components 在服务器上执行，将渲染结果序列化后发送给客户端。这意味着你可以直接在组件中访问数据库、文件系统等后端资源，而无需通过 API 层。</p><pre><code>async function BlogPost({ id }) {
  const post = await db.posts.findUnique({ where: { id } });
  return &lt;article&gt;{post.content}&lt;/article&gt;;
}</code></pre><p>这种模式彻底改变了我们构建 React 应用的方式，让全栈开发变得更加简单和高效。</p><h3>最佳实践</h3><ol><li>合理划分 Server 和 Client Components</li><li>利用 Streaming 提升首屏加载速度</li><li>使用 Suspense 优化加载体验</li><li>避免在 Server Components 中使用浏览器 API</li></ol><p>React Server Components 代表了 React 生态系统的未来方向，值得每个 React 开发者深入学习和实践。</p>',
  '<h2>What are React Server Components?</h2><p>React Server Components (RSC) is a revolutionary feature introduced by the React team that allows components to render on the server, significantly improving application performance.</p><h3>Core Benefits</h3><ul><li>Zero client-side JavaScript overhead</li><li>Direct access to backend resources</li><li>Automatic code splitting</li><li>Better SEO support</li></ul><h3>How It Works</h3><p>Server Components execute on the server and send serialized rendering results to the client. This means you can directly access databases, file systems, and other backend resources in your components without going through an API layer.</p><pre><code>async function BlogPost({ id }) {
  const post = await db.posts.findUnique({ where: { id } });
  return &lt;article&gt;{post.content}&lt;/article&gt;;
}</code></pre><p>This pattern fundamentally changes how we build React applications, making full-stack development simpler and more efficient.</p><h3>Best Practices</h3><ol><li>Properly divide Server and Client Components</li><li>Leverage Streaming to improve initial load speed</li><li>Use Suspense to optimize loading experience</li><li>Avoid using browser APIs in Server Components</li></ol><p>React Server Components represent the future direction of the React ecosystem and are worth deep learning and practice for every React developer.</p>',
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
  '<h2>掌握 TypeScript 的类型系统</h2><p>TypeScript 的类型系统非常强大，但很多开发者只使用了其中的一小部分功能。本文将介绍一些高级类型技巧，帮助你写出更安全、更优雅的代码。</p><h3>条件类型</h3><p>条件类型允许你根据类型关系来选择不同的类型：</p><pre><code>type IsString&lt;T&gt; = T extends string ? true : false;
type A = IsString&lt;string&gt;; // true
type B = IsString&lt;number&gt;; // false</code></pre><h3>映射类型</h3><p>映射类型可以基于旧类型创建新类型：</p><pre><code>type Readonly&lt;T&gt; = {
  readonly [P in keyof T]: T[P];
};

type Partial&lt;T&gt; = {
  [P in keyof T]?: T[P];
};</code></pre><h3>模板字面量类型</h3><p>TypeScript 4.1 引入了模板字面量类型，让字符串操作更加类型安全：</p><pre><code>type EventName&lt;T extends string&gt; = `on${Capitalize&lt;T&gt;}`;
type ClickEvent = EventName&lt;"click"&gt;; // "onClick"</code></pre><h3>infer 关键字</h3><p>infer 关键字可以在条件类型中推断类型：</p><pre><code>type ReturnType&lt;T&gt; = T extends (...args: any[]) =&gt; infer R ? R : never;
type Func = () =&gt; string;
type Result = ReturnType&lt;Func&gt;; // string</code></pre><p>这些高级特性让 TypeScript 成为构建大型应用的理想选择，掌握它们将大大提升你的开发效率和代码质量。</p>',
  '<h2>Mastering TypeScript Type System</h2><p>TypeScript type system is incredibly powerful, but many developers only use a fraction of its capabilities. This article introduces some advanced type tricks to help you write safer and more elegant code.</p><h3>Conditional Types</h3><p>Conditional types allow you to select different types based on type relationships:</p><pre><code>type IsString&lt;T&gt; = T extends string ? true : false;
type A = IsString&lt;string&gt;; // true
type B = IsString&lt;number&gt;; // false</code></pre><h3>Mapped Types</h3><p>Mapped types can create new types based on old ones:</p><pre><code>type Readonly&lt;T&gt; = {
  readonly [P in keyof T]: T[P];
};

type Partial&lt;T&gt; = {
  [P in keyof T]?: T[P];
};</code></pre><h3>Template Literal Types</h3><p>TypeScript 4.1 introduced template literal types for type-safe string manipulation:</p><pre><code>type EventName&lt;T extends string&gt; = `on${Capitalize&lt;T&gt;}`;
type ClickEvent = EventName&lt;"click"&gt;; // "onClick"</code></pre><h3>infer Keyword</h3><p>The infer keyword can infer types in conditional types:</p><pre><code>type ReturnType&lt;T&gt; = T extends (...args: any[]) =&gt; infer R ? R : never;
type Func = () =&gt; string;
type Result = ReturnType&lt;Func&gt;; // string</code></pre><p>These advanced features make TypeScript an ideal choice for building large-scale applications. Mastering them will greatly improve your development efficiency and code quality.</p>',
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
  '<h2>微前端：大型应用的解决方案</h2><p>随着前端应用规模的不断增长，微前端架构成为了解决复杂性的有效方案。本文将深入探讨如何设计和实现一个可扩展的微前端系统。</p><h3>什么是微前端？</h3><p>微前端是一种将大型前端应用拆分为多个小型、独立的前端应用的架构模式。每个微应用可以独立开发、测试和部署。</p><h3>核心优势</h3><ul><li>技术栈无关：不同团队可以使用不同的框架</li><li>独立部署：减少部署风险，提高发布频率</li><li>团队自治：提高开发效率和团队士气</li><li>增量升级：逐步迁移遗留系统</li></ul><h3>实现方案对比</h3><h4>1. iframe 方案</h4><p>最简单的实现方式，但存在性能和用户体验问题。</p><h4>2. Web Components</h4><p>标准化的组件封装方案，浏览器原生支持。</p><h4>3. Module Federation</h4><p>Webpack 5 的强大特性，支持运行时动态加载模块：</p><pre><code>// 主应用配置
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: "host",
      remotes: {
        app1: "app1@http://localhost:3001/remoteEntry.js",
        app2: "app2@http://localhost:3002/remoteEntry.js"
      }
    })
  ]
};</code></pre><h4>4. Single-SPA</h4><p>成熟的微前端框架，提供完整的生命周期管理。</p><h3>最佳实践</h3><ol><li>统一的设计系统和组件库</li><li>清晰的应用边界和职责划分</li><li>高效的应用间通信机制</li><li>完善的监控和错误处理</li><li>自动化的构建和部署流程</li></ol><p>选择合适的方案需要根据团队规模、技术栈和业务需求来决定。微前端不是银弹，但在合适的场景下能够显著提升开发效率和系统可维护性。</p>',
  '<h2>Micro-Frontends: Solution for Large Applications</h2><p>As frontend applications grow in scale, micro-frontend architecture has become an effective solution for managing complexity. This article explores how to design and implement a scalable micro-frontend system.</p><h3>What are Micro-Frontends?</h3><p>Micro-frontends is an architectural pattern that breaks down large frontend applications into smaller, independent frontend apps. Each micro-app can be developed, tested, and deployed independently.</p><h3>Core Benefits</h3><ul><li>Technology Agnostic: Different teams can use different frameworks</li><li>Independent Deployment: Reduced deployment risks, higher release frequency</li><li>Team Autonomy: Improved development efficiency and team morale</li><li>Incremental Upgrades: Gradually migrate legacy systems</li></ul><h3>Implementation Approaches Comparison</h3><h4>1. iframe Approach</h4><p>Simplest implementation but with performance and UX issues.</p><h4>2. Web Components</h4><p>Standardized component encapsulation with native browser support.</p><h4>3. Module Federation</h4><p>Powerful Webpack 5 feature supporting runtime dynamic module loading:</p><pre><code>// Host app configuration
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: "host",
      remotes: {
        app1: "app1@http://localhost:3001/remoteEntry.js",
        app2: "app2@http://localhost:3002/remoteEntry.js"
      }
    })
  ]
};</code></pre><h4>4. Single-SPA</h4><p>Mature micro-frontend framework with complete lifecycle management.</p><h3>Best Practices</h3><ol><li>Unified design system and component library</li><li>Clear application boundaries and responsibilities</li><li>Efficient inter-app communication mechanism</li><li>Comprehensive monitoring and error handling</li><li>Automated build and deployment pipeline</li></ol><p>Choosing the right approach depends on team size, tech stack, and business requirements. Micro-frontends are not a silver bullet, but in the right scenarios, they can significantly improve development efficiency and system maintainability.</p>',
  'micro-frontend-architecture',
  '了解如何设计和实现可扩展的微前端架构，让大型前端应用的开发和维护变得更加简单高效。',
  'Learn how to design and implement scalable micro-frontend architecture to make large frontend applications easier to develop and maintain.',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
  ARRAY['Architecture', 'Micro-Frontend', 'Scalability', 'Engineering'],
  1534,
  112,
  true
),
(
  'Web 性能优化实战指南',
  'Web Performance Optimization Guide',
  '<h2>打造极致的用户体验</h2><p>Web 性能优化是提升用户体验的关键。本文将分享一些实用的性能优化技巧和最佳实践。</p><h3>性能指标</h3><p>首先要了解关键的性能指标：</p><ul><li>FCP (First Contentful Paint)：首次内容绘制</li><li>LCP (Largest Contentful Paint)：最大内容绘制</li><li>FID (First Input Delay)：首次输入延迟</li><li>CLS (Cumulative Layout Shift)：累积布局偏移</li></ul><h3>优化策略</h3><h4>1. 资源优化</h4><pre><code>// 图片懒加载
&lt;img loading="lazy" src="image.jpg" alt="description" /&gt;

// 代码分割
const Component = lazy(() =&gt; import("./Component"));</code></pre><h4>2. 缓存策略</h4><p>合理使用浏览器缓存和 CDN 加速：</p><pre><code>// Service Worker 缓存
self.addEventListener("fetch", (event) =&gt; {
  event.respondWith(
    caches.match(event.request).then((response) =&gt; {
      return response || fetch(event.request);
    })
  );
});</code></pre><h4>3. 渲染优化</h4><ul><li>使用 CSS containment 隔离渲染</li><li>避免强制同步布局</li><li>使用 requestAnimationFrame 优化动画</li><li>虚拟滚动处理长列表</li></ul><h4>4. 网络优化</h4><ul><li>HTTP/2 多路复用</li><li>资源预加载和预连接</li><li>压缩和最小化资源</li><li>使用 WebP 等现代图片格式</li></ul><h3>监控和分析</h3><p>使用 Lighthouse、WebPageTest 等工具持续监控性能指标，及时发现和解决问题。</p><p>性能优化是一个持续的过程，需要在开发的每个阶段都保持关注。记住：快速的网站不仅能提升用户体验，还能提高转化率和 SEO 排名。</p>',
  '<h2>Creating Ultimate User Experience</h2><p>Web performance optimization is key to enhancing user experience. This article shares practical performance optimization techniques and best practices.</p><h3>Performance Metrics</h3><p>First, understand the key performance metrics:</p><ul><li>FCP (First Contentful Paint)</li><li>LCP (Largest Contentful Paint)</li><li>FID (First Input Delay)</li><li>CLS (Cumulative Layout Shift)</li></ul><h3>Optimization Strategies</h3><h4>1. Resource Optimization</h4><pre><code>// Image lazy loading
&lt;img loading="lazy" src="image.jpg" alt="description" /&gt;

// Code splitting
const Component = lazy(() =&gt; import("./Component"));</code></pre><h4>2. Caching Strategy</h4><p>Properly use browser cache and CDN acceleration:</p><pre><code>// Service Worker caching
self.addEventListener("fetch", (event) =&gt; {
  event.respondWith(
    caches.match(event.request).then((response) =&gt; {
      return response || fetch(event.request);
    })
  );
});</code></pre><h4>3. Rendering Optimization</h4><ul><li>Use CSS containment to isolate rendering</li><li>Avoid forced synchronous layout</li><li>Use requestAnimationFrame for animations</li><li>Virtual scrolling for long lists</li></ul><h4>4. Network Optimization</h4><ul><li>HTTP/2 multiplexing</li><li>Resource preloading and preconnecting</li><li>Compress and minimize resources</li><li>Use modern image formats like WebP</li></ul><h3>Monitoring and Analysis</h3><p>Use tools like Lighthouse and WebPageTest to continuously monitor performance metrics and identify issues promptly.</p><p>Performance optimization is an ongoing process that requires attention at every stage of development. Remember: a fast website not only improves user experience but also boosts conversion rates and SEO rankings.</p>',
  'web-performance-optimization',
  '全面的 Web 性能优化指南，涵盖资源优化、缓存策略、渲染优化等多个方面，助你打造极致的用户体验。',
  'Comprehensive web performance optimization guide covering resource optimization, caching strategies, rendering optimization, and more.',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
  ARRAY['Performance', 'Optimization', 'Web', 'Best Practices'],
  2103,
  145,
  true
);
