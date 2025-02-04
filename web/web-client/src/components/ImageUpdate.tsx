import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { AttachFile as AttachFileIcon } from "@mui/icons-material";
import { useImageUpload } from "@/hooks/useImageUpload";

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
  // 使用图片上传Hook
  const { handlePaste, handleDeleteImage, dropzoneProps } = useImageUpload({
    setImages,
    onError: (error) => console.error("上传失败:", error),
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>上传图片</DialogTitle>
      <DialogContent>
        {/* 拖拽上传区域 */}
        <Box
          {...dropzoneProps.getRootProps()}
          className={`relative border-2 border-dashed p-8 text-center cursor-pointer transition-colors
            ${dropzoneProps.isDragActive ? "border-blue-500 bg-blue-50" : "hover:border-blue-500"}`}
        >
          <input {...dropzoneProps.getInputProps()} />
          <AttachFileIcon className="text-4xl mb-2" />
          <Typography>
            {dropzoneProps.isDragActive ? "放开以添加图片" : "点击或拖拽图片到此处上传"}
          </Typography>
        </Box>

        {/* 图片预览区域 */}
        {images.length > 0 && (
          <Box className="mt-4">
            {/* 已上传完成的图片 */}
            <Box className="grid grid-cols-3 gap-4">
              {images
                .filter(img => img.rawUrl && img.progress === 100)
                .map((img, index) => (
                  <Box key={img.preview} className="relative aspect-square">
                    <img
                      src={img.rawUrl}
                      alt={`预览图 ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                    <Button
                      size="small"
                      className="absolute top-1 right-1 min-w-0 p-1 bg-white/80 hover:bg-white"
                      onClick={() => handleDeleteImage(index)}
                    >
                      ×
                    </Button>
                  </Box>
                ))}
            </Box>

            {/* 上传中的图片 */}
            <Box className="grid grid-cols-3 gap-4 mt-4">
              {images
                .filter(img => !img.rawUrl || img.progress < 100)
                .map((img) => (
                  <Box key={img.preview} className="relative aspect-square">
                    <img
                      src={img.preview}
                      alt="上传中"
                      className="w-full h-full object-cover rounded"
                    />
                    <Box
                      className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"
                      style={{ width: `${img.progress}%` }}
                    />
                  </Box>
                ))}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button
          variant="contained"
          onClick={onClose}
          disabled={images.some(img => img.progress < 100)}
        >
          确认
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageUpdate;
