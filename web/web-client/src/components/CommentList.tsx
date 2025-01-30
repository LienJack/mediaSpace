import { FC } from 'react';
import {
  Box,
  Typography,
  Stack,
  Divider,
  List,
  Card,
} from '@mui/material';
import { Comment } from '@/types/comment';
import { formatTime } from '@/utils/time';
import CommentItem from './CommentItem';

interface CommentGroupProps {
  timestamp: number;
  comments: Comment[];
  onEditComment?: (comment: Comment) => void;
  onTimeClick?: (timestamp: number) => void;
}

const CommentGroup: FC<CommentGroupProps> = ({
  timestamp,
  comments,
  onEditComment,
  onTimeClick,
}) => {
  return (
    <Card sx={{ mb: 3 , p: 2}}>
      <Typography
        variant="h5"
        color="primary"
        sx={{
          mb: 2,
          fontWeight: 'medium',
          cursor: 'pointer',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
        onClick={() => onTimeClick?.(timestamp)}
      >
        {formatTime(timestamp)}
      </Typography>
      
      <List sx={{ p: 0 }}>
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onEdit={onEditComment}
            onTimeClick={onTimeClick}
          />
        ))}
      </List>
    </Card>
  );
};

interface CommentListProps {
  comments: Comment[];
  onEditComment?: (comment: Comment) => void;
  onTimeClick?: (timestamp: number) => void;
}

const CommentList: FC<CommentListProps> = ({ comments, onEditComment, onTimeClick }) => {
  // 按 timestamp 对评论进行分组
  const groupedComments = comments.reduce<Record<number, Comment[]>>((acc, comment) => {
    const timestamp = comment.timestamp;
    if (!acc[timestamp]) {
      acc[timestamp] = [];
    }
    acc[timestamp].push(comment);
    return acc;
  }, {});

  // 将分组后的评论按时间戳排序
  const sortedTimestamps = Object.keys(groupedComments)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <Box>
      {sortedTimestamps.map((timestamp) => (
        <CommentGroup
          key={timestamp}
          timestamp={timestamp}
          comments={groupedComments[timestamp]}
          onEditComment={onEditComment}
          onTimeClick={onTimeClick}
        />
      ))}
    </Box>
  );
};

export default CommentList;
