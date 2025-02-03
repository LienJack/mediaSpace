import axios from "axios";
import { alistBaseUrl, fileImagePath } from "@/utils/env"
import { ContentRes, FsGetRes, FsListReq, Response } from "./models/files";

// 创建axios实例
const instance = axios.create({
    baseURL: alistBaseUrl,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 登录获取token
export const LoginApi = async () => {
    const data = {
        username: "admin",
        password: "admin"
    };
    const config = {
        baseURL: alistBaseUrl,
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    const token = await axios.post('/auth/login', data, config).then(res => res.data.data.token);
    sessionStorage.setItem('alsitToken', token);  
    return token;
}

// 请求拦截器
instance.interceptors.request.use(
    async (config) => {
        let token = sessionStorage.getItem('alsitToken');
        if (!token) {
            token = await LoginApi();
        }
        config.headers.authorization = token;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 添加响应拦截器以处理401错误
let isRefreshing = false; // 标志，表示是否正在刷新token
let pendingRequests: any[] = []; // 存储待处理的请求

instance.interceptors.response.use(
    async (response) => {
        if (response.data.code === 200) {
            return response;
        }
        if (response.data.code === 401) {
            const originalConfig = response.config;

            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    await LoginApi();
                    // 获取新token后立即重试当前请求
                    originalConfig.headers.authorization = sessionStorage.getItem('alsitToken');
                    const retryResponse = await instance(originalConfig);
                    
                    // 处理其他等待的请求
                    pendingRequests.forEach((callback) => callback());
                    pendingRequests = [];
                    
                    return retryResponse;
                } catch (err) {
                    return Promise.reject(err);
                } finally {
                    isRefreshing = false;
                }
            }

            // 其他并发请求将等待token刷新完成
            return new Promise((resolve) => {
                pendingRequests.push(() => {
                    originalConfig.headers.authorization = sessionStorage.getItem('alsitToken');
                    resolve(instance(originalConfig));
                });
            });
        }
        return Promise.reject(response.data.message);
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 修改现有的API函数使用instance实例
export const getFileDetail = async (filePath: string): Promise<Response<FsGetRes>> => {
    const res = await instance.post(`/fs/get`, {
        path: filePath // 添加path参数
    });
    return res.data;
};

export const UpdateFileApi = async (formData: FormData, onUploadProgress?: (progressEvent: ProgressEvent) => void) => {
    const fileName = (formData.get("file") as File)?.name || "name";
    const filePath = `${fileImagePath}/${Math.random().toString().substring(2, 5)}-${fileName}`;

    const config = {
        method: "put",
        url: `/fs/form`,
        headers: {
            accept: "application/json, text/plain, */*",
            "file-path": `${encodeURI(filePath)}`,
            "As-Task": "true",
            "Content-Type": "multipart/form-data; boundary=----WebKitFormBoundarylFuwOB1pQ9f4hvRh",
        },
        data: formData,
        onUploadProgress,
    };

    await instance(config);
    // 这里会把本机的ip都写入数据库，要是换ip就炸裂了
    // const res = await getFileDetail(filePath);
    // return res.data.raw_url;
    return `/p${filePath}`;
};
// 列出文件目录
export const getFileList = async (data: FsListReq): Promise<Response<FsListRes>> => {
    const res = await instance.post(`/fs/list`, data);
    return res.data;
};
