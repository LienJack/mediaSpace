'use client';

import { Stack, Typography, Button } from '@mui/material';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Stack spacing={2} alignItems="center">
      <Typography variant="h2">
        出错了
      </Typography>
      <Typography color="text.secondary">
        {error.message || '发生了意外错误'}
      </Typography>
      <Button
        variant="contained"
        onClick={reset}
        sx={{ minWidth: 120 }}
      >
        重试
      </Button>
    </Stack>
  );
} 