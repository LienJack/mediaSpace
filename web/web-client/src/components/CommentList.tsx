import { FC, useState } from 'react';
import {
  Box,
  Typography,
  List,
  Card,
  IconButton,
} from '@mui/material';
import { Comment } from '@/types/comment';
import { formatTime } from '@/utils/time';
import CommentItem from './CommentItem';
import { useCommentStore } from '@/store/commentStore';
import React from 'react';
import NoCommentsIcon from '@mui/icons-material/CommentOutlined';

interface CommentGroupProps {
  timestamp: number;
  comments: Comment[];
  onTimeClick?: (timestamp: number) => void;
}

const CommentGroup: FC<CommentGroupProps> = ({
  timestamp,
  comments,
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
      
      <List sx={{ p: 0 }} component="div">
        {comments?.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onTimeClick={onTimeClick}
          />
        ))}
      </List>
    </Card>
  );
};

interface CommentListProps {
  // comments: Comment[];
  onTimeClick?: (timestamp: number) => void;
}

const CommentList: FC<CommentListProps> = ({ onTimeClick }) => {
  const { comments } = useCommentStore();
  
  // 按 timestamp 对评论进行分组
  if (!Array.isArray(comments)) return null;
  const groupedComments = comments?.reduce<Record<number, Comment[]>>((acc, comment) => {
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
      {sortedTimestamps.length === 0 ? (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ mt: 4 }}>
          <IconButton sx={{ fontSize: 250 }}>
            <NoCommentsIcon />
          </IconButton>
          <Typography variant="h6" color="textSecondary">
            暂无评论
          </Typography>
        </Box>
      ) : (
        sortedTimestamps.map((timestamp) => (
          <CommentGroup
            key={timestamp}
            timestamp={timestamp}
            comments={groupedComments[timestamp]}
            onTimeClick={onTimeClick}
          />
        ))
      )}
    </Box>
  );
};

export default CommentList;
