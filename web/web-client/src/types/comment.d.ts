import { User } from "./user.d";
export interface Comment {
  id?: string;
  mediaId: string;
  user: User;
  timestamp: number; // 视频时间戳(秒)
  avatarUrl?: string;
  username: string;
  content: string;
  isEdited?: boolean;
  imageUrls: string[];
} 