import request from './base';
import { MediaVO, CreateMediaRequest, UpdateMediaRequest } from './models/media';
import { Media } from '@/types/media.ds';
import { Response } from './models/base';
const baseUrl = '/v1/media';
export const getMediaListApi = async (): Promise<Media[]> => {
    // 获取媒体列表
    try {
        const response = await request.get(`${baseUrl}/list`) as Response<MediaVO[]>;
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
        const response = await request.get(`${baseUrl}/${id}`) as Response<MediaVO>;
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

export const updateMediaApi = async (id: number, data: UpdateMediaRequest) => {
    // 更新媒体
    try {
        const response = await request.post(`${baseUrl}/update/${id}`, data);
        console.log(JSON.stringify(response.data));
    } catch (error) {
        console.log(error);
    }
};
export const deleteMediaApi = async (id: number) => {
    // 更新媒体
    try {
        const response = await request.post(`${baseUrl}/delete/${id}`);
        console.log(JSON.stringify(response.data));
    } catch (error) {
        console.log(error);
    }
};
