

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
export interface FsListReq {
    /**
     * 页数
     */
    page?: number;
    /**
     * 密码
     */
    password?: string;
    /**
     * 路径
     */
    path?: string;
    /**
     * 每页数目
     */
    per_page?: number;
    /**
     * 是否强制刷新
     */
    refresh?: boolean;
}
export interface FsListRes {
    /**
     * 内容
     */
    content: ContentVO[];
    header: string;
    provider: string;
    /**
     * 说明
     */
    readme: string;
    /**
     * 总数
     */
    total: number;
    /**
     * 是否可写入
     */
    write: boolean;
}

export interface ContentVO {
    /**
     * 创建时间
     */
    created?: string;
    hash_info?: null;
    hashinfo?: string;
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
    type: FileType;
}

export enum FileType {
    Default = 0,
    DIR = 1,
    VIDEO = 2,
    IMAGE = 5,
}