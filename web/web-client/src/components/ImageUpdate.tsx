import { useCallback } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import {
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import { UpdateFileApi } from "@/api/file";

export interface ImageFile {
  file: File;
  preview: string;
  progress: number;
  rawUrl: string;
}

interface ImageUpdateProps {
  open: boolean;
  onClose: () => void;
  images: ImageFile[];
  setImages: React.Dispatch<React.SetStateAction<ImageFile[]>>;
}

export const ImageUpdate = ({ open, onClose, images, setImages }: ImageUpdateProps) => {
  // 图片上传处理
  const handleImageUpload = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const preview = URL.createObjectURL(file);

    const newImage: ImageFile = {
      file,
      preview,
      progress: 0,
      rawUrl: "",
    };

    setImages((prev) => [...prev, newImage]);

    try {
      const url = await UpdateFileApi(
        formData,
        (progressEvent: ProgressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setImages((prev) => {
              const index = prev.findIndex((img) => img.preview === preview);
              if (index === -1) return prev;
              const newImages = [...prev];
              newImages[index] = { ...newImages[index], progress };
              return newImages;
            });
          }
          return "";
        }
      );

      setImages((prev) => {
        const index = prev.findIndex((img) => img.preview === preview);
        if (index === -1) return prev;
        const newImages = [...prev];
        newImages[index] = { ...newImages[index], rawUrl: url };
        return newImages;
      });

      return url;
    } catch (error) {
      console.error("上传失败:", error);
      setImages((prev) => prev.filter((img) => img.preview !== preview));
      throw error;
    }
  }, [setImages]);

  // Dropzone 配置
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        const uploadPromises = acceptedFiles.map(handleImageUpload);
        const uploadedUrls = await Promise.all(uploadPromises);
        console.log("上传成功:", uploadedUrls);
      } catch (error) {
        console.error("上传过程出错:", error);
      }
    },
    [handleImageUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
  });

  // 删除图片
  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>上传图片</DialogTitle>
      <DialogContent>
        <Box
          {...getRootProps()}
          className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? "border-blue-500 bg-blue-50" : "hover:border-blue-500"}`}
        >
          <input {...getInputProps()} />
          <AttachFileIcon className="text-4xl mb-2" />
          <div>
            {isDragActive ? "放开以添加图片" : "点击或拖拽图片到此处上传"}
          </div>
        </Box>

        {images.length > 0 && (
          <Box className="grid grid-cols-3 gap-4 mt-4">
            {images.map((image, index) => (
              <Box key={index} className="relative">
                <img
                  src={image.preview}
                  alt={`预览图 ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
                <IconButton
                  size="small"
                  className="absolute top-1 right-1 bg-white/80 hover:bg-white"
                  onClick={() => handleRemoveImage(index)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
                {image.progress < 100 && (
                  <Box
                    className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"
                    style={{ width: `${image.progress}%` }}
                  />
                )}
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button
          variant="contained"
          onClick={() => {
            onClose();
            console.log(images);
          }}
          disabled={images.length === 0}
        >
          确认
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageUpdate;
