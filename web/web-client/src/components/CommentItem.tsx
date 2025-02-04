import { FC, useState } from "react";
import {
  Typography,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  TextField,
  IconButton,
} from "@mui/material";
import { Comment } from "@/types/comment";
import { formatTime } from "@/utils/time";
import ImagePreview from "@/components/ImagePreview";
import { useCommentStore } from "@/store/commentStore";
import DeleteIcon from "@mui/icons-material/Delete";
import ChatIcon from "@mui/icons-material/Chat";
// import { AddPhotoAlternate } from "@mui/icons-material";
import useUserStore from "@/store/userStore";
import {
  addCommentApi,
  AddCommentReq,
  delCommentApi,
  getCommentListApi,
} from "@/api/comment";
import { useParams } from "next/navigation";
import { ImageFile } from "@/components/ImageUpdate";
import { useImageUpload } from "@/hooks/useImageUpload";

interface CommentItemProps {
  comment: Comment;
  onTimeClick?: (timestamp: number) => void;
}

interface ReplyInputProps {
  onSubmit: (content: string, imageUrls: string[]) => Promise<void>;
  onClose: () => void;
}

const ReplyInput: FC<ReplyInputProps> = ({ onSubmit, onClose }) => {
  const [replyContent, setReplyContent] = useState("");
  const [replyImages, setReplyImages] = useState<ImageFile[]>([]);

  // 使用图片上传Hook
  const { handlePaste, handleDeleteImage, dropzoneProps } = useImageUpload({
    setImages: setReplyImages,
    onError: () => console.error('上传图片失败'),
  });

  const handleSubmit = async () => {
    if (replyContent.trim() === "") return;
    try {
      await onSubmit(replyContent.trim(), replyImages.map(img => img.rawUrl));
      setReplyContent("");
      setReplyImages([]);
      onClose();
    } catch (error) {
      console.error('提交回复失败:', error);
    }
  };

  return (
    <Box className="relative">
      {/* 拖拽区域 */}
      <div {...dropzoneProps.getRootProps({
        onClick: (e) => e.stopPropagation()
      })} className="absolute inset-0 z-0">
        <input {...dropzoneProps.getInputProps()} />
      </div>

      {/* 拖拽提示 */}
      {dropzoneProps.isDragActive && (
        <Box className="absolute inset-0 bg-blue-50/80 flex items-center justify-center z-10 rounded">
          <Typography variant="body2">放开以添加图片</Typography>
        </Box>
      )}

      {/* 输入区域 */}
      <div className="relative z-1">
        <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            placeholder="可以粘贴上传图片..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            onPaste={handlePaste}
          />
          {/* <IconButton
            onClick={(e) => {
              e.stopPropagation();
              dropzoneProps.getRootProps().onClick?.(e);
            }}
            size="small"
          >
            <AddPhotoAlternate />
          </IconButton> */}
          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleSubmit}
            disabled={!replyContent.trim()}
          >
            发送
          </Button>
        </Box>

        {replyImages.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <ImagePreview 
              cols={3} 
              width="200px" 
              images={replyImages
                .filter(img => img.rawUrl && img.progress === 100)
                .map(img => img.rawUrl)} 
              handleDelete={handleDeleteImage}
            />
            {/* 显示上传中的图片预览 */}
            <Box className="grid grid-cols-3 gap-2 mt-2">
              {replyImages
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
    </Box>
  );
};

const CommentItem: FC<CommentItemProps> = ({ comment, onTimeClick }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReplyVisible, setIsReplyVisible] = useState(false);
  const { setComments } = useCommentStore();
  const { user } = useUserStore();
  const params = useParams();
  const mediaId = params.id as string;

  // 验证评论对象的必要属性
  if (!comment || typeof comment !== 'object' || !comment.id) {
    return null;
  }

  // 验证评论对象的其他必要属性
  if (
    typeof comment.timestamp !== 'number' ||
    typeof comment.content !== 'string' ||
    typeof comment.username !== 'string'
  ) {
    console.error('评论对象缺少必要属性:', comment);
    return null;
  }

  const handleTimeClick = () => {
    onTimeClick?.(comment.timestamp);
  };

  const handleDeleteComment = async () => {
    try {
      await delCommentApi(Number(comment.id));
      const updatedComments = await getCommentListApi(Number(mediaId));
      setComments(updatedComments);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('删除评论失败:', error);
    }
  };

  const handleReplySubmit = async (content: string, imageUrls: string[]) => {
    try {
      const newComment: AddCommentReq = {
        content,
        imageUrls,
        timestamp: comment.timestamp,
        mediaId: Number(mediaId),
        userId: user.id ?? 0,
      };
      await addCommentApi(newComment);
      const comments = await getCommentListApi(Number(mediaId));
      setComments(comments);
    } catch (error) {
      console.error('提交回复失败:', error);
    }
  };

  const renderCommentHeader = () => (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Typography
        variant="body2"
        component="div"
        color="primary"
        sx={{
          fontWeight: "medium",
          cursor: 'pointer',
          "&:hover": {
            textDecoration: "underline",
          },
        }}
        onClick={handleTimeClick}
      >
        {formatTime(comment.timestamp)}
      </Typography>
      <Typography variant="subtitle2" sx={{ ml: 1 }}>
        {comment.username}
      </Typography>
    </Box>
  );

  const renderCommentContent = () => (
    <Box>
      <Typography
        component="div"
        variant="body2"
        color="text.primary"
        sx={{ my: 1 }}
      >
        {comment.content}
      </Typography>

      {Array.isArray(comment.imageUrls) && comment.imageUrls.length > 0 && (
        <Box sx={{ mt: 1, mb: 1}}>
          <ImagePreview cols={3} width="200px" images={comment.imageUrls} />
        </Box>
      )}

      <Box sx={{ mt: 1 }}>
        <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
          <IconButton
            aria-label="reply"
            size="small"
            onClick={() => setIsReplyVisible(!isReplyVisible)}
          >
            <ChatIcon />
          </IconButton>
          <IconButton 
            aria-label="delete" 
            size="small" 
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      {isReplyVisible && (
        <ReplyInput
          onSubmit={handleReplySubmit}
          onClose={() => setIsReplyVisible(false)}
        />
      )}

      <Dialog 
        open={isDeleteDialogOpen} 
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>是否删除该评论？</DialogTitle>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>取消</Button>
          <Button onClick={handleDeleteComment} color="error">
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  return (
    <ListItem
      alignItems="flex-start"
      component="div"
      sx={{
        px: 2,
        py: 1.5,
        bgcolor: "background.paper",
        borderRadius: 1,
        "&:hover": {
          bgcolor: "action.hover",
        },
      }}
    >
      <ListItemAvatar>
        <Avatar src={comment.avatarUrl} alt={comment.username} />
      </ListItemAvatar>
      <ListItemText
        primary={renderCommentHeader()}
        secondary={renderCommentContent()}
        slots={{ secondary: "div", primary: "div" }}
      />
    </ListItem>
  );
};

export default CommentItem;
