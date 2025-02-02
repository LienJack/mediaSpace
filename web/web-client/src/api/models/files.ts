export interface Response<T> {
    /**
     * 状态码
     */
    code: number;
    data: T;
    /**
     * 信息
     */
    message: string;
}

export interface FsGetRes {
    /**
     * 创建时间
     */
    created: string;
    hash_info: null;
    hashinfo: string;
    header: string;
    /**
     * 是否是文件夹
     */
    is_dir: boolean;
    /**
     * 修改时间
     */
    modified: string;
    /**
     * 文件名
     */
    name: string;
    provider: string;
    /**
     * 原始url
     */
    raw_url: string;
    /**
     * 说明
     */
    readme: string;
    related: null;
    /**
     * 签名
     */
    sign: string;
    /**
     * 大小
     */
    size: number;
    /**
     * 缩略图
     */
    thumb: string;
    /**
     * 类型
     */
    type: number;
}