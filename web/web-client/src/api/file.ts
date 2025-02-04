import axios, { AxiosInstance, AxiosResponse, AxiosProgressEvent } from "axios";
import { alistBaseUrl, fileImagePath } from "@/utils/env"
import { FsGetRes, FsListReq, FsListRes } from "./models/files";

/**
 * 定义API响应类型
 */
interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

/**
 * 登录请求参数类型
 */
interface LoginRequest {
    username: string;
    password: string;
}

/**
 * 登录响应类型
 */
interface LoginResponse {
    token: string;
}

// 创建axios实例
const instance: AxiosInstance = axios.create({
    baseURL: alistBaseUrl,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * 登录获取token
 * @returns Promise<string> 返回token
 */
export const loginToAlist = async (): Promise<string> => {
    const loginData: LoginRequest = {
        username: "admin",
        password: "admin"
    };

    try {
        const response = await axios.post<ApiResponse<LoginResponse>>(
            '/auth/login',
            loginData,
            {
                baseURL: alistBaseUrl,
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        
        const token = response.data.data.token;
        sessionStorage.setItem('alsitToken', token);
        return token;
    } catch (error) {
        console.error('登录失败:', error);
        throw new Error('登录获取token失败');
    }
};

// 请求拦截器
instance.interceptors.request.use(
    async (config) => {
        let token = sessionStorage.getItem('alsitToken');
        if (!token) {
            token = await loginToAlist();
        }
        config.headers.authorization = token;
        return config;
    },
    (error) => {
        console.error('请求拦截器错误:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
let isRefreshing = false;
const pendingRequests: Array<() => void> = [];

instance.interceptors.response.use(
    async (response: AxiosResponse<ApiResponse<unknown>>) => {
        if (response.data.code === 200) {
            return response;
        }

        if (response.data.code === 401) {
            const originalConfig = response.config;

            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    await loginToAlist();
                    originalConfig.headers.authorization = sessionStorage.getItem('alsitToken');
                    const retryResponse = await instance(originalConfig);
                    
                    pendingRequests.forEach((callback) => callback());
                    pendingRequests.length = 0;
                    
                    return retryResponse;
                } catch (error) {
                    console.error('Token刷新失败:', error);
                    return Promise.reject(error);
                } finally {
                    isRefreshing = false;
                }
            }

            return new Promise((resolve) => {
                pendingRequests.push(() => {
                    originalConfig.headers.authorization = sessionStorage.getItem('alsitToken');
                    resolve(instance(originalConfig));
                });
            });
        }

        return Promise.reject(new Error(response.data.message));
    },
    (error) => {
        console.error('响应拦截器错误:', error);
        return Promise.reject(error);
    }
);

/**
 * 获取文件详情
 * @param filePath 文件路径
 * @returns Promise<ApiResponse<FsGetRes>>
 */
export const getFileDetail = async (filePath: string): Promise<ApiResponse<FsGetRes>> => {
    try {
        const response = await instance.post<ApiResponse<FsGetRes>>('/fs/get', {
            path: filePath
        });
        return response.data;
    } catch (error) {
        console.error('获取文件详情失败:', error);
        throw error;
    }
};

/**
 * 上传文件
 * @param formData 文件表单数据
 * @param onUploadProgress 上传进度回调
 * @returns Promise<string> 返回文件路径
 */
export const uploadFile = async (
    formData: FormData,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<string> => {
    const file = formData.get("file") as File;
    if (!file) {
        throw new Error('未找到上传文件');
    }

    const fileName = file.name;
    const randomStr = Math.random().toString(36).substring(2, 5);
    const filePath = `${fileImagePath}/${randomStr}-${fileName}`;

    try {
        await instance.put('/fs/form', formData, {
            headers: {
                'file-path': encodeURI(filePath),
                'As-Task': 'true',
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress,
        });

        return `/p${filePath}`;
    } catch (error) {
        console.error('文件上传失败:', error);
        throw error;
    }
};

/**
 * 获取文件列表
 * @param params 列表请求参数
 * @returns Promise<ApiResponse<FsListRes>>
 */
export const getFileList = async (params: FsListReq): Promise<ApiResponse<FsListRes>> => {
    try {
        const response = await instance.post<ApiResponse<FsListRes>>('/fs/list', params);
        return response.data;
    } catch (error) {
        console.error('获取文件列表失败:', error);
        throw error;
    }
};

/**
 * @deprecated 请使用 uploadFile 替代
 */
export const UpdateFileApi = uploadFile;
