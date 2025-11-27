/**
 * SEO 配置和工具函数
 */

// 网站基础信息
export const siteConfig = {
  name: 'ErGou Blog',
  description: '分享技术知识，探索编程世界',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://ergou.blog',
  locale: 'zh_CN',
  author: 'ErGou',
  twitterHandle: '@ergou',
};

// 默认 SEO 配置
export const defaultSEO = {
  title: siteConfig.name,
  description: siteConfig.description,
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/og-image.png`,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    handle: siteConfig.twitterHandle,
    site: siteConfig.twitterHandle,
    cardType: 'summary_large_image',
  },
};

// 生成文章 SEO 配置
export function generatePostSEO(post: {
  title: string;
  excerpt?: string;
  cover_image?: string;
  slug: string;
  author?: string;
  created_at?: string;
}) {
  return {
    title: `${post.title} | ${siteConfig.name}`,
    description: post.excerpt || siteConfig.description,
    openGraph: {
      title: post.title,
      description: post.excerpt || siteConfig.description,
      url: `${siteConfig.url}/blog/${post.slug}`,
      type: 'article',
      article: {
        publishedTime: post.created_at,
        authors: [post.author || siteConfig.author],
      },
      images: post.cover_image ? [
        {
          url: post.cover_image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ] : defaultSEO.openGraph.images,
    },
  };
}


// 生成项目 SEO 配置
export function generateProjectSEO(project: {
  title: string;
  description?: string;
  cover_image?: string;
  id: string;
}) {
  return {
    title: `${project.title} | 项目 | ${siteConfig.name}`,
    description: project.description || siteConfig.description,
    openGraph: {
      title: project.title,
      description: project.description || siteConfig.description,
      url: `${siteConfig.url}/projects/${project.id}`,
      type: 'website',
      images: project.cover_image ? [
        {
          url: project.cover_image,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ] : defaultSEO.openGraph.images,
    },
  };
}

// 生成页面 SEO 配置
export function generatePageSEO(page: {
  title: string;
  description?: string;
  path: string;
}) {
  return {
    title: `${page.title} | ${siteConfig.name}`,
    description: page.description || siteConfig.description,
    openGraph: {
      title: page.title,
      description: page.description || siteConfig.description,
      url: `${siteConfig.url}${page.path}`,
      type: 'website',
    },
  };
}

// 生成 JSON-LD 结构化数据 - 网站
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

// 生成 JSON-LD 结构化数据 - 文章
export function generateArticleSchema(post: {
  title: string;
  excerpt?: string;
  cover_image?: string;
  slug: string;
  author?: string;
  created_at?: string;
  updated_at?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image,
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: {
      '@type': 'Person',
      name: post.author || siteConfig.author,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteConfig.url}/blog/${post.slug}`,
    },
  };
}

// 生成 JSON-LD 结构化数据 - 面包屑
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
