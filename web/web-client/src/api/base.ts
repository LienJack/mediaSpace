import axios from 'axios';
const baseUrl = 'http://127.0.0.1:4523/m1/5807700-5492742-default';

// 创建一个 Axios 实例
const instance = axios.create({
    baseURL: baseUrl, // 替换为你的 API 基础 URL
    timeout: 10000, // 请求超时时间
    headers: {
        'Content-Type': 'application/json',
    },
});

// 添加响应拦截器
instance.interceptors.response.use(
    response => {
        const { code, msg, data } = response.data; // 解构返回的数据
        if (code === 200) {
            return data; // 返回数据
        } else {
            // 使用 Alert 组件提示错误信息
            // 这里需要在组件中处理 Alert 的显示
            // 你可以将 msg 存储在状态中，然后在组件中渲染 Alert
            console.error(msg); // 也可以选择在控制台输出错误信息
            return Promise.reject(msg); // 返回一个拒绝的 Promise
        }
    },
    error => {
        // 处理请求错误
        console.error('请求错误:', error);
        return Promise.reject(error);
    }
);

// 导出 Axios 实例
export default instance;
