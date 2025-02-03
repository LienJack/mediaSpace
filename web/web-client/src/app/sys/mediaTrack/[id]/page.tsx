'use client';

import { useParams } from 'next/navigation';
import { Box, Paper, Stack } from '@mui/material';
import LeftPage from './leftPage';
import RightPage from './rightPage';
import { useRef, useEffect } from "react";
import Player from "xgplayer";
import { useCommentStore } from '@/store/commentStore'
import { mockComments } from '@/components/mock';
import { getCommentListApi } from '@/api/comment';
import { useRequest } from 'ahooks';
import { Comment } from '@/types/comment';
import React from 'react';
import { LoginApi } from '@/api/file';
import { getMediaApi } from '@/api/media';
const MediaTrackPage = () => {
  const params = useParams();
  const id = params.id as string;
  const { setComments, clearComments } = useCommentStore()
  const { loading, run : getList } = useRequest(() => getCommentListApi(id), {
    manual: true,
    onSuccess: (data) => {
      setComments(data);
    },
  });
  const { data: media } = useRequest(() => getMediaApi(Number(id)));
  const Init = () => {
    // 获取评论列表
    getList();
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
      <LeftPage media={media} />
      {/* 右侧区域 - 固定宽度 */}
      <RightPage loading={loading} />
    </Stack>
  );
}

export default MediaTrackPage; 