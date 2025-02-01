export interface Comment {
  id?: string;
  content: string;
  timestamp: number;
  username: string;
  createdAt: string;
  avatarUrl?: string;
  images?: string[];
} 