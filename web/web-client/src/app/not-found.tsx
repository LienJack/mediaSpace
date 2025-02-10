'use client';

import { Stack, Typography, Button, Container } from '@mui/material';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Container maxWidth="sm">
      <Stack 
        spacing={3} 
        alignItems="center" 
        justifyContent="center" 
        sx={{ 
          minHeight: '100vh',
          textAlign: 'center'
        }}
      >
        <Typography variant="h1" component="h1">
          404
        </Typography>
        <Typography variant="h5" color="text.secondary">
          页面不存在
        </Typography>
        <Button
          component={Link}
          href="/"
          variant="contained"
          sx={{ minWidth: 120 }}
        >
          返回首页
        </Button>
      </Stack>
    </Container>
  );
} 