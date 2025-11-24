'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bold, Italic, Underline, Link as LinkIcon, Image as ImageIcon,
  List, ListOrdered, Heading1, Heading2, Minus, Smile, Palette
} from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = '开始写作...',
  minHeight = '400px'
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const isComposingRef = useRef(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // 初始化内容
  useEffect(() => {
    if (editorRef.current && !isFocused && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value, isFocused]);

  // 执行格式化命令
  const execCommand = (command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    updateContent();
  };

  // 更新内容（保存光标位置）
  const updateContent = () => {
    if (editorRef.current && !isComposingRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // 处理输入
  const handleInput = () => {
    if (!isComposingRef.current) {
      updateContent();
    }
  };

  // 处理中文输入法
  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = () => {
    isComposingRef.current = false;
    updateContent();
  };

  // 处理图片粘贴
  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await uploadImage(file);
        }
      }
    }
  }, []);

  // 处理图片拖拽
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (file.type.indexOf('image') !== -1) {
        await uploadImage(file);
      }
    }
  }, []);

  // 上传图片到 Supabase Storage
  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      
      // 生成唯一文件名
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `post-images/${fileName}`;

      // 上传到 Supabase Storage
      const { error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage error:', error);
        // 如果上传失败，使用本地预览
        const localUrl = URL.createObjectURL(file);
        insertImageToEditor(localUrl);
        alert('⚠️ 图片暂存为本地预览，保存时可能需要重新上传');
        return;
      }

      // 获取公开 URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      insertImageToEditor(publicUrl);
    } catch (error) {
      console.error('上传图片失败:', error);
      alert('上传图片失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  // 插入图片到编辑器
  const insertImageToEditor = (url: string) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      editorRef.current.focus();
    }

    // 创建图片元素
    const img = document.createElement('img');
    img.src = url;
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.margin = '10px 0';
    img.style.borderRadius = '8px';
    
    // 插入图片
    const range = selection?.getRangeAt(0);
    if (range) {
      range.deleteContents();
      range.insertNode(img);
      
      // 在图片后添加一个换行
      const br = document.createElement('br');
      range.collapse(false);
      range.insertNode(br);
      
      // 移动光标到图片后
      range.setStartAfter(br);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    
    updateContent();
  };

  // 处理文件选择
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (file.type.indexOf('image') !== -1) {
        await uploadImage(file);
      }
    }
    
    // 清空 input
    e.target.value = '';
  };

  // 插入链接
  const insertLink = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString();
    
    if (!selectedText) {
      alert('请先选择要添加链接的文字');
      return;
    }
    
    const url = prompt('请输入链接地址:', 'https://');
    if (url) {
      execCommand('createLink', url);
    }
  };

  // 插入标题
  const insertHeading = (level: 1 | 2) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const heading = document.createElement(level === 1 ? 'h1' : 'h2');
    
    if (selection.toString()) {
      heading.textContent = selection.toString();
      range.deleteContents();
      range.insertNode(heading);
    } else {
      heading.innerHTML = '<br>';
      range.insertNode(heading);
      // 将光标移到标题内
      const newRange = document.createRange();
      newRange.setStart(heading, 0);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
    
    editorRef.current?.focus();
    updateContent();
  };

  // 插入分割线
  const insertDivider = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      editorRef.current?.focus();
    }

    const hr = document.createElement('hr');
    hr.style.border = 'none';
    hr.style.borderTop = '2px solid rgba(34, 211, 238, 0.3)';
    hr.style.margin = '2em 0';

    const range = selection?.getRangeAt(0);
    if (range) {
      range.deleteContents();
      range.insertNode(hr);
      
      // 在分割线后添加换行
      const br = document.createElement('br');
      range.collapse(false);
      range.insertNode(br);
      
      range.setStartAfter(br);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    
    updateContent();
  };

  // 插入表情
  const insertEmoji = (emoji: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      editorRef.current?.focus();
    }

    const range = selection?.getRangeAt(0);
    if (range) {
      const textNode = document.createTextNode(emoji);
      range.deleteContents();
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    
    setShowEmojiPicker(false);
    updateContent();
  };

  // 设置文字颜色
  const setTextColor = (color: string) => {
    execCommand('foreColor', color);
    setShowColorPicker(false);
  };

  // 常用表情列表
  const emojis = [
    '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊',
    '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘',
    '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪',
    '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒',
    '👍', '👎', '👌', '✌️', '🤞', '🤝', '👏', '🙌',
    '💪', '🔥', '✨', '⭐', '🌟', '💯', '✅', '❌',
    '❤️', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍',
    '💡', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🚀'
  ];

  // 常用颜色列表
  const colors = [
    '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff',
    '#22d3ee', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
  ];

  return (
    <div className="bg-slate-900 border border-cyan-400/20 rounded-xl overflow-hidden">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-800 border-b border-cyan-400/20 relative">
        <ToolButton onClick={() => insertHeading(1)} title="标题 1">
          <Heading1 className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => insertHeading(2)} title="标题 2">
          <Heading2 className="w-4 h-4" />
        </ToolButton>
        
        <div className="w-px h-6 bg-cyan-400/20 mx-1" />
        
        <ToolButton onClick={() => execCommand('bold')} title="粗体 (Ctrl+B)">
          <Bold className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => execCommand('italic')} title="斜体 (Ctrl+I)">
          <Italic className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => execCommand('underline')} title="下划线 (Ctrl+U)">
          <Underline className="w-4 h-4" />
        </ToolButton>
        
        <div className="w-px h-6 bg-cyan-400/20 mx-1" />
        
        {/* 文字颜色 */}
        <div className="relative">
          <ToolButton 
            onClick={() => setShowColorPicker(!showColorPicker)} 
            title="文字颜色"
          >
            <Palette className="w-4 h-4" />
          </ToolButton>
          
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-2 p-3 bg-slate-800 border border-cyan-400/30 rounded-lg shadow-xl z-50">
              <div className="grid grid-cols-5 gap-2 mb-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setTextColor(color)}
                    className="w-8 h-8 rounded border-2 border-gray-600 hover:border-cyan-400 transition-colors"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <button
                onClick={() => setShowColorPicker(false)}
                className="w-full text-xs text-gray-400 hover:text-cyan-400 transition-colors"
              >
                关闭
              </button>
            </div>
          )}
        </div>
        
        <div className="w-px h-6 bg-cyan-400/20 mx-1" />
        
        <ToolButton onClick={insertLink} title="插入链接">
          <LinkIcon className="w-4 h-4" />
        </ToolButton>
        
        <ToolButton onClick={insertDivider} title="插入分割线">
          <Minus className="w-4 h-4" />
        </ToolButton>
        
        <div className="w-px h-6 bg-cyan-400/20 mx-1" />
        
        <ToolButton onClick={() => execCommand('insertUnorderedList')} title="无序列表">
          <List className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => execCommand('insertOrderedList')} title="有序列表">
          <ListOrdered className="w-4 h-4" />
        </ToolButton>
        
        <div className="w-px h-6 bg-cyan-400/20 mx-1" />
        
        {/* 表情选择器 */}
        <div className="relative">
          <ToolButton 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
            title="插入表情"
          >
            <Smile className="w-4 h-4" />
          </ToolButton>
          
          {showEmojiPicker && (
            <div className="absolute top-full left-0 mt-2 p-3 bg-slate-800 border border-cyan-400/30 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
              <div className="grid grid-cols-8 gap-2 mb-2">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => insertEmoji(emoji)}
                    className="w-8 h-8 text-2xl hover:bg-slate-700 rounded transition-colors"
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="w-full text-xs text-gray-400 hover:text-cyan-400 transition-colors"
              >
                关闭
              </button>
            </div>
          )}
        </div>
        
        <label className="cursor-pointer" title="插入图片">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="p-2 rounded-lg hover:bg-slate-700 text-gray-400 hover:text-cyan-400 transition-colors">
            <ImageIcon className="w-4 h-4" />
          </div>
        </label>
        
        {uploading && (
          <span className="text-xs text-cyan-400 ml-2">上传中...</span>
        )}
      </div>

      {/* 编辑区域 */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="p-4 text-white focus:outline-none overflow-auto editor-content"
        style={{ 
          minHeight,
          lineHeight: '1.8',
          fontSize: '16px'
        }}
        data-placeholder={placeholder}
      />

      <style jsx global>{`
        .editor-content:empty:before {
          content: attr(data-placeholder);
          color: #6b7280;
          font-style: italic;
          pointer-events: none;
        }
        .editor-content h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.8em 0 0.5em 0;
          color: #22d3ee;
          line-height: 1.3;
        }
        .editor-content h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.8em 0 0.5em 0;
          color: #22d3ee;
          line-height: 1.3;
        }
        .editor-content h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 0.8em 0 0.5em 0;
          color: #22d3ee;
          line-height: 1.3;
        }
        .editor-content p {
          margin: 0.8em 0;
          color: #fff;
          line-height: 1.8;
        }
        .editor-content a {
          color: #22d3ee;
          text-decoration: underline;
          cursor: pointer;
        }
        .editor-content a:hover {
          color: #06b6d4;
        }
        .editor-content pre {
          background: #1e293b;
          padding: 1em;
          border-radius: 0.5em;
          overflow-x: auto;
          color: #22d3ee;
          font-family: 'Courier New', monospace;
          margin: 1em 0;
          border: 1px solid #334155;
        }
        .editor-content code {
          background: #1e293b;
          padding: 0.2em 0.4em;
          border-radius: 0.25em;
          color: #22d3ee;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
        .editor-content blockquote {
          border-left: 4px solid #22d3ee;
          padding-left: 1em;
          margin: 1em 0;
          color: #94a3b8;
          font-style: italic;
          background: #1e293b;
          padding: 1em;
          border-radius: 0.5em;
        }
        .editor-content ul, .editor-content ol {
          margin: 1em 0;
          padding-left: 2em;
          color: #fff;
        }
        .editor-content li {
          margin: 0.5em 0;
          line-height: 1.6;
        }
        .editor-content img {
          max-width: 100%;
          height: auto;
          margin: 1em 0;
          border-radius: 8px;
          display: block;
        }
        .editor-content strong {
          font-weight: bold;
          color: #fff;
        }
        .editor-content em {
          font-style: italic;
        }
        .editor-content u {
          text-decoration: underline;
        }
        .editor-content hr {
          border: none;
          border-top: 2px solid rgba(34, 211, 238, 0.3);
          margin: 2em 0;
          display: block;
        }
        .editor-content font[color] {
          color: inherit !important;
        }
        .editor-content em {
          font-style: italic;
        }
        .editor-content u {
          text-decoration: underline;
        }
        .editor-content br {
          display: block;
          content: "";
          margin: 0.5em 0;
        }
      `}</style>
    </div>
  );
}

function ToolButton({ 
  onClick, 
  title, 
  children 
}: { 
  onClick: () => void; 
  title: string; 
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      title={title}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="p-2 rounded-lg hover:bg-slate-700 text-gray-400 hover:text-cyan-400 transition-colors"
    >
      {children}
    </motion.button>
  );
}
