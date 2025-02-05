import { FC } from 'react';
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
import NoCommentsIcon from '@mui/icons-material/CommentOutlined';

// 评论组的属性接口定义
interface CommentGroupProps {
  timestamp: number;
  comments: Comment[];
  onTimeClick?: (timestamp: number) => void;
}

// 评论列表的属性接口定义
interface CommentListProps {
  onTimeClick?: (timestamp: number) => void;
}

// 评论分组的类型定义
type GroupedComments = Record<number, Comment[]>;

/**
 * 评论组组件 - 显示同一时间戳下的所有评论
 */
const CommentGroup: FC<CommentGroupProps> = ({
  timestamp,
  comments,
  onTimeClick,
}) => {
  // 验证评论数组
  if (!Array.isArray(comments)) {
    return null;
  }

  return (
    <Card sx={{ mb: 3}}>
      <Typography
        variant="h5"
        color="primary"
        sx={{
          pb: 2,
          fontWeight: 'medium',
          cursor: 'pointer',
          backgroundColor: 'background.paper',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
        onClick={() => onTimeClick?.(timestamp)}
      >
        {formatTime(timestamp)}
      </Typography>
      
      <List sx={{ p: 0 }} component="div">
        {comments.sort((a, b) => new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime()).map((comment) => {
          // 验证评论对象的必要属性
          if (!comment || typeof comment !== 'object' || !comment.id) {
            return null;
          }
          return (
            <CommentItem
              key={comment.id}
              comment={comment}
              onTimeClick={onTimeClick}
            />
          );
        })}
      </List>
    </Card>
  );
};

/**
 * 评论列表组件 - 按时间戳对评论进行分组显示
 */
const CommentList: FC<CommentListProps> = ({ onTimeClick }) => {
  const { comments } = useCommentStore();

  // 确保comments是有效的数组且每个评论都是有效的
  const validComments = Array.isArray(comments) 
    ? comments.filter((comment): comment is Comment => 
        comment !== null && 
        typeof comment === 'object' && 
        typeof comment.timestamp === 'number' &&
        typeof comment.content === 'string' &&
        typeof comment.id === 'number'
      )
    : [];

  // 按时间戳对评论进行分组
  const groupedComments = validComments.reduce<GroupedComments>((acc, comment) => {
    const { timestamp } = comment;
    if (!acc[timestamp]) {
      acc[timestamp] = [];
    }
    acc[timestamp].push(comment);
    return acc;
  }, {});

  // 获取排序后的时间戳
  const sortedTimestamps = Object.keys(groupedComments)
    .map(Number)
    .sort((a, b) => a - b);

  // 如果没有评论，显示空状态
  if (sortedTimestamps.length === 0) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ mt: 4 }}>
        <IconButton sx={{ fontSize: 250 }}>
          <NoCommentsIcon />
        </IconButton>
        <Typography variant="h6" color="textSecondary">
          暂无评论
        </Typography>
      </Box>
    );
  }

  // 渲染评论列表
  return (
    <Box>
      {sortedTimestamps.map((timestamp) => (
        <CommentGroup
          key={timestamp}
          timestamp={timestamp}
          comments={groupedComments[timestamp]}
          onTimeClick={onTimeClick}
        />
      ))}
    </Box>
  );
};

export default CommentList;
