import { useState, KeyboardEvent, useRef } from "react";
import { TextField, Button, Box, Typography, IconButton } from "@mui/material";
import { Send as SendIcon, AttachFile as AttachFileIcon } from "@mui/icons-material";
import { useCommentStore } from "@/store/commentStore";
import { usePlayerStore } from "@/store/playerStore";
import useUserStore from "@/store/userStore";
import { addCommentApi, AddCommentReq, getCommentListApi } from "@/api/comment";
import { useParams } from "next/navigation";
import ImagePreview from "@/components/ImagePreview";
import { ImageFile } from "@/components/ImageUpdate";
import { useImageUpload } from "@/hooks/useImageUpload";
import toast from "react-hot-toast";

// 新增常量
const TOAST_CONFIG = {
  position: "bottom-right" as const,
  duration: 3000,
};

export const TextEditor = () => {
  // 状态管理
  const params = useParams();
  const mediaId = Number(params.id);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<ImageFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Store hooks
  const { setComments } = useCommentStore();
  const { player } = usePlayerStore();
  const { user } = useUserStore();

  // 使用图片上传Hook
  const { handlePaste, handleDeleteImage, dropzoneProps, handleSingleFileUpload } = useImageUpload({
    setImages,
    onSuccess: () => toast.success("图片已成功上传", TOAST_CONFIG),
    onError: () => toast.error("图片上传失败", TOAST_CONFIG),
  });

  // 处理评论提交
  const handleSubmit = async (): Promise<void> => {
    if (!content.trim() && images.length === 0) return;
    if (!player) return;
    if (!user?.id) throw new Error("用户未登录");

    try {
      const newComment: AddCommentReq = {
        content: content.trim(),
        imageUrls: images.map((img) => img.rawUrl),
        timestamp: player.getCurrentTime(),
        mediaId,
        userId: user.id,
      };

      await addCommentApi(newComment);
      const comments = await getCommentListApi(mediaId);

      // 重置状态
      setContent("");
      setImages([]);
      setComments(comments);
    } catch (error: unknown) {
      toast.error("评论发送失败", error || "未知错误");
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === "Enter") {
      if (e.metaKey || e.ctrlKey) {
        // Command/Control + Enter: 插入换行
        setContent((prev) => prev + "\n");
      } else {
        // 仅 Enter: 提交
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  // 处理文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    try {
      await Promise.all(
        Array.from(files)
          .filter(file => file.type.startsWith('image/'))
          .map(file => handleSingleFileUpload(file))
      );
    } catch (err: unknown) {
      console.error('文件上传失败:', err);
      toast.error('文件上传失败', TOAST_CONFIG);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative">
      {/* 拖拽区域 */}
      <div
        {...dropzoneProps.getRootProps({
          onClick: (e) => e.stopPropagation(),
        })}
        className="absolute inset-0 z-0"
      >
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
          onKeyDown={handleKeyDown}
          placeholder="写下你的评论...(回车发送，Command/Ctrl+回车换行)"
          variant="standard"
          className="p-4"
          sx={{
            "& .MuiInput-underline:before": { borderBottom: "none" },
            "& .MuiInput-underline:after": { borderBottom: "none" },
            "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
              borderBottom: "none",
            },
          }}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          multiple
          className="hidden"
        />
        <IconButton
          onClick={() => fileInputRef.current?.click()}
          className="ml-2"
          size="small"
          sx={{ mr: 1 }}
        >
          <AttachFileIcon />
        </IconButton>
        <Button
          variant="contained"
          size="small"
          endIcon={<SendIcon />}
          onClick={handleSubmit}
          // 这里一定要有文字评论
          disabled={!content.trim()}
          className="ml-2"
        >
          发送
        </Button>

        {/* 上传图片展示 */}
        {images.length > 0 && (
          <Box className="p-2">
            <ImagePreview
              images={images
                .filter((img) => img.rawUrl && img.progress === 100)
                .map((img) => img.rawUrl)}
              width="100%"
              cols={6}
              handleDelete={handleDeleteImage}
            />
            {/* 显示上传中的图片预览 */}
            <Box className="grid grid-cols-6 gap-2 mt-2">
              {images
                .filter((img) => !img.rawUrl || img.progress < 100)
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
    </div>
  );
};

export default TextEditor;
