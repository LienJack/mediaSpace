"use client";
import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Breadcrumbs,
    Typography,
    Link
} from '@mui/material';

interface FileItem {
    name: string;
    size: string;
    modifiedTime: string;
}

const initialFileList: FileItem[] = [
    { name: '_.看物', size: '4.00K', modifiedTime: '2024-10-22 15:34:04' },
    { name: 'ENT', size: '-', modifiedTime: '2024-11-15 21:40:38' },
    { name: 'PDF', size: '-', modifiedTime: '2024-11-15 21:38:51' },
    { name: 'edu', size: '-', modifiedTime: '2024-11-15 21:38:51' },
];

const FileListPage: React.FC = () => {
    const [fileList, setFileList] = useState<FileItem[]>(initialFileList);

    useEffect(() => {
        // 这里可以进行数据获取或其他动态操作
        // setFileList(fetchedData);
    }, []);

    return (
        <div className="flex flex-col items-center">
            <Breadcrumbs aria-label="breadcrumb" className="mb-4">
                <Link >首页</Link>
                <Link >nas</Link>
                <Link >education</Link>
                <Typography color="text.primary">Japanese</Typography>
            </Breadcrumbs>
            <TableContainer component={Paper} className="w-full max-w-6xl">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>名称</TableCell>
                            <TableCell>大小</TableCell>
                            <TableCell>修改时间</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fileList.map((file, index) => (
                            <TableRow key={index}>
                                <TableCell>{file.name}</TableCell>
                                <TableCell>{file.size}</TableCell>
                                <TableCell>{file.modifiedTime}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default FileListPage;
