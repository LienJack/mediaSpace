import { FC, useState, useRef } from "react";
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
  InputAdornment,
} from "@mui/material";
import { Comment } from "@/types/comment";
import { formatTime } from "@/utils/time";
import ImagePreview from "@/components/ImagePreview";
import { useCommentStore } from "@/store/commentStore";
import DeleteIcon from '@mui/icons-material/Delete';
import ChatIcon from '@mui/icons-material/Chat';
import { AddPhotoAlternate, Delete } from "@mui/icons-material";
import useUserStore from "@/store/userStore";

interface CommentItemProps {
  comment: Comment;
  onEdit?: (comment: Comment) => void;
  onTimeClick?: (timestamp: number) => void;
}

const CommentItem: FC<CommentItemProps> = ({
  comment,
  onEdit,
  onTimeClick,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [showInput, setShowInput] = useState(false);
  const removeComment = useCommentStore((state) => state.removeComment);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { user } = useUserStore();

  const handleEdit = () => {
    onEdit?.(comment);
  };

  const handleTimeClick = () => {
    onTimeClick?.(comment.timestamp);
  };

  const handleDelete = () => {
    setOpenDialog(true);
  };

  const handleConfirmDelete = () => {
    removeComment(comment.id);
    setOpenDialog(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setImages((prevImages) => [...prevImages, ...files]);
    }
  };

  const handleImageDelete = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleShowInput = () => {
    setShowInput((prev) => !prev);
  };

  const handleSendComment = () => {
    const newComment = inputRef.current?.value || "";
    if (newComment.trim() === "") return;

    const newCommentData: Comment = {
      id: Math.floor(100 + Math.random() * 900),
      content: newComment,
      timestamp: comment.timestamp,
      createdAt: new Date().toISOString(),
      username: comment.username,
      avatarUrl: user.avatar,
      // images: images,
    };

    const addComment = useCommentStore.getState().addComment;
    addComment(newCommentData);
    inputRef.current!.value = "";
    setImages([]);
    setShowInput(false);
  };

  const Primary = () => (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Typography
        variant="body2"
        component="div"
        color="primary"
        sx={{
          fontWeight: "medium",
          cursor: "pointer",
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

  const Secondary = () => (
    <Box>
      <Typography
        component="div"
        variant="body2"
        color="text.primary"
        sx={{ my: 1 }}
      >
        {comment.content}
      </Typography>

      {comment.images && comment.images.length > 0 && (
        <Box sx={{ mt: 1, mb: 1 }}>
          <ImagePreview images={comment.images} />
        </Box>
      )}

      <Box sx={{ mt: 1 }}>
        <Typography component="div" variant="caption" color="text.secondary">
          {comment.createdAt}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
          <IconButton aria-label="comment" size="small" onClick={handleShowInput}>
            <ChatIcon />
          </IconButton>
          <IconButton aria-label="delete" size="small" onClick={handleDelete}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      {showInput && (
        <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            placeholder="输入评论..."
            inputRef={inputRef}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <input
                      accept="image/*"
                      style={{ display: "none" }}
                      id="upload-image"
                      type="file"
                      multiple
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="upload-image">
                      <IconButton component="span">
                        <AddPhotoAlternate />
                      </IconButton>
                    </label>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button variant="outlined" size="small" onClick={handleSendComment}>
            发送
          </Button>
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>是否删除该评论？</DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleConfirmDelete} color="error">
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
        primary={<Primary />}
        secondary={<Secondary />}
        slots={{ secondary: "div", primary: "div" }}
      />
    </ListItem>
  );
};

export default CommentItem;
