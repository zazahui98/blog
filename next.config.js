/** @type {import('next').NextConfig} */
const nextConfig = {
  // 生产环境优化配置
  productionBrowserSourceMaps: false,
  
  // 图片配置
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  
  // 输出配置
  output: 'standalone',
  
  // 严格模式
  reactStrictMode: true,
  
  // 实验性功能 - 保持最小配置
  experimental: {},
};

export default nextConfig;
