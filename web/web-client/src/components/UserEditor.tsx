import {
  Box,
  Avatar,
  Dialog,
  DialogTitle,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useForm, Controller } from "react-hook-form";
import { useImageUpload } from "@/hooks/useImageUpload";
import { User } from "@/types/user";
import { useState, useEffect } from "react";

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

interface UserEditorProps {
  open: boolean;
  isEditing: boolean;
  currentUser: User | null;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  onDelete?: (user: User) => void;
}

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

export default function UserEditor({
  open,
  isEditing,
  currentUser,
  onClose,
  onSubmit,
  onDelete,
}: UserEditorProps) {
  // 删除确认对话框状态
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  // 添加头像URL状态
  const [avatarUrl, setAvatarUrl] = useState<string>(currentUser?.avatarUrl || "");

  // 表单管理
  const {
    control,
    handleSubmit,
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

  // 当对话框打开状态或当前用户变化时，重置表单
  useEffect(() => {
    if (open) {
      if (isEditing && currentUser) {
        // 编辑模式：设置当前用户数据
        reset({
          id: currentUser.id?.toString() || "",
          name: currentUser.name,
          account: currentUser.account,
          avatarUrl: currentUser.avatarUrl || "",
        });
      } else {
        // 新建模式：重置为空
        reset({
          id: "",
          name: "",
          account: "",
          avatarUrl: "",
        });
      }
    }
  }, [open, currentUser, isEditing, reset]);

  // 使用 useImageUpload hook 处理头像上传
  const { dropzoneProps } = useImageUpload({
    setImages: () => {}, // 由于我们只需要单个头像，这里可以是空函数
    onSuccess: (url: string) => {
      setValue("avatarUrl", url);
      setAvatarUrl(url);
    },
    onError: (error) => {
      console.error("头像上传失败:", error);
      // 这里可以添加错误提示UI
    },
  });

  // 简化的头像点击处理函数
  const handleAvatarClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files?.[0]) {
        const file = target.files[0];
        
        // 检查文件类型
        if (!file.type.startsWith('image/')) {
          console.error('请选择图片文件');
          return;
        }

        // 检查文件大小（例如限制为5MB）
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_SIZE) {
          console.error('文件大小不能超过5MB');
          return;
        }

        try {
          // 创建一个模拟的React ChangeEvent对象
          const mockEvent = {
            type: 'change',
            target: {
              files: [file]
            },
            preventDefault: () => {},
            stopPropagation: () => {},
            persist: () => {},
          };
          
          const inputProps = dropzoneProps.getInputProps();
          if (inputProps.onChange) {
            inputProps.onChange(mockEvent as unknown as React.ChangeEvent<HTMLInputElement>);
          }
        } catch (error) {
          console.error('处理文件上传时出错:', error);
        }
      }
    };
    input.click();
  };

  // 处理删除确认
  const handleDeleteConfirm = () => {
    if (userToDelete && onDelete) {
      onDelete(userToDelete);
      setUserToDelete(null);
    }
  };

  // 当currentUser改变时更新头像URL
  useEffect(() => {
    setAvatarUrl(currentUser?.avatarUrl || "");
  }, [currentUser]);

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>{isEditing ? "修改用户" : "添加用户"}</DialogTitle>
        <Box sx={{ padding: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Avatar
              src={avatarUrl || undefined}
              sx={{
                width: 64,
                height: 64,
                cursor: "pointer",
                objectFit: "cover",
                bgcolor: avatarUrl ? undefined : "grey.100",
              }}
              onClick={handleAvatarClick}
            >
              {!avatarUrl && <AddIcon sx={{ color: "grey.500" }} />}
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
              onClick={onClose} 
              variant="outlined" 
              color="secondary"
            >
              取消
            </Button>
            {isEditing && onDelete && currentUser && (
              <Button 
                onClick={() => setUserToDelete(currentUser)}
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
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
