import { useCallback } from 'react';
import { uploadFile } from '@/api/file';
import { ImageFile } from '@/components/ImageUpdate';

interface UsePasteUploadProps {
  setImages: React.Dispatch<React.SetStateAction<ImageFile[]>>;
  onSuccess?: () => void;
  onError?: () => void;
}

export const usePasteUpload = ({
  setImages,
  onSuccess,
  onError,
}: UsePasteUploadProps) => {
  const handlePaste = useCallback(
    async (event: React.ClipboardEvent) => {
      const items = event.clipboardData.items;
      const imageFiles: File[] = [];

      // 收集所有图片文件
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            imageFiles.push(file);
          }
        }
      }

      // 如果没有图片文件，直接返回
      if (imageFiles.length === 0) return;

      // 处理每个图片文件
      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append('file', file);
        const preview = URL.createObjectURL(file);

        // 创建新的图片对象
        const newImage: ImageFile = {
          file,
          preview,
          progress: 0,
          rawUrl: '',
        };

        // 添加到图片列表
        setImages((prev) => [...prev, newImage]);

        try {
          // 上传图片
          const url = await uploadFile(formData);

          // 更新图片状态
          setImages((prev) => {
            const index = prev.findIndex((img) => img.preview === preview);
            if (index === -1) return prev;
            const newImages = [...prev];
            newImages[index] = {
              ...newImages[index],
              progress: 100,
              rawUrl: url,
            };
            return newImages;
          });

          onSuccess?.();
        } catch (error) {
          console.error('图片上传失败:', error);
          // 移除上传失败的图片
          setImages((prev) => prev.filter((img) => img.preview !== preview));
          onError?.();
          URL.revokeObjectURL(preview);
        }
      }
    },
    [setImages, onSuccess, onError]
  );

  return { handlePaste };
}; 