"use client";

import { useRequest } from "ahooks";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Grid2 as Grid,
  Skeleton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ProfileCard from "@/components/ProfileCard";
import UserEditor from "@/components/UserEditor";
import { getAllUsersApi, updateUserApi, createUserApi, deleteUserApi } from "@/api/user";
import useUserStore from "@/store/userStore";
import { User } from "@/types/user";
import { useRouter } from "next/navigation";
import { useState } from "react";

// 定义表单数据类型
interface UserFormData {
  id: string;
  name: string;
  account: string;
  avatarUrl: string;
}

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
      <Skeleton variant="circular" width={64} height={64} animation="wave" />
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
  // 获取用户列表
  const { 
    data: profiles = [], 
    loading, 
    error, 
    run: getAllUsers 
  } = useRequest(getAllUsersApi);

  // 状态管理
  const setUser = useUserStore((state) => state.setUser);
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // 表单提交处理
  const onSubmit = async (data: UserFormData) => {
    try {
      if (!data.name || !data.account) {
        console.error("姓名和账号不能为空");
        return;
      }

      const userData = {
        name: data.name,
        account: data.account,
        avatarUrl: data.avatarUrl
      };

      if (isEditing && currentUser?.id) {
        await updateUserApi(currentUser.id.toString(), userData);
        console.log("用户信息更新成功");
      } else {
        await createUserApi(userData);
        console.log("添加用户信息成功");
      }
      getAllUsers();
      setOpenModal(false);
    } catch (error) {
      console.error("提交表单出错:", error);
    }
  };

  // 用户选择处理
  const handleUserSelect = (user: User) => {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
    router.push("/sys/project");
  };

  // 添加用户处理
  const handleAddUser = () => {
    setCurrentUser(null);
    setIsEditing(false);
    setOpenModal(true);
  };

  // 编辑用户处理
  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setIsEditing(true);
    setOpenModal(true);
  };

  // 删除用户处理
  const handleDeleteUser = async (user: User) => {
    if (user?.id) {
      try {
        await deleteUserApi(user.id.toString());
        console.log("用户删除成功");
        getAllUsers();
        setOpenModal(false);
      } catch (error) {
        console.error("删除用户出错:", error);
      }
    }
  };

  // 错误处理
  if (error) {
    return <Typography>加载用户信息出错: {error.message}</Typography>;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 8, textAlign: "center" }}>
        <Typography
          component="h1"
          variant="h2"
          align="center"
          sx={{ color: "primary.main", mb: 16, fontWeight: "bold" }}
        >
          请选择您的账号
        </Typography>

        <Grid container justifyContent="center" spacing={2}>
          {loading
            ? Array.from(new Array(3)).map((_, index) => (
                <Grid size={3} key={`skeleton-${index}`}>
                  <ProfileSkeleton />
                </Grid>
              ))
            : profiles.map((profile) => (
                <Grid size={3} key={profile.id}>
                  <ProfileCard 
                    user={profile} 
                    onClick={handleUserSelect} 
                    onEdit={handleEditUser} 
                  />
                </Grid>
              ))}
          <Grid size={3}>
            <Card
              sx={{ maxWidth: 400, m: 1, height: "100%" }}
              onClick={handleAddUser}
            >
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
                  添加用户
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* 用户表单对话框 */}
      <UserEditor
        open={openModal}
        isEditing={isEditing}
        currentUser={currentUser}
        onClose={() => setOpenModal(false)}
        onSubmit={onSubmit}
        onDelete={handleDeleteUser}
      />
    </Container>
  );
}
