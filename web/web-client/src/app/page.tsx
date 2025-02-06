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
  Button,
  Skeleton,
  Dialog,
  TextField,
  DialogTitle,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ProfileCard from "@/components/ProfileCard";
import { getAllUsersApi, updateUserApi, createUserApi, deleteUserApi } from "@/api/user";
import useUserStore from "@/store/userStore";
import { User } from "@/types/user";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useImageUpload } from "@/hooks/useImageUpload";
import { ImageFile } from "@/components/ImageUpdate";

// 定义表单数据类型
interface UserFormData {
  id: string;
  name: string;
  account: string;
  avatarUrl: string;
}

// 定义确认对话框属性类型
interface ConfirmDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: () => void;
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

// 确认删除对话框组件
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  user,
  onClose,
  onConfirm,
}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>确认删除用户</DialogTitle>
    <Box sx={{ padding: 2 }}>
      <Typography>您确定要删除用户 {user?.name} 吗？</Typography>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button onClick={onClose} variant="outlined" color="secondary">
          取消
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error" sx={{ ml: 2 }}>
          确定
        </Button>
      </Box>
    </Box>
  </Dialog>
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
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // 表单管理
  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: {
      id: "",
      name: "",
      account: "",
      avatarUrl: "",
    },
  });

  // 图片上传处理
  const { dropzoneProps } = useImageUpload({
    setImages: () => {},
    onSuccess: (url: string) => {
      setValue("avatarUrl", url);
    },
    onError: (error) => console.error("上传失败:", error),
  });

  // 头像点击处理
  const handleAvatarClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files?.[0]) {
        const file = target.files[0];
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        const inputProps = dropzoneProps.getInputProps();
        if (inputProps.onChange) {
          inputProps.onChange({
            preventDefault: () => {},
            stopPropagation: () => {},
            persist: () => {},
            target: { files: dataTransfer.files },
            type: 'drop'
          } as unknown as React.ChangeEvent<HTMLInputElement>);
        }
      }
    };
    input.click();
  };

  // 错误处理
  if (error) {
    return <Typography>加载用户信息出错: {error.message}</Typography>;
  }

  // 表单提交处理
  const onSubmit = async (data: UserFormData) => {
    try {
      if (!data.name || !data.account) {
        console.error("姓名和账号不能为空");
        return;
      }

      if (isEditing) {
        await updateUserApi(data.id, data);
        console.log("用户信息更新成功");
      } else {
        const { id, ...userData } = data;
        await createUserApi(userData);
        console.log("添加用户信息成功");
      }
      getAllUsers();
      setOpenModal(false);
      reset();
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
    reset();
    setIsEditing(false);
    setOpenModal(true);
  };

  // 编辑用户处理
  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setValue("id", user.id?.toString() || "");
    setValue("name", user.name);
    setValue("account", user.account);
    setValue("avatarUrl", user.avatarUrl || "");
    setIsEditing(true);
    setOpenModal(true);
  };

  // 删除用户处理
  const handleDeleteUser = async () => {
    if (userToDelete?.id) {
      try {
        await deleteUserApi(userToDelete.id.toString());
        console.log("用户删除成功");
        getAllUsers();
        setUserToDelete(null);
        setOpenModal(false);
        reset();
      } catch (error) {
        console.error("删除用户出错:", error);
      }
    }
  };

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
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>{isEditing ? "修改用户" : "添加用户"}</DialogTitle>
        <Box sx={{ padding: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Avatar
              src={getValues("avatarUrl") || undefined}
              sx={{
                width: 64,
                height: 64,
                cursor: "pointer",
                objectFit: "cover",
                bgcolor: getValues("avatarUrl") ? undefined : "grey.100",
              }}
              onClick={handleAvatarClick}
            >
              {!getValues("avatarUrl") && <AddIcon sx={{ color: "grey.500" }} />}
            </Avatar>
          </Box>
          <Controller
            name="name"
            control={control}
            rules={{ required: "姓名是必填项" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="姓名"
                fullWidth
                required
                margin="normal"
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
          <Controller
            name="account"
            control={control}
            rules={{ required: "账号是必填项" }}
            render={({ field }) => (
              <TextField
                {...field}
                required
                label="账号"
                fullWidth
                margin="normal"
                error={!!errors.account}
                helperText={errors.account?.message}
              />
            )}
          />
          <Box
            sx={{ display: "flex", justifyContent: "flex-start", mt: 2 }}
            gap={2}
          >
            <Button
              onClick={handleSubmit(onSubmit)}
              variant="contained"
              color="primary"
            >
              确定
            </Button>
            <Button 
              onClick={() => setOpenModal(false)} 
              variant="outlined" 
              color="secondary"
            >
              取消
            </Button>
            {isEditing && (
              <Button 
                onClick={() => currentUser && setUserToDelete(currentUser)}
                variant="outlined" 
                color="error"
              >
                删除
              </Button>
            )}
          </Box>
        </Box>
      </Dialog>

      {/* 确认删除对话框 */}
      <ConfirmDialog
        open={!!userToDelete}
        user={userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteUser}
      />
    </Container>
  );
}
