import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFile } from '@/api/file';
import { ImageFile } from '@/components/ImageUpdate';

interface UseImageUploadProps {
  setImages: React.Dispatch<React.SetStateAction<ImageFile[]>>;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

export const useImageUpload = ({
  setImages,
  onSuccess,
  onError,
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

      try {
        await Promise.all(imageFiles.map(handleSingleFileUpload));
      } catch (error) {
        console.error('批量上传图片失败:', error);
      }
    },
    [handleSingleFileUpload]
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
  };
}; 