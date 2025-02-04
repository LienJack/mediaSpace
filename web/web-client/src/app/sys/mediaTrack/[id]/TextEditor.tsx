import { useState } from "react";
import {
  TextField,
  Button,
  Box,
  IconButton,
  Snackbar,
  Alert,
  Typography,
} from "@mui/material";
import {
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { useCommentStore } from "@/store/commentStore";
import { usePlayerStore } from "@/store/playerStore";
import useUserStore from "@/store/userStore";
import { addCommentApi, AddCommentReq, getCommentListApi } from "@/api/comment";
import { useParams } from "next/navigation";
import ImagePreview from "@/components/ImagePreview";
import { ImageFile } from "@/components/ImageUpdate";
import { useImageUpload } from "@/hooks/useImageUpload";

export const TextEditor = () => {
  // 状态管理
  const params = useParams();
  const mediaId = Number(params.id);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<ImageFile[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Store hooks
  const { setComments } = useCommentStore();
  const { player } = usePlayerStore();
  const { user } = useUserStore();

  // 使用图片上传Hook
  const { handlePaste, handleDeleteImage, dropzoneProps } = useImageUpload({
    setImages,
    onSuccess: () => {
      setSnackbarMessage("图片已成功上传");
      setSnackbarOpen(true);
    },
    onError: () => {
      setSnackbarMessage("图片上传失败");
      setSnackbarOpen(true);
    },
  });

  // 发送评论
  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) return;
    if (!player) return;

    if (!user?.id) {
      throw new Error('用户未登录');
    }

    const newComment: AddCommentReq = {
      content: content.trim(),
      imageUrls: images.map(img => img.rawUrl),
      timestamp: Math.round(player.currentTime),
      mediaId: mediaId,
      userId: user.id,
    };

    await addCommentApi(newComment);
    const comments = await getCommentListApi(mediaId);
    setContent("");
    setImages([]);
    setComments(comments);
  };

  return (
    <div className="relative">
      {/* 拖拽区域 */}
      <div {...dropzoneProps.getRootProps({
        onClick: (e) => e.stopPropagation()
      })} className="absolute inset-0 z-0">
        <input {...dropzoneProps.getInputProps()} />
      </div>

      {/* 拖拽提示 */}
      {dropzoneProps.isDragActive && (
        <Box className="absolute inset-0 bg-blue-50/80 flex items-center justify-center z-10">
          <Typography variant="h6">放开以添加图片</Typography>
        </Box>
      )}

      {/* 文字输入区域 */}
      <div className="relative z-1">
        <TextField
          multiline
          rows={4}
          fullWidth
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onPaste={handlePaste}
          placeholder="写下你的评论..."
          variant="standard"
          className="p-4"
          InputProps={{
            disableUnderline: true,
          }}
        />

        {/* 工具栏 */}
        <Box className="flex items-center justify-between border-t p-2">
          <Box className="flex gap-1">
            <IconButton
              size="small"
              onClick={() => {}}
              aria-label="关闭"
            >
              <CloseIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                input?.click();
              }}
              aria-label="附件"
            >
              <AttachFileIcon />
            </IconButton>
          </Box>

          <Button
            variant="contained"
            size="small"
            endIcon={<SendIcon />}
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="ml-2"
          >
            发送
          </Button>
        </Box>

        {/* 上传图片展示 */}
        {images.length > 0 && (
          <Box className="p-2">
            <ImagePreview 
              images={images
                .filter(img => img.rawUrl && img.progress === 100)
                .map(img => img.rawUrl)} 
              width="100%" 
              cols={6}
              handleDelete={handleDeleteImage}
            />
            {/* 显示上传中的图片预览 */}
            <Box className="grid grid-cols-6 gap-2 mt-2">
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
      </div>

      {/* 提示信息 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default TextEditor;
