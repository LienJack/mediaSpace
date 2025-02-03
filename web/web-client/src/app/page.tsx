"use client";

import { useRequest } from 'ahooks';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Grid2 as Grid,
  Button,
  Skeleton,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import ProfileCard from "@/components/ProfileCard";
import { getAllUsersApi } from "@/api/user";
import useUserStore from '@/store/userStore';
import { User } from "@/types/user";
import { redirect, useRouter } from 'next/navigation';

// 骨架屏组件
const ProfileSkeleton = () => (
  <Card sx={{ maxWidth: 400, m: 1, height: "100%" }}>
    <CardContent
      sx={{
        textAlign: "center",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <Skeleton
        variant="circular"
        width={64}
        height={64}
        animation="wave"
      />
      <Skeleton
        variant="text"
        width={100}
        height={24}
        sx={{ mt: 2 }}
        animation="wave"
      />
    </CardContent>
  </Card>
);

export default function Home() {
  const { data: profiles = [], loading, error } = useRequest(getAllUsersApi);
  const setUser = useUserStore((state) => state.setUser);
  const router = useRouter();

  if (error) return <Typography>加载用户信息出错: {error.message}</Typography>;

  const handleClick = (user: User) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    router.push('/sys/project');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 8, textAlign: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom>
          请选择用户
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 6 }}>
          The Art Resource Management Library is a comprehensive platform
          designed to streamline the organization, storage, and retrieval of
          artistic resources. Whether you&apos;re an artist, educator, or curator,
          this library serves as an essential tool for managing a vast array of
          art materials, including images, videos, and documentation.
        </Typography>

        <Grid container justifyContent="center" spacing={2}>
          {loading ? (
            // 显示3个骨架屏
            Array.from(new Array(3)).map((_, index) => (
              <Grid size={3} key={`skeleton-${index}`}>
                <ProfileSkeleton />
              </Grid>
            ))
          ) : (
            // 显示实际数据
            profiles.map((profile, index) => (
              <Grid size={3} key={index}>
                <ProfileCard user={profile} onClick={handleClick} />  
              </Grid>
            ))
          )}
          <Grid size={3}>
            <Card sx={{ maxWidth: 400, m: 1, height: "100%" }}>
              <CardContent
                sx={{
                  textAlign: "center",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    margin: "0 auto",
                    bgcolor: "grey.100",
                  }}
                >
                  <AddIcon sx={{ color: "grey.500" }} />
                </Avatar>
                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                  Add
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
