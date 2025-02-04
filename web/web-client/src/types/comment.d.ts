export interface Comment {
  id?: number;
  mediaId: number;
  userId: number;
  timestamp: number; // 视频时间戳(秒)
  avatarUrl?: string;
  username: string;
  content: string;
  isEdited?: boolean;
  imageUrls: string[];
} 