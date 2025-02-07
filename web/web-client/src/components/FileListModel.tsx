import React, { useState, useRef, ReactElement } from 'react';
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
  Dialog,
  DialogProps
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon
} from '@mui/icons-material';
import { getFileList } from '@/api/file';
import { ContentVO, FsListReq, FileType } from '@/api/models/files';
import { useRequest } from 'ahooks';
import { formatToMySQLDateTime } from '@/utils/time';
import prettyBytes from 'pretty-bytes';
import { fileBasePath } from '@/utils/env'
import { FixedSizeList as VirtualList } from 'react-window';

// 定义组件的属性接口
interface FileListModelProps extends Omit<DialogProps, 'onClose'> {
  open: boolean;
  onClose: () => void;
  onFileClick: (filePath: string, fileInfo: ContentVO) => void;
  allowTypes?: FileType[];
}

// 定义面包屑路径类型
type BreadcrumbPath = string[];

// 定义列表项渲染器的属性接口
interface ListItemRendererProps {
  index: number;
  style: React.CSSProperties;
}

// 定义文件图标映射类型
type FileIconMap = {
  [key in FileType]?: ReactElement;
};

const FileListModel: React.FC<FileListModelProps> = ({ 
  open, 
  onClose, 
  onFileClick, 
  allowTypes = [],
  ...dialogProps 
}) => {
  const [fileList, setFileList] = useState<ContentVO[]>([]);
  const currentPathRef = useRef<BreadcrumbPath>([fileBasePath]);

  const listRequestParams: FsListReq = {
    per_page: 100,
    refresh: true
  };

  // 文件列表数据请求
  const { run: fetchFileList } = useRequest(
    (path: string) => getFileList({ ...listRequestParams, path }), 
    {
      defaultParams: [currentPathRef.current.join('/')],
      onSuccess: (response) => {
        setFileList(response.data.content || []);
      }
    }
  );

  // 处理返回上一级
  const handleNavigateBack = () => {
    currentPathRef.current.pop();
    fetchFileList(currentPathRef.current.join('/'));
  };

  // 处理文件或文件夹点击
  const handleItemClick = (file: ContentVO) => {
    if (file.is_dir) {
      currentPathRef.current.push(file.name);
      fetchFileList(currentPathRef.current.join('/'));
      return;
    }

    const isAllowedType = allowTypes.length === 0 || allowTypes.includes(file.type);
    if (!isAllowedType) return;

    currentPathRef.current.push(file.name);
    onFileClick(currentPathRef.current.join('/'), file);
    currentPathRef.current.pop();
    onClose();
  };

  // 处理面包屑导航点击
  const handleBreadcrumbClick = (index: number) => {
    currentPathRef.current = currentPathRef.current.slice(0, index + 1);
    fetchFileList(currentPathRef.current.join('/'));
  };

  // 渲染文件图标
  const renderFileIcon = (file: ContentVO) => {
    if (file.is_dir) {
      return <FolderIcon sx={{ mr: 1, color: 'primary.main' }} />;
    }

    const iconMap: FileIconMap = {
      [FileType.IMAGE]: <ImageIcon sx={{ mr: 1, color: 'text.secondary' }} />,
      [FileType.VIDEO]: <VideoIcon sx={{ mr: 1, color: 'text.secondary' }} />,
    };

    return iconMap[file.type] || <FileIcon sx={{ mr: 1, color: 'text.secondary' }} />;
  };

  // 渲染列表项
  const renderListItem = ({ index, style }: ListItemRendererProps) => {
    const file = fileList[index];
    const isAllowed = file.is_dir || allowTypes.includes(file.type);

    return (
      <TableContainer style={style}>
        <Table>
          <TableBody>
            <TableRow
              hover
              onClick={() => handleItemClick(file)}
              sx={{ 
                cursor: isAllowed ? 'pointer' : 'not-allowed',
                opacity: isAllowed ? 1 : 0.5,
                '& td': { flex: 1 } 
              }}
            >
              <TableCell width="50%">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {renderFileIcon(file)}
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
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{ zIndex: 10000 }}
      {...dialogProps}
    >
      <Container maxWidth="lg" sx={{ p: 0, bgcolor: 'background.paper', width: '100%' }}>
        <Paper sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          overflow: 'hidden',
          width: '100%',
          height: '70vh',
        }}>
          {/* 面包屑导航 */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <IconButton 
              onClick={handleNavigateBack}
              size="small"
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Breadcrumbs aria-label="breadcrumb">
              {currentPathRef.current.map((path, index) => (
                <Link 
                  key={index}
                  underline="hover"
                  color="inherit"
                  sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => handleBreadcrumbClick(index)}
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
            
            <VirtualList
              height={window.innerHeight * 0.7 - 120}
              itemCount={fileList.length}
              itemSize={60}
              width="100%"
            >
              {renderListItem}
            </VirtualList>
          </Box>
        </Paper>
      </Container>
    </Dialog>
  );
};

export default FileListModel;