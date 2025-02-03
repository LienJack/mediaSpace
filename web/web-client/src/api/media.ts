import request from './base';
import { MediaRes } from './models/media';
import { Media } from '@/types/media';
import { Response } from './models/base';
const baseUrl = '/v1/media';
export const getMediaListApi = async (): Promise<Media[]> => {
    // 获取媒体列表
    try {
        const response = await request.get(`${baseUrl}/list`) as Response<MediaRes[]>;
        const mediaList: Media[] = [];
        response.data?.forEach((item) => {
            mediaList.push({
                id: item.id,
                name: item.name,
                path: item.path,
                type: item.type ?? 1,
                descript: item.descript ?? '',
                createdAt: item.createdAt ?? '',
                updatedAt: item.updatedAt ?? '',
            });
        });
        return mediaList;
    } catch (error) {
        console.log(error);
        return [];
    }
};
export interface CreateMediaRequest {
    descript?: string;
    name: string;
    path: string
    type: number
}
export const createMediaApi = async (data: CreateMediaRequest) => {
    // 创建媒体
    try {
        const response = await request.post(`${baseUrl}/create`, data);
        console.log(JSON.stringify(response.data));
    } catch (error) {
        console.log(error);
    }
};

export const getMediaApi = async (id: number): Promise<Media | null> => {
    // 创建媒体
    try {
        const response = await request.get(`${baseUrl}/${id}`) as Response<MediaRes>;
        const media: Media = {
            id: response.data?.id ?? 0,
            name: response.data?.name ?? '',
            path: response.data?.path ?? '',
            type: response.data?.type ?? 1,
            descript: response.data?.descript ?? '',
            createdAt: response.data?.createdAt ?? '',
            updatedAt: response.data?.updatedAt ?? '',
        };
        return media;
    } catch (error) {
        console.log(error);
        return null;
    }
};
