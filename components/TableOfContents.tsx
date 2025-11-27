'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, ChevronRight, ChevronDown } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

export default function TableOfContents({ content, className = '' }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // 从 HTML 内容中提取标题
    const extractHeadings = () => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const headings = doc.querySelectorAll('h2, h3, h4');
      
      const items: TocItem[] = [];
      headings.forEach((heading, index) => {
        const text = heading.textContent || '';
        const level = parseInt(heading.tagName.charAt(1));
        const id = `heading-${index}-${text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
        
        items.push({ id, text, level });
      });
      
      setTocItems(items);
    };

    if (content) {
      extractHeadings();
    }
  }, [content]);

  useEffect(() => {
    // 监听滚动，高亮当前可见的标题
    const handleScroll = () => {
      const headingElements = tocItems.map(item => document.getElementById(item.id));
      
      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i];
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveId(tocItems[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tocItems]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (tocItems.length === 0) return null;

  return (
    <div className={`bg-slate-900/50 border border-cyan-400/20 rounded-xl ${className}`}>
      {/* 标题栏 */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/30 transition-colors rounded-t-xl"
      >
        <div className="flex items-center gap-2">
          <List className="w-4 h-4 text-cyan-400" />
          <span className="font-medium text-white">目录</span>
          <span className="text-xs text-gray-500">({tocItems.length})</span>
        </div>
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* 目录列表 */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <nav className="p-4 pt-0 space-y-1 max-h-80 overflow-y-auto">
              {tocItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToHeading(item.id)}
                  className={`block w-full text-left text-sm transition-colors rounded px-2 py-1.5 ${
                    activeId === item.id
                      ? 'text-cyan-400 bg-cyan-500/10'
                      : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                  style={{ paddingLeft: `${(item.level - 2) * 12 + 8}px` }}
                >
                  <span className="line-clamp-1">{item.text}</span>
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 辅助函数：为文章内容中的标题添加 ID
export function addHeadingIds(content: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const headings = doc.querySelectorAll('h2, h3, h4');
  
  headings.forEach((heading, index) => {
    const text = heading.textContent || '';
    const id = `heading-${index}-${text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
    heading.setAttribute('id', id);
  });
  
  return doc.body.innerHTML;
}
