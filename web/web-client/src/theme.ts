import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});
const aeTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      // main: '#ea80fc',
      main: '#e578f7',
    },
    secondary: {
      // main: '#9c27b0',
      main: '#b17ef7',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          // backgroundColor: '#8a37a6', // 顶部栏背景色
          backgroundColor: '#ac49bd', // 顶部栏背景色
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        // 如果需要针对不同类型的按钮单独设置
        contained: {
          color: '#ffffff', // 实心按钮文字颜色
        },
      }
    }
  },
});



export default aeTheme; 