'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { Area, Point } from 'react-easy-crop';
import { X, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { getCroppedImg } from '@/utils/cropImage';

interface AvatarCropperProps {
  imageFile: File;
  onCropComplete: (croppedFile: File) => void;
  onCancel: () => void;
}

/**
 * 使用 react-easy-crop 库实现的头像裁剪组件
 * 提供更流畅的用户体验和更稳定的裁剪功能
 */
export default function AvatarCropper({ imageFile, onCropComplete, onCancel }: AvatarCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 初始化图片
  useEffect(() => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        setImageSrc(reader.result);
      }
    });
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  /**
   * 裁剪区域完成时的回调
   * @param croppedArea 裁剪区域百分比
   * @param croppedAreaPixels 裁剪区域像素值
   */
  const onCropCompleteHandler = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  /**
   * 处理确认裁剪
   * 创建裁剪后的图片文件并传递给父组件
   */
  const handleConfirm = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      console.log('开始裁剪图片，参数:', { 
        imageSrc: imageSrc.substring(0, 50) + '...', 
        pixelCrop: croppedAreaPixels, 
        rotation 
      });
      
      const croppedFile = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        imageFile.name
      );
      
      console.log('裁剪完成，文件大小:', croppedFile.size);
      setIsProcessing(false);
      onCropComplete(croppedFile);
    } catch (error) {
      // 错误处理
      setIsProcessing(false);
    }
  }, [imageSrc, croppedAreaPixels, rotation, imageFile, onCropComplete]);

  /**
   * 处理缩放变化
   * @param value 新的缩放值
   */
  const handleZoomChange = useCallback((value: number) => {
    setZoom(value);
    console.log('缩放变化:', value);
  }, []);

  /**
   * 处理旋转变化
   * @param value 新的旋转值
   */
  const handleRotationChange = useCallback((value: number) => {
    setRotation(value);
    console.log('旋转变化:', value);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="glass-dark rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-800">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white glow">裁剪头像</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* 裁剪区域 */}
        <div className="relative bg-gray-900 h-96">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1} // 1:1 比例，适合头像
              onCropChange={setCrop}
              onCropComplete={onCropCompleteHandler}
              onZoomChange={handleZoomChange}
              onRotationChange={handleRotationChange}
              restrictPosition={true}
              minZoom={0.5}
              maxZoom={3}
              cropShape="round" // 圆形裁剪区域
              showGrid={false}
              objectFit="contain"
            />
          )}
        </div>

        {/* 控制区域 */}
        <div className="p-6 space-y-4 bg-gray-900">
          {/* 缩放控制 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <ZoomIn className="w-4 h-4" />
                缩放
              </label>
              <span className="text-sm text-gray-400">{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              value={zoom}
              min={0.5}
              max={3}
              step={0.1}
              onChange={(e) => handleZoomChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${(zoom - 0.5) / 2.5 * 100}%, #374151 ${(zoom - 0.5) / 2.5 * 100}%, #374151 100%)`
              }}
              disabled={isProcessing}
            />
          </div>

          {/* 旋转控制 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <RotateCw className="w-4 h-4" />
                旋转
              </label>
              <span className="text-sm text-gray-400">{rotation}°</span>
            </div>
            <input
              type="range"
              value={rotation}
              min={-180}
              max={180}
              step={1}
              onChange={(e) => handleRotationChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${(rotation + 180) / 360 * 100}%, #374151 ${(rotation + 180) / 360 * 100}%, #374151 100%)`
              }}
              disabled={isProcessing}
            />
          </div>

          {/* 快捷操作按钮 */}
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => handleZoomChange(Math.max(0.5, zoom - 0.1))}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              disabled={isProcessing}
            >
              <ZoomOut className="w-4 h-4 text-gray-300" />
            </button>
            <button
              onClick={() => handleZoomChange(Math.min(3, zoom + 0.1))}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              disabled={isProcessing}
            >
              <ZoomIn className="w-4 h-4 text-gray-300" />
            </button>
            <button
              onClick={() => handleRotationChange(0)}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              disabled={isProcessing}
            >
              <RotateCw className="w-4 h-4 text-gray-300" />
            </button>
          </div>

          {/* 确认按钮 */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
              disabled={isProcessing}
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow"
              disabled={isProcessing || !croppedAreaPixels}
            >
              {isProcessing ? '处理中...' : '确认'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}