export interface Comment {
  id: string;
  username: string;
  avatarUrl: string;
  content: string;
  timestamp: number;
  createdAt: string;
  images?: string[]; // 添加图片数组字段
} 