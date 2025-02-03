"use client";

import { useParams } from "next/navigation";
import { Box, Paper, Stack } from "@mui/material";
import Video from "@/components/Video";
import Player from "xgplayer";
import { usePlayerStore } from "@/store/playerStore";
import TextEditor from "@/app/sys/mediaTrack/[id]/TextEditor";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCommentStore } from "@/store/commentStore";
import { VideoProps } from "@/components/Video";
import { ProgressDot } from "@/components/Video";

export default function LeftPage() {
  const setPlayer = usePlayerStore((state) => state.setPlayer);
  const removePlayer = usePlayerStore((state) => state.removePlayer);
  const [progressDot, setProgressDot] = useState<ProgressDot[]>([]);
  const handlePlayerReady = useCallback(
    (player: Player) => {
      // 确保只在播放器实例真正改变时才更新
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
  }, [setPlayer, removePlayer]);

  const mockUrl =
    "http://192.168.5.89:5244/p/nas/video/yoasobi/32763_1731251147.mp4?sign=iUHNb2ldZhHAlh_wz0nYOkUlJz0oWkuJWhN-bc1hwtw=:0";
  const { comments } = useCommentStore();
    // 转换 comments 为 progressDot
  useEffect(() => {
    if (progressDot.length !== 0) {
      return
    }
    const newValues = Array.from(
      new Map(
        comments.map((comment) => [
          comment.timestamp,
          {
            id: comment.id,
            time: comment.timestamp,
            text: comment.username,
          },
        ])
      ).values()
    );
    setProgressDot(newValues);
  },[comments])



  return (
    <Paper
      sx={{
        flexGrow: 1, // 自动填充剩余空间
        p: 2,
        minWidth: "200px", // 最小宽度
        width: "70%",
        height: "100%",
        overflow: 'auto',
      }}
    >
      <Stack
        direction="column"
        spacing={2}
      >
        {/* 上部分 - 自适应高度 */}
        <Box sx={{
          padding: '0 100px',
         justifyContent: 'center',
        }}>
          <Video
            url={mockUrl} // 假设这是视频 API 地址
            width='100%'
            progressDots={progressDot}
            onPlayerReady={handlePlayerReady}
          />
        </Box>

        {/* 下部分 - 固定高度 */}
        <Box
          sx={{
            minHeight: "150px",
            bgcolor: "background.default",
            p: 2,
            borderRadius: 1,
            border: "1px solid #e0e0e0",
            overflowY: "auto",
          }}
        >
          <TextEditor/>
        </Box>
      </Stack>
    </Paper>
  );
}
