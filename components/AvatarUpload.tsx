'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, User } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import Toast from './Toast';
import { useToast } from '@/hooks/useToast';
import AvatarCropper from './AvatarCropper';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  onUploadSuccess: (url: string) => void;
  userId: string;
}

export default function AvatarUpload({ currentAvatar, onUploadSuccess, userId }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentAvatar || '');
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型 - 更严格的检查
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('请选择有效的图片文件 (JPG, PNG, GIF, WebP)', 'warning');
      return;
    }

    // 验证文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      showToast('图片大小不能超过 5MB', 'warning');
      return;
    }

    // 验证图片尺寸
    const img = new Image();
    img.onload = () => {
      if (img.width < 100 || img.height < 100) {
        showToast('图片尺寸太小，请选择至少 100x100 像素的图片', 'warning');
        return;
      }
      
      if (img.width > 4000 || img.height > 4000) {
        showToast('图片尺寸太大，请选择小于 4000x4000 像素的图片', 'warning');
        return;
      }

      // 显示裁剪器
      setSelectedFile(file);
      setShowCropper(true);
    };
    
    img.onerror = () => {
      showToast('无法读取图片文件，请检查文件是否损坏', 'error');
    };
    
    img.src = URL.createObjectURL(file);
    
    // 清理URL
    setTimeout(() => {
      URL.revokeObjectURL(img.src);
    }, 1000);
  };

  const handleCropComplete = async (croppedFile: File) => {
    setShowCropper(false);
    setUploading(true);

    try {
      // 1. 删除旧头像（如果存在）
      if (currentAvatar) {
        try {
          // 从URL中提取文件路径
          const oldFileName = currentAvatar.split('/').pop();
          if (oldFileName && oldFileName.includes(userId)) {
            const oldFilePath = `avatars/${oldFileName}`;
            await supabase.storage
              .from('avatars')
              .remove([oldFilePath]);
          }
        } catch (error) {
          console.log('删除旧头像失败（可能不存在）:', error);
          // 继续上传新头像
        }
      }

      // 2. 生成唯一文件名
      const fileName = `${userId}-${Date.now()}.jpg`;
      const filePath = `avatars/${fileName}`;

      // 3. 上传新头像到 Supabase Storage - 添加重试机制
      const uploadWithRetry = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            const { error: uploadError } = await supabase.storage
              .from('avatars')
              .upload(filePath, croppedFile, {
                cacheControl: '3600',
                upsert: false, // 不覆盖，因为文件名是唯一的
              });

            if (!uploadError) return;
            
            if (i === retries - 1) throw uploadError;
            
            // 等待后重试
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      };

      await uploadWithRetry();

      // 4. 获取公开 URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;
      
      // 5. 更新预览
      setPreview(publicUrl);
      
      // 6. 更新数据库 - 添加错误处理
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrl } as never)
        .eq('id', userId);

      if (updateError) {
        // 如果数据库更新失败，删除已上传的文件
        try {
          await supabase.storage.from('avatars').remove([filePath]);
        } catch (cleanupError) {
          console.error('清理失败头像失败:', cleanupError);
        }
        throw updateError;
      }

      onUploadSuccess(publicUrl);
      showToast('头像上传成功！', 'success');
      
      // 清理选择的文件
      setSelectedFile(null);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      
      // 根据错误类型提供更友好的提示
      let errorMsg = '';
      if (error?.message?.includes('StorageError')) {
        if (error?.message?.includes('bucket not found')) {
          errorMsg = '存储桶不存在，请联系管理员配置';
        } else if (error?.message?.includes('file size')) {
          errorMsg = '文件大小超过限制（最大5MB）';
        } else if (error?.message?.includes('file type')) {
          errorMsg = '不支持的文件类型，请上传JPG、PNG或GIF格式图片';
        } else if (error?.message?.includes('permission')) {
          errorMsg = '没有上传权限，请检查登录状态';
        } else if (error?.message?.includes('quota')) {
          errorMsg = '存储空间已满，请联系管理员';
        } else if (error?.message?.includes('duplicate')) {
          errorMsg = '文件名重复，请稍后重试';
        } else {
          errorMsg = '头像上传失败：' + (error?.message || '未知错误');
        }
      } else if (error?.message?.includes('network')) {
        errorMsg = '网络连接失败，请检查网络后重试';
      } else if (error?.message?.includes('timeout')) {
        errorMsg = '上传超时，请检查网络连接或减小图片大小';
      } else if (error?.message?.includes('abort')) {
        errorMsg = '上传已取消';
      } else if (error?.message?.includes('user_profiles')) {
        errorMsg = '用户资料更新失败，请重新登录后重试';
      } else {
        errorMsg = error instanceof Error ? error.message : '未知错误';
      }
      
      showToast(`上传失败：${errorMsg}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* 头像预览 */}
      <div className="relative">
        {preview ? (
          <img
            src={preview}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-2 border-cyan-400/30"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
        )}
        
        {uploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* 上传按钮 */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-cyan-400/20 text-white rounded-xl transition-all disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          <span>{uploading ? '上传中...' : '上传头像'}</span>
        </motion.button>
        
        <p className="text-xs text-gray-500 mt-2">
          支持 JPG、PNG、GIF，最大 5MB
        </p>
      </div>

      {/* 头像裁剪器 */}
      {mounted && selectedFile && (
        <AvatarCropper
          imageFile={selectedFile}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setSelectedFile(null);
          }}
        />
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}