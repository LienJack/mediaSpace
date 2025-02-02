
import request from './base';
import { User } from './models/user';
const baseUrl = '/v1/user';

export const getUserInfo = async (id: string): Promise<User> => {
    try {
        const response = await request.get(`${baseUrl}/${id}`);
        return response.data; // 从响应中提取 data 属性
    } catch (error) {
        console.error('获取用户信息出错:', error); // 错误处理
        throw error; // 重新抛出错误以便调用者处理
    }
}
