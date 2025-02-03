import request from './base';
import { User } from './models/user';
import { Response } from './models/base'
const baseUrl = '/v1/user';

export const getUserInfo = async (id: string): Promise<User> => {
    try {
        const response = await request.get(`${baseUrl}/${id}`) as Response<User>;
        return response.data; // 从响应中提取 data 属性
    } catch (error) {
        console.error('获取用户信息出错:', error); // 错误处理
        throw error; // 重新抛出错误以便调用者处理
    }
}

// 获取所有用户
export const getAllUsersApi = async (): Promise<User[]> => {
    try {
        const response = await request.get(`${baseUrl}/list`) as Response<User[]>;
        return response.data; // 从响应中提取 data 属性
    } catch (error) {
        console.error('获取用户列表出错:', error); // 错误处理
        throw error; // 重新抛出错误以便调用者处理
    }
};

// 更新用户信息
export const updateUserApi = async (id: string, userData: Partial<User>): Promise<User> => {
    try {
        const response = await request.post(`${baseUrl}/update`, userData) as Response<User>;
        return response.data; // 从响应中提取 data 属性
    } catch (error) {
        console.error('更新用户信息出错:', error); // 错误处理
        throw error; // 重新抛出错误以便调用者处理
    }
};