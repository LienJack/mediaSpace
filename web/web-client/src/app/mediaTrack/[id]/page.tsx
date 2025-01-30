'use client';

import { useParams } from 'next/navigation';
import { Box, Paper, Stack } from '@mui/material';
import LeftPage from './leftPage';
import RightPage from './rightPage';
import { useRef } from "react";
import Player from "xgplayer";

export default function MediaTrackPage() {
  const params = useParams();
  const playerRef = useRef<Player | null>(null);

  
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
      <RightPage />
    </Stack>
  );
} 