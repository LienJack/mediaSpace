import { FC, useState } from "react";
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
  handleDelete?: (index: number) => void;
}

const ImagePreview: FC<ImagePreviewProps> = ({
  images,
  width = "200px",
  cols = 3,
  handleDelete,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
    setOpen(true);
  };

  return (
    <>
      <ImageList sx={{ width }} cols={cols} rowHeight={50}>
        {images.map((image, index) => (
          <ImageListItem
            key={index}
            sx={{
              cursor: "pointer",
              "&:hover": { opacity: 0.8 },
            }}
            onClick={() => handleImageClick(image)}
          >
            <img
              src={image}
              alt={`评论图片 ${index + 1}`}
              sizes="100px"
              style={{ objectFit: "cover" }}
            />
            {handleDelete && (
              <IconButton
                sx={{ position: "absolute", top: -8, right: -10 }}
                onClick={(e) => { e.stopPropagation(); handleDelete(index); }}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            )}
          </ImageListItem>
        ))}
      </ImageList>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <IconButton
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "white",
          }}
          onClick={() => setOpen(false)}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ p: 0, position: "relative", height: "70vh" }}>
          <img
            src={selectedImage}
            alt="预览图片"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImagePreview;
