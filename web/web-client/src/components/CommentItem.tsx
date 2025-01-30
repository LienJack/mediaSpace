import { FC } from "react";
import {
  Typography,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Box,
} from "@mui/material";
import { Comment } from "@/types/comment";
import { formatTime } from "@/utils/time";
import ImagePreview from "@/components/ImagePreview";

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
  const handleEdit = () => {
    onEdit?.(comment);
  };

  const handleTimeClick = () => {
    onTimeClick?.(comment.timestamp);
  };

  const secondaryAction = (
    <Box sx={{ mt: 1 }}>
      <Typography
        component="span"
        variant="caption"
        color="text.secondary"
        sx={{ mr: 2 }}
      >
        {comment.createdAt}
      </Typography>
      <Typography
        component="span"
        variant="caption"
        sx={{
          cursor: "pointer",
          color: "text.secondary",
          "&:hover": { color: "primary.main" },
        }}
        onClick={handleEdit}
      >
        编辑
      </Typography>
    </Box>
  );
  const Primary = () => (
    <>
      <Typography
        variant="body2"
        color="primary"
        sx={{
          mb: 1,
          fontWeight: "medium",
          cursor: "pointer",
          display: "inline-block",
          "&:hover": {
            textDecoration: "underline",
          },
        }}
        onClick={handleTimeClick}
      >
        {formatTime(comment.timestamp)}
      </Typography>
      <Typography variant="subtitle2" sx={{ ml: 1, display: "inline-block" }}>
        {comment.username}
      </Typography>
    </>
  );
  const Secondary = () => (
    <>
      <Typography variant="body2" color="text.primary" sx={{ my: 1 }}>
        {comment.content}
      </Typography>

      {comment.images && comment.images.length > 0 && (
        <Box sx={{ mt: 1, mb: 1 }}>
          <ImagePreview images={comment.images} />
        </Box>
      )}

      {secondaryAction}
    </>
  );

  return (
    <ListItem
      alignItems="flex-start"
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
      <ListItemText primary={<Primary />} secondary={<Secondary />} />
    </ListItem>
  );
};

export default CommentItem;
