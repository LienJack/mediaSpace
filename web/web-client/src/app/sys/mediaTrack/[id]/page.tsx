'use client';

import { useParams, notFound } from 'next/navigation';
import { Stack, IconButton, CircularProgress } from '@mui/material';
import { useEffect, useState } from "react";
import { useCommentStore } from '@/store/commentStore';
import { getCommentListApi } from '@/api/comment';
import { useRequest } from 'ahooks';
import { getMediaApi } from '@/api/media';
import LeftPage from './leftPage';
import RightPage from './rightPage';
import type { Media } from '@/types/media.ds';
import type { Comment } from '@/types/comment';
import { motion, AnimatePresence } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import { toast } from 'react-hot-toast';
/**
 * 媒体轨道页面组件
 * 用于展示媒体内容和相关评论的页面
 * @returns {JSX.Element} 媒体轨道页面组件
 */
const MediaTrackPage = () => {
  // 获取路由参数中的媒体ID
  const { id } = useParams<{ id: string }>();
  const mediaId = Number(id);
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true);

  // 评论状态管理
  const { setComments, clearComments } = useCommentStore();

  // 获取评论列表
  const { 
    loading: commentsLoading, 
    run: fetchComments 
  } = useRequest<Comment[], [number]>(
    (mediaId: number) => getCommentListApi(mediaId),
    {
      manual: true,
      onSuccess: (comments) => {
        setComments(comments);
      },
    }
  );

  // 获取媒体信息
  const { 
    data: mediaData,
    loading: mediaLoading,
    error: mediaError
  } = useRequest<Media | null, [number]>(
    (mediaId: number) => getMediaApi(mediaId),
    {
      defaultParams: [mediaId],
      refreshDeps: [mediaId],
      onError: (error) => {
        toast.error('获取媒体信息失败：' + error.message);
        notFound();
      }
    }
  );

  // 组件挂载时获取数据，卸载时清理
  useEffect(() => {
    fetchComments(mediaId);
    return () => {
      clearComments();
    };
  }, [fetchComments, clearComments, mediaId]);

  // 加载状态
  if (mediaLoading || commentsLoading) {
    return (
      <Stack justifyContent="center" alignItems="center" sx={{ height: '100vh' }}>
        <CircularProgress />
      </Stack>
    );
  }

  // 错误处理
  if (mediaError || !mediaData) {
    return notFound();
  }

  return (
    <Stack 
      direction="row" 
      spacing={2} 
      sx={{ 
        p: 2,
        height: 'calc(100vh - 64px)',
        position: 'relative',
      }}
    >
      {/* 左侧区域 - 媒体播放和详情 */}
      <LeftPage media={mediaData} />
      
      {/* 右侧区域切换按钮 */}
      <IconButton
        sx={{
          position: 'absolute',
          right: isRightPanelVisible ? 'calc(25% - 28px)' : '16px',
          top: '16px',
          zIndex: 1200,
          backgroundColor: 'background.paper',
          boxShadow: 2,
          transition: 'right 0.3s ease-in-out',
        }}
        onClick={() => setIsRightPanelVisible(!isRightPanelVisible)}
      >
        <MenuIcon />
      </IconButton>
      {/* 右侧区域 - 带动画效果 */}
      <AnimatePresence>
        {isRightPanelVisible && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            style={{
              width: '400px', // 固定宽度
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <RightPage isLoading={commentsLoading} />
          </motion.div>
        )}
      </AnimatePresence>
    </Stack>
  );
};

export default MediaTrackPage; 