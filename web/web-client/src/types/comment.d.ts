export interface Comment {
  id: string;
  timestamp: number; // 视频时间戳(秒)
  avatarUrl?: string;
  username: string;
  content: string;
  createdAt: string;
} 