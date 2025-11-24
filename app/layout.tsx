/**
 * 根布局组件 - 定义整个应用的基础HTML结构和元数据
 * 包含字体加载、全局样式导入和基础HTML模板
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Inter字体配置 - 加载拉丁字符子集
const inter = Inter({ subsets: ["latin"] });

// 网站元数据 - 定义浏览器标签页标题和描述
export const metadata: Metadata = {
  title: "ErGou Blog - Code Art",
  description: "二狗博客 - 代码之艺",
};

// 根布局组件 - 所有页面的基础HTML结构
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // HTML根元素 - 设置语言为中文
    <html lang="zh">
      {/* 页面主体 - 应用Inter字体类名 */}
      <body className={inter.className}>{children}</body>
    </html>
  );
}
