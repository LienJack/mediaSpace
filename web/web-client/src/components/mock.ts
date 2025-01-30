import { Comment } from '@/types/comment';

export const mockComments: Comment[] = [
  {
    id: '1',
    timestamp: 4, // 对应 00:04
    avatarUrl: 'https://mui.com/static/images/avatar/1.jpg',
    username: '路人甲',
    content: '这里字幕内容不对',
    createdAt: '2024-03-14T17:51:00Z',
    images: [
      'https://picsum.photos/400/300',
      'https://picsum.photos/400/301',
      'https://picsum.photos/400/302'
    ],
    viewCount: 0,
    replyCount: 0
  },
  {
    id: '6',
    timestamp: 4, // 对应 00:04
    avatarUrl: 'https://mui.com/static/images/avatar/1.jpg',
    username: '路人丙',
    content: '同意楼上的说法',
    createdAt: '2024-03-14T17:51:30Z',
    images: [
      'https://picsum.photos/400/303',
      'https://picsum.photos/400/304'
    ],
    viewCount: 1,
    replyCount: 0
  },
  {
    id: '2',
    timestamp: 40, // 对应 00:40
    avatarUrl: 'https://mui.com/static/images/avatar/2.jpg',
    username: '路人乙',
    content: '这里不错',
    createdAt: '2024-03-14T17:52:00Z',
    images: [],
    viewCount: 2,
    replyCount: 1
  },
  {
    id: '3',
    timestamp: 125, // 对应 02:05
    avatarUrl: 'https://mui.com/static/images/avatar/3.jpg',
    username: '审核员A',
    content: '这段需要重新配音',
    createdAt: '2024-03-14T18:00:00Z',
    images: [],
    viewCount: 5,
    replyCount: 2
  },
  {
    id: '4',
    timestamp: 180, // 对应 03:00
    avatarUrl: 'https://mui.com/static/images/avatar/4.jpg',
    username: '制作人',
    content: '这里的转场效果需要优化',
    createdAt: '2024-03-14T18:15:00Z',
    images: [],
    viewCount: 3,
    replyCount: 0
  },
  {
    id: '5',
    timestamp: 245, // 对应 04:05
    avatarUrl: 'https://mui.com/static/images/avatar/5.jpg',
    username: '后期总监',
    content: '音量过大，需要调整',
    createdAt: '2024-03-14T18:30:00Z',
    images: [],
    viewCount: 8,
    replyCount: 3
  }
];

