import { FC, useState } from 'react';
import Image from 'next/image';
import { 
  Dialog,
  DialogContent,
  ImageList,
  ImageListItem,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ImagePreviewProps {
  images: string[];
}

const ImagePreview: FC<ImagePreviewProps> = ({ images }) => {
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
    setOpen(true);
  };

  return (
    <>
      <ImageList sx={{ width: '100%', maxWidth: 200 }} cols={3} rowHeight={50}>
        {images.map((image, index) => (
          <ImageListItem 
            key={index}
            sx={{ 
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 }
            }}
            onClick={() => handleImageClick(image)}
          >
            <Image
              src={image}
              alt={`评论图片 ${index + 1}`}
              fill
              sizes="100px"
              style={{ objectFit: 'cover' }}
              priority={index < 4}
            />
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
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white'
          }}
          onClick={() => setOpen(false)}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ p: 0, position: 'relative', height: '90vh' }}>
          <Image
            src={selectedImage}
            alt="预览图片"
            fill
            sizes="100vw"
            style={{ objectFit: 'contain' }}
            priority
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImagePreview; 