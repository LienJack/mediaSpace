import request from './base';
import { Comment } from './models/comment';
const baseUrl = '/v1/comment';

export const getCommentList = async (id: string): Promise<{ list: Comment[] }> => {
    try {
        const response = await request.get(`${baseUrl}/media/${id}`);
        return response.data; // 从响应中提取 data 属性
    } catch (error) {
        console.error('获取评论列表时出错:', error); // 错误处理
        throw error; // 重新抛出错误以便调用者处理
    }
}
