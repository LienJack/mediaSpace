import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFile } from '@/api/file';
import { ImageFile } from '@/components/ImageUpdate';

interface UseImageUploadProps {
  setImages: React.Dispatch<React.SetStateAction<ImageFile[]>>;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
}

export const useImageUpload = ({
  setImages,
  onSuccess,
  onError,
  onProgress,
}: UseImageUploadProps) => {
  // 处理单个文件上传
  const handleSingleFileUpload = useCallback(
    async (file: File) => {
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

      let imageIndex: number;

      // 添加到图片列表
      setImages((prev) => {
        imageIndex = prev.length;
        return [...prev, newImage];
      });

      try {
        // 上传图片
        const url = await uploadFile(formData);

        // 更新图片状态
        setImages((prev) => {
          const newImages = [...prev];
          if (newImages[imageIndex]) {
            newImages[imageIndex] = {
              ...newImages[imageIndex],
              progress: 100,
              rawUrl: url,
            };
          }
          return newImages;
        });

        onSuccess?.(url);
        return url;
      } catch (error) {
        console.error('图片上传失败:', error);
        // 移除上传失败的图片
        setImages((prev) => prev.filter((img) => img.preview !== preview));
        onError?.(error as Error);
        URL.revokeObjectURL(preview);
        throw error;
      }
    },
    [setImages, onSuccess, onError]
  );

  // 处理粘贴事件
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

      if (imageFiles.length === 0) return;

      // 创建上传队列
      const uploadQueue = imageFiles.map((file) => ({
        file,
        status: 'pending' as 'pending' | 'uploading' | 'done' | 'error',
      }));

      // 并行上传所有图片，但限制并发数
      const MAX_CONCURRENT_UPLOADS = 3;
      const results: Array<string | null> = [];
      
      const uploadNext = async (index: number) => {
        if (index >= uploadQueue.length) return;
        
        const current = uploadQueue[index];
        current.status = 'uploading';
        
        try {
          const url = await handleSingleFileUpload(current.file);
          current.status = 'done';
          results[index] = url;
          
          // 更新总体进度
          const progress = Math.round(
            ((results.filter(Boolean).length) / uploadQueue.length) * 100
          );
          onProgress?.(progress);
          
          // 继续上传队列中的下一个
          await uploadNext(index + MAX_CONCURRENT_UPLOADS);
        } catch (error) {
          current.status = 'error';
          results[index] = null;
          console.error(`Failed to upload image ${index}:`, error);
        }
      };

      // 启动初始的并发上传
      try {
        await Promise.all(
          Array.from({ length: Math.min(MAX_CONCURRENT_UPLOADS, uploadQueue.length) })
            .map((_, index) => uploadNext(index))
        );
      } catch (error) {
        console.error('批量上传图片失败:', error);
      }
    },
    [handleSingleFileUpload, onProgress]
  );

  // 配置 Dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    onDrop: useCallback(
      async (acceptedFiles: File[]) => {
        try {
          await Promise.all(acceptedFiles.map(handleSingleFileUpload));
        } catch (error) {
          console.error('拖拽上传图片失败:', error);
        }
      },
      [handleSingleFileUpload]
    ),
  });

  // 删除图片
  const handleDeleteImage = useCallback((index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      if (prev[index]?.preview) {
        URL.revokeObjectURL(prev[index].preview);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  }, [setImages]);

  return {
    handlePaste,
    handleDeleteImage,
    dropzoneProps: {
      getRootProps,
      getInputProps,
      isDragActive,
    },
    handleSingleFileUpload,
  };
}; 