import { Comment } from '@/types/comment';
import React from 'react';
import request from './base';
// import { Comment } from './models/comment';
const baseUrl = '/v1/comment';

export const getCommentListApi = async (id: number): Promise<Comment[]> => {
    try {
        const response = await request.get(`${baseUrl}/media/${id}`);
        const comments: Comment[] = [];
        response.data?.list?.forEach(item => {
            comments.push({
                id: item.id,
                content: item.content,
                timestamp: item.timestamp ?? 0,
                username: item.user.name,
                avatarUrl: item.user.avatarUrl,
                images: item.imageUrls || [],
                createdAt: item.createdAt,
            });
        });
        return comments; // 从响应中提取 data 属性
    } catch (error) {
        console.error('获取评论列表时出错:', error); // 错误处理
        throw error; // 重新抛出错误以便调用者处理
    }
}
export interface AddCommentReq {
    /**
     * 评论
     */
    content: string;
    imageUrls?: string[];
    /**
     * 媒体的id
     */
    mediaId: number;
    /**
     * 视频时间戳
     */
    timestamp: number;
    userId: number;
}
export const addCommentApi = async (comment: AddCommentReq) => {
    return request.post(`${baseUrl}/create`, comment);
}
export const delCommentApi = async (id: number) => {
    return request.post(`${baseUrl}/delete/${id}`, {});
}
