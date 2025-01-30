import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { 
  TextField, 
  Button,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { 
  Close as CloseIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  AttachFile as AttachFileIcon,
  Fullscreen as FullscreenIcon,
  MinimizeOutlined as MinimizeIcon,
  TextFields as TextFieldsIcon,
  AlternateEmail as AtIcon,
  Link as LinkIcon,
  EmojiEmotions as EmojiIcon,
  Send as SendIcon
} from '@mui/icons-material'

interface ImageFile {
  file: File
  preview: string
  progress: number
}

interface Comment {
  id: string
  content: string
  images: string[]
  timestamp: number
}

export const TextEditor = () => {
  const [content, setContent] = useState('')
  const [images, setImages] = useState<ImageFile[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [openUploadDialog, setOpenUploadDialog] = useState(false)

  // 工具栏按钮配置
  const toolbarButtons = [
    { icon: <CloseIcon />, label: '关闭', onClick: () => {} },
    // { icon: <UndoIcon />, label: '撤销', onClick: () => {} },
    // { icon: <RedoIcon />, label: '重做', onClick: () => {} },
    { icon: <AttachFileIcon />, label: '附件', onClick: () => setOpenUploadDialog(true) },
    // { icon: <FullscreenIcon />, label: '全屏', onClick: () => {} },
    // { icon: <AtIcon />, label: '@功能', onClick: () => {} },
    // { icon: <LinkIcon />, label: '链接', onClick: () => {} },
    // { icon: <EmojiIcon />, label: '表情', onClick: () => {} }
  ]

  // 处理文件选择
  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files)
      addNewImages(newFiles)
    }
  }

  // 处理拖拽
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(event.dataTransfer.files)
    addNewImages(files)
  }

  // 添加新图片
  const addNewImages = (files: File[]) => {
    const imageFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0
    }))
    setImages(prev => [...prev, ...imageFiles])
  }

  // 删除图片
  const handleRemoveImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev]
      URL.revokeObjectURL(newImages[index].preview)
      newImages.splice(index, 1)
      return newImages
    })
  }

  // 模拟上传图片
  const uploadImages = async () => {
    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      // 模拟上传进度
      for (let progress = 0; progress <= 100; progress += 10) {
        setImages(prev => {
          const newImages = [...prev]
          newImages[i] = { ...newImages[i], progress }
          return newImages
        })
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    // 返回模拟的图片URL数组
    return images.map(img => img.preview)
  }

  // 发送评论
  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) return

    const uploadedImageUrls = await uploadImages()
    
    const newComment: Comment = {
      id: Date.now().toString(),
      content,
      images: uploadedImageUrls,
      timestamp: Date.now()
    }

    setComments(prev => [newComment, ...prev])
    setContent('')
    setImages([])
  }

  return (
    <div>
      {/* 文字输入区域 */}
      <TextField
        multiline
        rows={4}
        fullWidth
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="写下你的评论..."
        variant="standard"
        className="p-4"
        InputProps={{
          disableUnderline: true,
        //   style: { height: 150 },
        }}
      />

      {/* 工具栏 */}
      <Box className="flex items-center justify-between border-t p-2">
        <Box className="flex gap-1">
          {toolbarButtons.map((button, index) => (
            <IconButton
              key={index}
              size="small"
              onClick={button.onClick}
              aria-label={button.label}
            >
              {button.icon}
            </IconButton>
          ))}
        </Box>
        
        <Button
          variant="contained"
          size="small"
          endIcon={<SendIcon />}
          onClick={handleSubmit}
          disabled={!content.trim() && images.length === 0}
          className="ml-2"
        >
          发送
        </Button>
      </Box>

      {/* 图片上传弹框 */}
      <Dialog 
        open={openUploadDialog} 
        onClose={() => setOpenUploadDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>上传图片</DialogTitle>
        <DialogContent>
          <Box
            className="border-2 border-dashed p-8 text-center cursor-pointer hover:border-blue-500"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
            <AttachFileIcon className="text-4xl mb-2" />
            <div>点击或拖拽图片到此处上传</div>
          </Box>

          {/* 图片预览区域 */}
          {images.length > 0 && (
            <Box className="grid grid-cols-3 gap-4 mt-4">
              {images.map((image, index) => (
                <Box key={index} className="relative">
                  <img
                    src={image.preview}
                    alt={`预览图 ${index + 1}`}
                    className="w-full h-24 object-cover rounded"
                  />
                  <IconButton
                    size="small"
                    className="absolute top-1 right-1 bg-white/80 hover:bg-white"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)}>取消</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              handleSubmit()
              setOpenUploadDialog(false)
            }}
            disabled={images.length === 0}
          >
            确认上传
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default TextEditor
