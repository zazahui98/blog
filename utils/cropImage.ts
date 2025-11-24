/**
 * 图片裁剪工具函数
 * 配合 react-easy-crop 库使用，将裁剪区域转换为实际的图片文件
 */

/**
 * 创建裁剪后的图片
 * @param imageSrc 原始图片的 DataURL
 * @param pixelCrop 裁剪区域的像素信息
 * @param rotation 旋转角度
 * @param fileName 文件名
 * @returns Promise<File> 裁剪后的图片文件
 */
export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: { width: number; height: number; x: number; y: number },
  rotation: number = 0,
  fileName: string = 'cropped.jpg'
): Promise<File> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('无法获取 2D 渲染上下文');
  }

  // 设置合适的输出尺寸，确保头像质量
  const maxSize = 800;
  const outputSize = Math.min(maxSize, Math.max(pixelCrop.width, pixelCrop.height));
  
  // 计算缩放比例
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  
  // 计算实际裁剪区域
  const actualCropWidth = pixelCrop.width * scaleX;
  const actualCropHeight = pixelCrop.height * scaleY;
  const actualCropX = pixelCrop.x * scaleX;
  const actualCropY = pixelCrop.y * scaleY;

  // 设置画布尺寸
  canvas.width = outputSize;
  canvas.height = outputSize;

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 如果有旋转，应用旋转变换
  if (rotation !== 0) {
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
  }

  // 创建圆形裁剪路径
  ctx.save();
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  // 计算绘制参数，确保图片填充整个画布
  const drawWidth = canvas.width;
  const drawHeight = canvas.height;
  const drawX = 0;
  const drawY = 0;

  // 计算源图片的裁剪区域
  const sourceX = actualCropX;
  const sourceY = actualCropY;
  const sourceWidth = actualCropWidth;
  const sourceHeight = actualCropHeight;



  // 使用高质量绘制
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 绘制图片
  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );

  ctx.restore();

  // 转换为 Blob
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error('无法创建 Blob 对象');
          return;
        }
        resolve(new File([blob], fileName, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.95
    );
  });
};

/**
 * 创建图片对象
 * @param imageSrc 图片的 DataURL
 * @returns Promise<HTMLImageElement> 图片对象
 */
const createImage = (imageSrc: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = imageSrc;
  });
};

/**
 * 生成图片预览
 * @param file 图片文件
 * @returns Promise<string> 图片的 DataURL
 */
export const getPreviewImg = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      }
    });
    reader.readAsDataURL(file);
  });
};