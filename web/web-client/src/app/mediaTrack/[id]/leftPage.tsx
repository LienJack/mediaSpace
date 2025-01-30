"use client";

import { useParams } from "next/navigation";
import { Box, Paper, Stack } from "@mui/material";
import Video from "@/components/Video";
import Player from "xgplayer";
import { usePlayerStore } from "@/store/playerStore";
import TextEditor from "@/app/mediaTrack/[id]/TextEditor";
import { useCallback, useEffect } from 'react';

export default function LeftPage() {
  const setPlayer = usePlayerStore((state) => state.setPlayer);
  const removePlayer = usePlayerStore((state) => state.removePlayer);
  const handlePlayerReady = useCallback((player: Player) => {
    // 确保只在播放器实例真正改变时才更新
    if (player) {
      setPlayer(player);
    }
  }, [setPlayer]);

  // 组件卸载时清理播放器实例
  useEffect(() => {
    return () => {
        removePlayer()
    };
  }, [setPlayer,removePlayer]);

  const mockUrl =
    "http://192.168.5.89:5244/p/nas/video/yoasobi/32763_1731251147.mp4?sign=iUHNb2ldZhHAlh_wz0nYOkUlJz0oWkuJWhN-bc1hwtw=:0";
  const progressDot = [
    {
      id: 1,
      time: 3,
      text: "text1",
    },
    {   
      id: 2,
      time: 5,
      text: "text2",
    },
    {
      id: 3,
      time: 32,
      text: "text3",
    },
    {
      id: 4,
      time: 36,
      text: "text4",
    },
  ];


  return (
    <Paper
      sx={{
        flexGrow: 1, // 自动填充剩余空间
        p: 2,
        minWidth: "200px", // 最小宽度
        height: "100%",
      }}
    >
      <Stack
        direction="column"
        spacing={2}
        sx={
          {
            //   height: '100%',
          }
        }
      >
        {/* 上部分 - 自适应高度 */}
        <Video
            url={mockUrl} // 假设这是视频 API 地址
            width="100%"
            height="100%"
            progressDots={progressDot}
            onPlayerReady={handlePlayerReady}
          />

        {/* 下部分 - 固定高度 */}
        <Box
          sx={{
            minHeight: "200px",
            bgcolor: "background.default",
            p: 2,
            borderRadius: 1,
            border: "1px solid #e0e0e0",
            overflowY: "auto"
          }}
        >
            <TextEditor />
        </Box>
      </Stack>
    </Paper>
  );
}
