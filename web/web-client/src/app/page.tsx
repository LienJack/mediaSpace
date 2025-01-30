'use client';

import { Button, Container, Typography, Box } from '@mui/material';

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom key="title">
          欢迎使用 Next.js + MUI
        </Typography>
        
        <Typography variant="h5" component="h2" gutterBottom key="subtitle">
          开始构建你的应用吧
        </Typography>

        <Button variant="contained" color="primary" sx={{ mt: 3 }} key="button">
          开始使用
        </Button>
      </Box>
    </Container>
  );
}
