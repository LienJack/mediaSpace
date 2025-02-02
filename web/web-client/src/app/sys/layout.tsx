"use client";
import { Inter } from "next/font/google";
import ThemeRegistry from "@/components/ThemeRegistry";
import { AppBar, Toolbar, Typography, Box, Avatar, IconButton } from "@mui/material";
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import useUserStore, { User as UserStoreType } from "@/store/userStore";
import React, { useEffect } from 'react';
import { getUserInfo } from "@/api/user";
const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, setUser } = useUserStore();
  useEffect(() => {
    getUserInfo('1').then((res) => {
      const user: UserStoreType = {
        name: res.name,
        avatar: res.avatarUrl,
        id: res.id,
      };
      setUser(user);
    });
  }, []);
  return (
    <html lang="zh" className={inter.className}>
      <body>
        <ThemeRegistry>
          <AppBar position="fixed" color="primary">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                素材管理库
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <IconButton aria-label="通知" sx={{ color: 'white' }}>
                  <NotificationsIcon />
                </IconButton>
                <IconButton aria-label="设置" sx={{ color: 'white' }}>
                  <SettingsIcon />
                </IconButton>
                <Avatar alt="用户头像" src={user.avatar} />
              </Box>
            </Toolbar>
          </AppBar>
          <Box sx={{ marginTop: '64px' }}>
            {children}
          </Box>
        </ThemeRegistry>
      </body>
    </html>
  );
}
