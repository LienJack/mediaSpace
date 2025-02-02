import { useState, useCallback } from "react";
import {
  TextField,
  Button,
  Box,
  IconButton,
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
import { ImageUpdate } from "@/components/ImageUpdate";
import ImagePreview from "@/components/ImagePreview";
import { ImageFile } from "@/components/ImageUpdate";
export const TextEditor = () => {
  // 状态管理
  const params = useParams();
  const mediaId = Number(params.id);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<ImageFile[]>([]);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);

  // Store hooks
  const { setComments } = useCommentStore();
  const { player } = usePlayerStore();
  const { user } = useUserStore();

  // 工具栏配置
  const toolbarButtons = [
    {
      icon: <CloseIcon />,
      label: "关闭",
      onClick: () => {},
    },
    {
      icon: <AttachFileIcon />,
      label: "附件",
      onClick: () => setOpenUploadDialog(true),
    },
  ];

  // 发送评论
  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) return;
    if (!player) return;

    const newComment: AddCommentReq = {
      content: content.trim(),
      imageUrls: images.map(img => img.rawUrl),
      timestamp: Math.round(player.currentTime),
      mediaId: mediaId,
      userId: +user.id,
    };

    await addCommentApi(newComment);
    const comments = await getCommentListApi(mediaId);
    setContent("");
    setImages([]);
    setComments(comments);
  };

  return (
    <div>
      {/* 文字输入区域 */}
      <TextField
        multiline
        rows={4}
        fullWidth
        value={content}
        onChange={(e) => setContent(e.target.value)}
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
          {toolbarButtons.map((button, index) => (
            <IconButton
              key={index}
              size="small"
              onClick={button.onClick}
              aria-label={button.label}
            >
              {button.icon}
            </IconButton>
          ))}
        </Box>

        <Button
          variant="contained"
          size="small"
          endIcon={<SendIcon />}
          onClick={handleSubmit}
          disabled={!content.trim() && images.length === 0}
          className="ml-2"
        >
          发送
        </Button>
      </Box>

      {/* 上传图片展示 */}
      { !openUploadDialog && images.length > 0 && <ImagePreview images={images.map(img => img.rawUrl)} width="100%" cols={6} /> }

      {/* 图片上传对话框 */}
      <ImageUpdate
        open={openUploadDialog}
        onClose={() => setOpenUploadDialog(false)}
        images={images}
        setImages={setImages}
      />
    </div>
  );
};

export default TextEditor;
