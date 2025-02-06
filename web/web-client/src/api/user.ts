import request from './base';
import { UserVO } from './models/user';
import { Response } from './models/base'
const baseUrl = '/v1/user';

export const getUserInfo = async (id: string): Promise<UserVO> => {
    try {
        const response = await request.get(`${baseUrl}/${id}`) as Response<UserVO>;
        return response.data; // 从响应中提取 data 属性
    } catch (error) {
        console.error('获取用户信息出错:', error); // 错误处理
        throw error; // 重新抛出错误以便调用者处理
    }
}

// 获取所有用户
export const getAllUsersApi = async (): Promise<UserVO[]> => {
    try {
        const response = await request.get(`${baseUrl}/list`) as Response<UserVO[]>;
        return response.data; // 从响应中提取 data 属性
    } catch (error) {
        console.error('获取用户列表出错:', error); // 错误处理
        throw error; // 重新抛出错误以便调用者处理
    }
};

// 更新用户信息
export const updateUserApi = async (id: string, userData: Partial<UserVO>): Promise<UserVO> => {
    try {
        delete userData.id;
        const response = await request.post(`${baseUrl}/update/${id}`, userData) as Response<UserVO>;
        return response.data; // 从响应中提取 data 属性
    } catch (error) {
        console.error('更新用户信息出错:', error); // 错误处理
        throw error; // 重新抛出错误以便调用者处理
    }
};
// 创建用户
export const createUserApi = async (userData: { name: string; account: string; avatarUrl?: string; }): Promise<UserVO> => {
    try {
        const response = await request.post(`${baseUrl}/create`, userData) as Response<UserVO>;
        return response.data; // 从响应中提取 data 属性
    } catch (error) {
        console.error('创建用户信息出错:', error); // 错误处理
        throw error; // 重新抛出错误以便调用者处理
    }
};
// 删除用户
export const deleteUserApi = async (id: string): Promise<void> => {
    try {
        await request.post(`${baseUrl}/delete/${id}`);
    } catch (error) {
        console.error('删除用户信息出错:', error); // 错误处理
        throw error; // 重新抛出错误以便调用者处理
    }
};