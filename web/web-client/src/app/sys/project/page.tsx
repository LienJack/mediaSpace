"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid2 as Grid,
  Card,
  CardContent,
  CardActions,
  Skeleton,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { getMediaListApi, createMediaApi } from "@/api/media";
import { formatToMySQLDateTime } from "@/utils/time";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useRequest } from "ahooks";
import Link from "next/link";
import MediaForm from "@/components/MediaForm";
import { Media } from "@/types/media";

// 创建骨架屏卡片组件
const ProjectCardSkeleton = () => (
  <Grid size={4}>
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="40%" />
      </CardContent>
    </Card>
  </Grid>
);

export default function ProjectPage() {
  //   const [projects, setProjects] = useState<Media[]>([]);
  //   const [loading, setLoading] = useState(true);
  const [openFormModel, setFormModel] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Media | null>(null);
  const {
    loading,
    data: projects = [],
    run: getProjectList,
  } = useRequest(() => getMediaListApi(), {
    loadingDelay: 100,
  });
  useEffect(() => {
    getProjectList();
  }, []);

  const openFormModal = () => {
    setSelectedProject(null);
    setFormModel(true);
  };

  const closeFormModal = () => {
    setSelectedProject(null);
    setFormModel(false);
  };

  const handleOpenProject = (project: Media) => {
    setSelectedProject(project);
    setFormModel(true);
  };

  const handleSubmit = async (media: Media) => {
    if (selectedProject) {
      // TODO: 这里需要添加更新项目的 API 调用
      console.log('更新项目:', media);
    } else {
      await createMediaApi({
        name: media.name,
        path: media.path,
        descript: media.descript,
        type: media.type,
      });
    }
    getProjectList();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          component="h1"
          variant="h2"
          align="center"
          sx={{
            color: "primary.main",
            mb: 4,
            fontWeight: "bold",
          }}
        >
          Video Project Management
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            mb: 6,
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={openFormModal}
          >
            新建项目
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={<RefreshIcon />}
            onClick={() => {
              getProjectList();
            }}
          >
            刷新
          </Button>
        </Box>
        <Typography variant="h4" sx={{ mb: 3 }}>
          最近项目
        </Typography>

        <Grid container spacing={3}>
          {loading
            ? // 显示骨架屏
              Array.from(new Array(3)).map((_, index) => (
                <ProjectCardSkeleton key={index} />
              ))
            : // 显示实际内容
              projects.map((project) => (
                <Grid size={4} key={project.id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h5" component="h3" gutterBottom>
                        {project.name}
                      </Typography>
                    {/* 这里是tag */}
                    <Chip
                        label={project.type === 1 ? "本地" : project.type === 2 ? "线上" : "未知"}
                        color={project.type === 1 ? "primary" : "secondary"}
                        // variant="outlined"
                        size="small"
                        sx={{ mb: 2, color: "text.primary", cursor: "default" }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {project.descript || "文件描述"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        创建:
                        {project.createdAt ? formatToMySQLDateTime(new Date(project.createdAt)) : "未知时间"}
                      </Typography>
                      {project.updatedAt && (
                        <Typography variant="body2" color="text.secondary">
                          更新:
                          {formatToMySQLDateTime(new Date(project.updatedAt))}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <Link href={`/sys/mediaTrack/${project.id}`} passHref>
                        <Button
                          size="small"
                          sx={{ ml: 1, mb: 1 }}
                          variant="contained"
                        >
                          打开
                        </Button>
                      </Link>
                      <Button
                        size="small"
                        onClick={() => handleOpenProject(project)}
                        sx={{ ml: 1, mb: 1 }}
                        variant="contained"
                        color="secondary"
                      >
                        编辑
                      </Button>
                      <Button
                        size="small"
                        disabled={true}
                        onClick={() => handleOpenProject(project)}
                        sx={{ ml: 1, mb: 1 }}
                        variant="contained"
                        color="warning"
                      >
                        删除
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
        </Grid>
      </Container>
      <MediaForm 
        open={openFormModel} 
        onClose={closeFormModal} 
        onSubmit={handleSubmit}
        initialData={selectedProject || undefined}
      />
    </Box>
  );
}
