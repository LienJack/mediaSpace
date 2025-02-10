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
import RefreshIcon from "@mui/icons-material/Refresh";
import Link from "next/link";
import dynamic from "next/dynamic";

import { getMediaListApi, createMediaApi, updateMediaApi, deleteMediaApi } from "@/api/media";
import { formatToMySQLDateTime } from "@/utils/time";
import MediaForm from "@/components/MediaForm";
import type { Media } from "@/types/media.ds";

// 动态导入动画组件，确保客户端渲染
const NoSSR = dynamic(() => import("@/components/NoSSR"), { 
  ssr: false,
  loading: () => <p>Loading...</p>
});

// 类型定义
interface ProjectCardSkeletonProps {
  key: number;
}

// 常量定义
const SKELETON_COUNT = 3;

// 组件定义
const ProjectCardSkeleton = ({ key }: ProjectCardSkeletonProps) => (
  <Grid size={4} key={key}>
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="40%" />
      </CardContent>
    </Card>
  </Grid>
);

// 项目类型标签配置
const PROJECT_TYPE_CONFIG = {
  1: { label: "本地", color: "primary" },
  2: { label: "线上", color: "secondary" },
  default: { label: "未知", color: "default" },
} as const;


export default function ProjectPage() {
  const [isMediaFormOpen, setIsMediaFormOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // 替换 useRequest 的数据获取逻辑
  const fetchMediaList = async () => {
    try {
      setIsLoading(true);
      const data = await getMediaListApi();
      setMediaList(data);
    } catch (error) {
      console.error('Failed to fetch media list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 确保组件只在客户端渲染
  useEffect(() => {
    setIsMounted(true);
    fetchMediaList();
  }, []);

  if (!isMounted) {
    return null;
  }

  // 处理函数
  const handleOpenMediaForm = () => {
    setSelectedMedia(null);
    setIsMediaFormOpen(true);
  };

  const handleCloseMediaForm = () => {
    setSelectedMedia(null);
    setIsMediaFormOpen(false);
  };

  const handleEditMedia = (media: Media) => {
    setSelectedMedia(media);
    setIsMediaFormOpen(true);
  };

  const handleDeleteMedia = async (mediaId: number) => {
    try {
      await deleteMediaApi(mediaId);
      await fetchMediaList();
    } catch (error) {
      console.error('Failed to delete media:', error);
    }
  };

  const handleSubmitMedia = async (mediaData: Media) => {
    try {
      const payload = {
        name: mediaData.name,
        path: mediaData.path,
        descript: mediaData.descript,
        type: mediaData.type,
      };

      if (selectedMedia) {
        await updateMediaApi(selectedMedia.id, payload);
      } else {
        await createMediaApi(payload);
      }
      await fetchMediaList();
      handleCloseMediaForm();
    } catch (error) {
      console.error('Failed to submit media:', error);
    }
  };

  // 渲染函数
  const renderMediaTypeChip = (type: number) => {
    const config = PROJECT_TYPE_CONFIG[type as keyof typeof PROJECT_TYPE_CONFIG] || PROJECT_TYPE_CONFIG.default;
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        sx={{ mb: 2, color: "text.primary", cursor: "default" }}
      />
    );
  };

  const renderMediaCard = (media: Media) => (
    <Grid size={4} key={media.id}>
      <NoSSR fallback={<ProjectCardSkeleton key={media.id} />}>
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
              {media.name}
            </Typography>
            {renderMediaTypeChip(media.type)}
            <Typography variant="body2" color="text.secondary">
              {media.descript || "暂无描述"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              创建: {media.createdAt ? formatToMySQLDateTime(new Date(media.createdAt)) : "未知时间"}
            </Typography>
            {media.updatedAt && (
              <Typography variant="body2" color="text.secondary">
                更新: {formatToMySQLDateTime(new Date(media.updatedAt))}
              </Typography>
            )}
          </CardContent>
          <CardActions>
            <Link href={`/sys/mediaTrack/${media.id}`} passHref>
              <Button size="small" sx={{ ml: 1, mb: 1 }} variant="contained">
                打开
              </Button>
            </Link>
            <Button
              size="small"
              onClick={() => handleEditMedia(media)}
              sx={{ ml: 1, mb: 1 }}
              variant="contained"
              color="secondary"
            >
              编辑
            </Button>
            <Button
              size="small"
              onClick={() => handleDeleteMedia(media.id)}
              sx={{ ml: 1, mb: 1 }}
              variant="outlined"
              color="error"
            >
              删除
            </Button>
          </CardActions>
        </Card>
      </NoSSR>
    </Grid>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Container maxWidth="lg">
        <Typography
          component="h1"
          variant="h2"
          align="center"
          sx={{ color: "primary.main", mb: 4, fontWeight: "bold" }}
        >
          Video Project Management
        </Typography>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 6 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleOpenMediaForm}
          >
            新建项目
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={<RefreshIcon />}
            onClick={fetchMediaList}
          >
            刷新
          </Button>
        </Box>

        <Typography variant="h4" sx={{ mb: 3 }}>
          最近项目
        </Typography>

        <NoSSR fallback={
          <Grid container spacing={3}>
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <ProjectCardSkeleton key={index} />
            ))}
          </Grid>
        }>
          <Grid container spacing={3}>
            {isLoading
              ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                  <ProjectCardSkeleton key={index} />
                ))
              : mediaList.map(renderMediaCard)}
          </Grid>
        </NoSSR>
      </Container>

      <MediaForm 
        open={isMediaFormOpen}
        onClose={handleCloseMediaForm}
        onSubmit={handleSubmitMedia}
        initialData={selectedMedia || undefined}
      />
    </Box>
  );
}
