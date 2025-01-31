/**
 * ApifoxModel
 */
export interface CommentReq<T> {
    code: number;
    msg: string;
    data: T;
}
export interface CommentRes {
    /**
     * 评论
     */
    content: string;
    /**
     * 创建时间
     */
    createdAt: string;
    /**
     * 删除时间
     */
    deletedAt: string;
    /**
     * ID
     */
    id: string;
    imageUrls: string[];
    /**
     * 是否被编辑
     */
    isEdited: boolean;
    /**
     * 媒体的id
     */
    mediaId: string;
    /**
     * 视频时间戳
     */
    timestamp?: number;
    /**
     * 更新时间
     */
    updatedAt: string;
    user: User;
    [property: string]: any;
}

/**
 * User
 */
export interface User {
    /**
     * 头像地址
     */
    avatarUrl: string;
    /**
     * 创建时间
     */
    createdAt: string;
    /**
     * 删除
     */
    deletedAt: string;
    /**
     * ID
     */
    id: number;
    /**
     * name
     */
    name: string;
    /**
     * 更新时间
     */
    updatedAt: string;
    [property: string]: any;
}