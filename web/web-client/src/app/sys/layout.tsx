"use client";
import { Inter } from "next/font/google";
import ThemeRegistry from "@/components/ThemeRegistry";
import { AppBar, Toolbar, Typography, Box, Avatar, IconButton, Button, Menu, MenuItem } from "@mui/material";
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import React, { useEffect, useState } from 'react';
import useUserStore from '@/store/userStore';
import { User } from '@/types/user';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {  
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    setUser({} as User);
    localStorage.removeItem('user');
    handleClose();
    router.push('/');
  };

  useEffect(() => {
    if (!user.id) {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        const val:User = {
          id: user.id,
          name: user.name,
          avatarUrl: user.avatarUrl,
          account: user.account,
        };
        setUser(val);
      }
    }
  }, []);

  return (
    <ThemeRegistry>
      <AppBar position="fixed" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            素材管理库
          </Typography>
          <Link href="/sys/project" passHref>
            <Button color="inherit">项目</Button>
          </Link>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <IconButton aria-label="通知" sx={{ color: 'white' }}>
              <NotificationsIcon />
            </IconButton>
            <IconButton aria-label="设置" sx={{ color: 'white' }}>
              <SettingsIcon />
            </IconButton>
            <IconButton
              onClick={handleClick}
              size="small"
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <Avatar alt="用户头像" src={user.avatarUrl} />
            </IconButton>
          </Box>
          <Menu
            id="account-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleClose}>
              <Link href="/sys/account" style={{ textDecoration: 'none', color: 'inherit' }}>
                Account
              </Link>
            </MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box sx={{ marginTop: '64px' }}>
        {children}
      </Box>
    </ThemeRegistry>
  );
}
