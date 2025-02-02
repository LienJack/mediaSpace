export interface Comment {
  id: number;
  content: string;
  timestamp: number;
  username: string;
  createdAt: string;
  avatarUrl?: string;
  images?: string[];
} 