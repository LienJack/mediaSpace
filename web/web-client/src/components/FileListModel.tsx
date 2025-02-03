import React, { useState, useRef } from 'react';
import {
  Box,
  Breadcrumbs,
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
  Dialog
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  TextSnippet as TextIcon,
  VideoLibrary as VideoIcon
} from '@mui/icons-material';
import { getFileList } from '@/api/file';
import { ContentRes, FsListReq, FileType } from '@/api/models/files';
import { useRequest } from 'ahooks';
import { formatToMySQLDateTime } from '@/utils/time';
import prettyBytes from 'pretty-bytes';
import { fileBasePath } from '@/utils/env'
import { FixedSizeList as List } from 'react-window';

interface FileListModelProps {
  open: boolean;
  onClose: () => void;
  onFileClick: (path: string, file: ContentRes,) => void;
  allowTypes?: FileType[];
}

const FileListModel: React.FC<FileListModelProps> = ({ open, onClose, onFileClick, allowTypes =[] }) => {
  const [files, setFiles] = useState<ContentRes[]>([]);
  const pathRef = useRef<string[]>([fileBasePath]);
  const param: FsListReq = {
    per_page: 100,
    refresh: true
  };

  // 使用 useRequest 进行数据请求
  const { run } = useRequest((path: string) => getFileList({...param, path}), {
    defaultParams: [pathRef.current.join('/')],
    onBefore: () => {
        console.log(pathRef.current);
    },
    onSuccess: (data) => {
        setFiles(data.data.content);
    }
  });

  const handleBack = () => {
    pathRef.current.pop();
    run(pathRef.current.join('/'));
  };

  const handleFileClick = (file: ContentRes) => {
    if (file.is_dir) {
      // 更新路径并重新请求文件列表
      pathRef.current.push(file.name);
      run(pathRef.current.join('/')); // 重新请求文件列表
    } else {
      if (allowTypes.length > 0 && !allowTypes.includes(file.type)) {
        return;
      }
      pathRef.current.push(file.name);
      onFileClick(pathRef.current.join('/'), file);
      pathRef.current.pop();
      onClose();
    }
  };

  // 添加一个函数来根据文件类型返回相应的图标
  const getFileIcon = (file: ContentRes) => {
    if (file.is_dir) {
      return <FolderIcon sx={{ mr: 1, color: 'primary.main' }} />;
    }
    switch (file.type) {
      case FileType.IMAGE:
        return <ImageIcon sx={{ mr: 1, color: 'text.secondary' }} />;
      case FileType.VIDEO:
        return <VideoIcon sx={{ mr: 1, color: 'text.secondary' }} />;
      // 可以根据需要添加更多文件类型
      default:
        return <FileIcon sx={{ mr: 1, color: 'text.secondary' }} />;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{zIndex: 10000}}
    >
      <Container maxWidth="lg" sx={{ p: 0, bgcolor: 'background.paper', width: '100%' }}>
        <Paper 
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 2,
            overflow: 'hidden',
            width: '100%',
            height: '70vh',
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
              {pathRef.current.map((path, index) => (
                <Link 
                  key={index}
                  underline="hover"
                  color="inherit"
                  sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => {
                    // 处理点击面包屑的逻辑
                    pathRef.current = pathRef.current.slice(0, index + 1);
                    run(pathRef.current.join('/'));
                  }}
                >
                  {path}
                </Link>
              ))}
            </Breadcrumbs>
          </Box>

          {/* 文件列表 */}
          <Box sx={{ width: '100%', height: 'calc(70vh - 64px)' }}>
            <Table sx={{ tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow>
                  <TableCell width="50%">名称</TableCell>
                  <TableCell width="25%" align="right">大小</TableCell>
                  <TableCell width="25%" align="right">修改日期</TableCell>
                </TableRow>
              </TableHead>
            </Table>
            
            <List
              height={window.innerHeight * 0.7 - 120}
              itemCount={files.length}
              itemSize={60}
              width="100%"
            >
              {({ index, style }) => {
                const file = files[index];
                const allow = file.type === FileType.DIR || allowTypes.includes(file.type);
                return (
                  <TableContainer style={style}>
                    <Table>
                      <TableBody>
                        <TableRow
                          key={file.name}
                          hover
                          onClick={() => {
                            handleFileClick(file);
                          }}
                          sx={{ 
                            cursor: allow ? 'pointer' : 'not-allowed',
                            opacity: allow ? 1 : 0.5,
                            '& td': { flex: 1 } 
                          }}
                        >
                          <TableCell width="50%">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {getFileIcon(file)} {/* 使用新函数获取图标 */}
                              <Typography variant="body2" noWrap>{file.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell width="25%" align="right">
                            <Typography variant="body2" color="text.secondary">
                              {file.size ? prettyBytes(file.size) : '-'}  
                            </Typography>
                          </TableCell>
                          <TableCell width="25%" align="right">
                            <Typography variant="body2" color="text.secondary">
                              {formatToMySQLDateTime(new Date(file.modified))}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                );
              }}
            </List>
          </Box>
        </Paper>
      </Container>
    </Dialog>
  );
};

export default FileListModel;