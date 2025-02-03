import React from 'react';
import {
  Box,
  Breadcrumbs,
  Button,
  Container,
  IconButton,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  Dialog
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';

// 定义文件项的接口
interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: string;
  date: string;
}

// 示例数据
const sampleFiles: FileItem[] = [
  {
    id: '1',
    name: '新刃牙',
    type: 'folder',
    date: '2024-11-03 09:51:53'
  },
  {
    id: '2',
    name: '无职转生 S02',
    type: 'folder',
    date: '2024-10-22 13:16:11'
  },
  {
    id: '3',
    name: '.DS_Store',
    type: 'file',
    size: '6.00K',
    date: '2024-10-23 09:59:24'
  },
  {
    id: '4',
    name: '._DS_Store',
    type: 'file',
    size: '4.00K',
    date: '2024-10-23 09:59:19'
  }
];

interface FileListModelProps {
  open: boolean;
  onClose: () => void;
}

const FileListModel: React.FC<FileListModelProps> = ({ open, onClose }) => {
  const theme = useTheme();

  const handleBack = () => {
    onClose();
  };

  const handleFileClick = (file: FileItem) => {
    onClose();
  };

  const handleLoadMore = () => {
    // 处理加载更多逻辑
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper 
          elevation={3}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          {/* 面包屑导航 */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <IconButton 
              onClick={handleBack}
              size="small"
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Breadcrumbs aria-label="breadcrumb">
              <Link 
                href="#"
                underline="hover"
                color="inherit"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                主页
              </Link>
              <Link
                href="#"
                underline="hover"
                color="inherit"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                阿里云盘
              </Link>
            </Breadcrumbs>
          </Box>

          {/* 文件列表 */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>名称</TableCell>
                  <TableCell align="right">大小</TableCell>
                  <TableCell align="right">修改日期</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sampleFiles.map((file) => (
                  <TableRow
                    key={file.id}
                    hover
                    onClick={() => handleFileClick(file)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {file.type === 'folder' ? (
                          <FolderIcon sx={{ mr: 1, color: 'primary.main' }} />
                        ) : (
                          <FileIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        )}
                        <Typography variant="body2">{file.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        {file.size || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        {file.date}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 加载更多按钮 */}
          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <Button
              variant="contained"
              onClick={handleLoadMore}
              sx={{
                bgcolor: 'background.default',
                '&:hover': {
                  bgcolor: 'action.hover',
                }
              }}
            >
              加载更多
            </Button>
          </Box>
        </Paper>
      </Container>
    </Dialog>
  );
};

export default FileListModel;