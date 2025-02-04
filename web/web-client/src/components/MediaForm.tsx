import React from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Button,
  Box,
} from "@mui/material";
import { Media } from "@/types/media.ds";
import FileListModel from '@/components/FileListModel';
import { FileType } from "@/api/models/files";
import { useState, useEffect } from "react";

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (media: Media) => void;
  initialData?: Media;
}

interface FormInputs extends Omit<Media, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
  tag: "local" | "online";
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ open, onClose, onSubmit, initialData }) => {
  const [openFileListModel, setOpenFileListModel] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormInputs>({
    defaultValues: {
      name: "",
      descript: "",
      path: "",
      type: 1,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        descript: initialData.descript,
        path: initialData.path,
        type: initialData.type,
      });
    } else {
      reset({
        name: "",
        descript: "",
        path: "",
        type: 1,
      });
    }
  }, [initialData, reset]);

  const typeValue = useWatch({
    control,
    name: "type",
  });
  const onCloseHandler = () => {
    reset();
    onClose();
  };
  const onSubmitHandler = (data: FormInputs): Media => {
    const media: Media = {
      ...data,
      type: Number(data.type),
      id: initialData?.id || 0,
    };
    onSubmit(media);
    onCloseHandler();
    return media;
  };

  const fileSelect = (path: string) => {
    setValue("path", path, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{initialData ? '编辑项目' : '新建项目'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Controller<FormInputs>
                name="name"
                control={control}
                rules={{ required: "项目名称是必填项" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="项目名字"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    placeholder="请输入项目名字"
                    fullWidth
                  />
                )}
              />

              <Controller<FormInputs>
                name="descript"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="描述"
                    placeholder="请输入项目描述（可选）"
                    fullWidth
                  />
                )}
              />

              <FormControl>
                <FormLabel>选择标签</FormLabel>
                <Controller<FormInputs>
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field} row onChange={(e) => {
                      field.onChange(e);
                    }}>
                      <FormControlLabel
                        value={1}
                        control={<Radio />}
                        label="本地"
                      />
                      <FormControlLabel
                        value={2}
                        control={<Radio />}
                        label="线上"
                      />
                    </RadioGroup>
                  )}
                />
              </FormControl>
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                <Controller<FormInputs>
                  name="path"
                  control={control}
                  rules={{ required: "文件路径是必填项" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={String(typeValue) === "1" ? "请选择路径" : "填写路径"}
                      error={!!errors.path}
                      helperText={errors.path?.message}
                      placeholder="请输入文件路径"
                      fullWidth
                      disabled={String(typeValue) === "1"}
                    />
                  )}
                />
                {String(typeValue) === "1" && (
                  <Button variant="outlined" color="primary" onClick={() => setOpenFileListModel(true)} style={{ minWidth: '90px' }}>
                    选择文件
                  </Button>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onCloseHandler} color="inherit">
              取消
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {initialData ? '更新' : '创建'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <FileListModel open={openFileListModel} onClose={() => setOpenFileListModel(false)} onFileClick={(path) => fileSelect(path)} allowTypes={[FileType.VIDEO]} />
    </>
  );
};

export default CreateProjectModal;