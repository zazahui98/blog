'use client';

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Link as LinkIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  bucket?: string;
  folder?: string;
  immediate?: boolean; // 是否立即上传，false 则只预览
}

const ImageUpload = forwardRef(function ImageUpload({ 
  value, 
  onChange, 
  label = '图片',
  bucket = 'images',
  folder = 'uploads',
  immediate = false // 默认不立即上传
}: ImageUploadProps, ref: React.Ref<any>) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);
  const blobUrlRef = useRef<string>(''); // 用于跟踪blob URL

  // 清理blob URL的函数
  const cleanupBlobUrl = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = '';
      console.log('已清理blob URL');
    }
  };

  // 组件卸载时清理blob URL
  useEffect(() => {
    return () => {
      cleanupBlobUrl();
    };
  }, []);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    triggerUpload
  }));

  // 处理文件选择 - 立即上传或仅预览
  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }

    // 清理之前的blob URL
    cleanupBlobUrl();

    // 创建本地预览
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    blobUrlRef.current = localUrl; // 保存引用以便后续清理
    fileRef.current = file;
    console.log('创建新的blob URL:', localUrl);

    if (immediate) {
      // 立即上传模式
      await uploadImage(file);
    } else {
      // 延迟上传模式 - 只设置预览，实际上传由父组件控制
      onChange(localUrl);
    }
  };

  // 上传图片到 Supabase Storage
  const uploadImage = async (file: File) => {
    try {
      setUploading(true);

      // 生成唯一文件名
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // 上传到 Supabase Storage
      const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage error:', error);
        
        // 如果 bucket 不存在或没有权限
        if (error.message.includes('not found') || error.message.includes('Bucket')) {
          alert('⚠️ 图片存储未配置\n\n请按以下步骤配置：\n1. 打开 Supabase Dashboard\n2. 进入 SQL Editor\n3. 运行项目中的 supabase-storage-setup.sql\n\n或者使用图片 URL 方式');
          setShowUrlInput(true);
          return;
        }
        
        throw error;
      }

      // 获取公开 URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      onChange(publicUrl);
      setPreviewUrl('');
      cleanupBlobUrl(); // 上传成功后清理blob URL
      fileRef.current = null;
      
      if (immediate) {
        alert('✅ 图片上传成功！');
      }
    } catch (error) {
      console.error('上传失败:', error);
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      alert(`❌ 上传失败：${errorMsg}\n\n请使用图片 URL 方式`);
      setShowUrlInput(true);
    } finally {
      setUploading(false);
    }
  };

  // 暴露上传方法给父组件
  const triggerUpload = async () => {
    if (fileRef.current) {
      await uploadImage(fileRef.current);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    } else {
      alert('请拖拽图片文件');
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          handleFile(file);
          break;
        }
      }
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    setPreviewUrl('');
    cleanupBlobUrl(); // 移除图片时清理blob URL
    fileRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReplace = () => {
    fileInputRef.current?.click();
  };

  const displayUrl = previewUrl || value;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        {label}
      </label>

      {displayUrl ? (
        /* 已有图片 - 显示预览 */
        <div className="relative group">
          <img
            src={displayUrl}
            alt="预览"
            className="w-full h-48 object-cover rounded-xl border border-cyan-400/20"
          />
          {previewUrl && !immediate && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500/90 text-white text-xs rounded">
              未上传（将在保存时上传）
            </div>
          )}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleReplace}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
            >
              更换图片
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              移除
            </button>
          </div>
        </div>
      ) : (
        /* 上传区域 */
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onPaste={handlePaste}
          className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
            dragActive
              ? 'border-cyan-400 bg-cyan-400/10'
              : 'border-cyan-400/20 hover:border-cyan-400/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {uploading ? (
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-300">上传中...</p>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-2">
                拖拽图片到这里，或
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-cyan-400 hover:text-cyan-300 mx-1"
                >
                  点击上传
                </button>
              </p>
              <p className="text-gray-500 text-sm mb-4">
                支持 JPG、PNG、GIF，最大 5MB
              </p>
              <div className="space-y-2">
                <p className="text-gray-500 text-sm">
                  💡 提示：可以直接粘贴剪贴板中的图片
                </p>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1 mx-auto transition-colors"
                >
                  <LinkIcon className="w-4 h-4" />
                  或使用图片 URL（推荐使用图床）
                </button>
                <p className="text-gray-600 text-xs">
                  推荐图床：imgbb.com、sm.ms、imgur.com
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* URL 输入框 */}
      <AnimatePresence>
        {showUrlInput && !value && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2"
          >
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              placeholder="粘贴图片 URL"
              className="flex-1 px-4 py-2 bg-slate-800 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
            >
              确定
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default ImageUpload;
