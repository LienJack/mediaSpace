'use client';

import { useParams } from 'next/navigation';
import { Box, Paper, Stack } from '@mui/material';
import LeftPage from './leftPage';
import RightPage from './rightPage';
import { useRef, useEffect } from "react";
import Player from "xgplayer";
import { useCommentStore } from '@/store/commentStore'
import { mockComments } from '@/components/mock';
import { getCommentListReq } from '@/api/comment';
import { useRequest } from 'ahooks';
import { Comment } from '@/types/comment';
export default function MediaTrackPage() {
  const params = useParams();
  const id = params.id as string;
  const { setComments, clearComments } = useCommentStore()
  const { loading, run : getCommentList } = useRequest(() => getCommentListReq(id), {
    onSuccess: (data) => {
      const comments: Comment[] = [];
      data.list.forEach(item => {
        comments.push({
          id: item.id,
          content: item.content,
          timestamp: item.timestamp ?? 0,
          username: item.user.name,
          avatarUrl: item.user.avatarUrl,
          images: item.imageUrls,
          createdAt: item.createdAt
        });
      });
      console.log(comments);
      setComments(comments);
    },
  });
  const Init = () => {
    // 获取评论列表
    getCommentList();
  }
  const destroy = () => {
    clearComments()
  }
  useEffect(() => {
    Init()
    return () => {
      destroy()
    }
  }, [])

  return (
    <Stack 
      direction="row" 
      spacing={2} 
      sx={{ 
        height: '100vh',
        p: 2,
      }}
    >
      {/* 左侧区域 - 自适应宽度 */}
      <LeftPage />
      {/* 右侧区域 - 固定宽度 */}
      <RightPage loading={loading} />
    </Stack>
  );
} 