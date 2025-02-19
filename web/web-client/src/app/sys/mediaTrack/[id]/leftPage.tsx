"use client";

import { Box, Paper } from "@mui/material";
import Video from "@/components/Video";
import ReactPlayer from "react-player";
import { usePlayerStore } from "@/store/playerStore";
import TextEditor from "@/app/sys/mediaTrack/[id]/TextEditor";
import { useCallback, useEffect, useState } from "react";
import { useCommentStore } from "@/store/commentStore";
import { ProgressDot } from "@/components/Video";
import { Media } from "@/types/media.ds";
import { getFileDetail } from '@/api/file'

interface CommentProgressDot extends ProgressDot {
  id: string;
  time: number;
  text: string;
  avatar?: string;
  comment?: string;
  images?: string[];
  createdAt: Date;
}

export default function LeftPage({ media }: { media?: Media }) {
  const setPlayer = usePlayerStore((state) => state.setPlayer);
  const removePlayer = usePlayerStore((state) => state.removePlayer);
  const [progressDot, setProgressDot] = useState<CommentProgressDot[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const { comments } = useCommentStore();
  // const [videoHeight] = useState<string>('calc(100vh - 220px)');

  // 处理进度点点击
  const handleDotClick = (timestamp: number) => {
    // 查找对应时间戳的评论元素
    const commentElement = document.querySelector(`[data-timestamp="${timestamp}"]`);
    if (commentElement) {
      // 平滑滚动到评论位置
      commentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 获取视频URL
  useEffect(() => {
    if (!media) return;
    const fetchVideoUrl = async () => {
      if (media.type === 1) {
        const res = await getFileDetail(media.path);
        if (res.data?.raw_url) {
          setVideoUrl(res.data.raw_url);
        }
      } else if (media.type === 2) {
        setVideoUrl(media.path);
      }
    };

    fetchVideoUrl();
  }, [media]);

  // 处理播放器准备就绪
  const handlePlayerReady = useCallback(
    (player: ReactPlayer) => {
      if (player) {
        setPlayer(player);
      }
    },
    [setPlayer]
  );

  // 组件卸载时清理播放器实例
  useEffect(() => {
    return () => {
      removePlayer();
    };
  }, [removePlayer]);

  // 转换评论为进度点
  useEffect(() => {
    const newProgressDots = comments.map((comment) => ({
      id: comment.id?.toString() || crypto.randomUUID(),
      time: comment.timestamp,
      text: comment.username,
      avatar: comment.avatarUrl,
      comment: comment.content,
      images: comment.imageUrls,
      createdAt: new Date(comment.createdAt || ""),
    }));

    setProgressDot(newProgressDots);
  }, [comments]); // 直接依赖 comments 数组

  return (
    <Paper
      sx={{
        flexGrow: 1,
        p: 2,
        minWidth: "200px",
        width: "70%",
        height: "100%",
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}
    >
      <Box 
        sx={{
          flex: '1 0 auto',
          display: 'flex',
          flexDirection: 'column',
          mb: 2,
        }}
      >
        <Box sx={{
          padding: '0 15px',
          width: '100%',
        }}>
          <Video
            url={videoUrl}
            minDotDistance={10}
            progressDots={progressDot}
            onPlayerReady={handlePlayerReady}
            onDotClick={handleDotClick}
          />
        </Box>
      </Box>

      <Box
        sx={{
          flex: '0 0 120px',
          bgcolor: "background.default",
          borderRadius: 1,
          border: "1px solid #e0e0e0",
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
          }}
        >
          <TextEditor />
        </Box>
      </Box>
    </Paper>
  );
}
