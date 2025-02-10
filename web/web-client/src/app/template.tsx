import { Box } from '@mui/material';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component="main"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 3,
      }}
    >
      {children}
    </Box>
  );
} 