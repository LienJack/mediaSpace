'use client'

import { FC, useState, useEffect } from "react";
// import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  ImageList,
  ImageListItem,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

interface ImagePreviewProps {
  images: string[];
  width?: string;
  cols?: number;
  rowHeight?: number;
  handleDelete?: (index: number) => void;
}

const ImagePreview: FC<ImagePreviewProps> = ({
  images,
  width = "200px",
  cols = 3,
  rowHeight = 50,
  handleDelete,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // 确保组件只在客户端渲染
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // 或者返回一个加载占位符
  }

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleDeleteClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    handleDelete?.(index);
  };

  return (
    <>
      <ImageList 
        sx={{ 
          width, 
          overflow: "hidden",
          m: 0 // 移除默认外边距
        }} 
        cols={cols} 
        rowHeight={rowHeight}
      >
        {images.map((image, index) => (
          <ImageListItem
            key={index}
            sx={{
              cursor: "pointer",
              "&:hover": { opacity: 0.8 },
              position: "relative"
            }}
            onClick={() => handleImageClick(image)}
          >
            <img
              src={image}
              alt={`预览图片 ${index + 1}`}
              loading="lazy"
              style={{ 
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />
            {handleDelete && (
              <IconButton
                size="small"
                sx={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  }
                }}
                onClick={(e) => handleDeleteClick(e, index)}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </ImageListItem>
        ))}
      </ImageList>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        PaperProps={{
          sx: {
            maxWidth: '90vw',
            maxHeight: '90vh',
            backgroundColor: 'transparent',
            boxShadow: 'none',
          }
        }}
      >
        <DialogContent 
          sx={{ 
            p: 0,
            position: "relative",
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent'
          }}
        >
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
          <img
            src={selectedImage}
            alt="预览图片"
            style={{
              maxWidth: '100%',
              maxHeight: '85vh',
              objectFit: 'contain',
              borderRadius: '4px'
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImagePreview;
