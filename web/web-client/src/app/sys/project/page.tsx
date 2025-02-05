"use client";

import { useState } from "react";
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
import { useRequest } from "ahooks";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import { getMediaListApi, createMediaApi, updateMediaApi, deleteMediaApi } from "@/api/media";
import { formatToMySQLDateTime } from "@/utils/time";
import MediaForm from "@/components/MediaForm";
import type { Media } from "@/types/media.ds";

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

// 动画配置
const cardAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

export default function ProjectPage() {
  const [isMediaFormOpen, setIsMediaFormOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  // 获取项目列表
  const {
    loading: isLoading,
    data: mediaList = [],
    run: refreshMediaList,
  } = useRequest(getMediaListApi, {
    loadingDelay: 100,
  });

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
    await deleteMediaApi(mediaId);
    refreshMediaList();
  };

  const handleSubmitMedia = async (mediaData: Media) => {
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
    refreshMediaList();
    handleCloseMediaForm();
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
      <motion.div
        layout
        initial={cardAnimation.initial}
        animate={cardAnimation.animate}
        exit={cardAnimation.exit}
        transition={cardAnimation.transition}
      >
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
      </motion.div>
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
            onClick={refreshMediaList}
          >
            刷新
          </Button>
        </Box>

        <Typography variant="h4" sx={{ mb: 3 }}>
          最近项目
        </Typography>

        <AnimatePresence mode="popLayout">
          <Grid container spacing={3}>
            {isLoading
              ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                  <ProjectCardSkeleton key={index} />
                ))
              : mediaList.map(renderMediaCard)}
          </Grid>
        </AnimatePresence>
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
