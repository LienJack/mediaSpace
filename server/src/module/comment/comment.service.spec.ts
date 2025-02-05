import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

describe('CommentService', () => {
  let service: CommentService;
  let prismaService: PrismaService;

  const mockComment = {
    id: 1,
    content: '测试评论',
    imageUrls: 'url1,url2',
    timestamp: new Date(),
    userId: 1,
    mediaId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    isEdited: false,
  };

  const mockPrismaService = {
    comment: {
      create: jest.fn(),
      findFirstOrThrow: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createCommentDto: CreateCommentDto = {
      content: '测试评论',
      imageUrls: ['url1', 'url2'],
      timestamp: 1,
      userId: 1,
      mediaId: 1,
    };

    it('应该成功创建评论', async () => {
      mockPrismaService.comment.create.mockResolvedValue(mockComment);
      const result = await service.create(createCommentDto);
      expect(result).toEqual({
        ...mockComment,
        imageUrls: ['url1', 'url2'],
      });
    });

    it('创建评论失败时应该抛出异常', async () => {
      const error = new PrismaClientKnownRequestError('创建失败', {
        code: 'P2002',
        clientVersion: '2.0.0',
      });
      mockPrismaService.comment.create.mockRejectedValue(error);
      await expect(service.create(createCommentDto)).rejects.toThrow();
    });
  });

  describe('findOne', () => {
    it('应该返回指定ID的评论', async () => {
      mockPrismaService.comment.findFirstOrThrow.mockResolvedValue(mockComment);
      const result = await service.findOne(1);
      expect(result).toEqual({
        ...mockComment,
        imageUrls: ['url1', 'url2'],
      });
    });

    it('评论不存在时应该抛出NotFoundException', async () => {
      const error = new PrismaClientKnownRequestError('评论不存在', {
        code: 'P2025',
        clientVersion: '2.0.0',
      });
      mockPrismaService.comment.findFirstOrThrow.mockRejectedValue(error);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateCommentDto: UpdateCommentDto = {
      content: '更新后的评论',
    };

    it('应该成功更新评论', async () => {
      mockPrismaService.comment.update.mockResolvedValue({
        ...mockComment,
        content: '更新后的评论',
      });
      const result = await service.update(1, updateCommentDto);
      expect(result).toEqual({
        ...mockComment,
        content: '更新后的评论',
        imageUrls: ['url1', 'url2'],
      });
    });

    it('更新不存在的评论时应该抛出NotFoundException', async () => {
      const error = new PrismaClientKnownRequestError('评论不存在', {
        code: 'P2025',
        clientVersion: '2.0.0',
      });
      mockPrismaService.comment.update.mockRejectedValue(error);
      await expect(service.update(999, updateCommentDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('应该成功软删除评论', async () => {
      const now = new Date();
      mockPrismaService.comment.update.mockResolvedValue({
        ...mockComment,
        deletedAt: now,
      });
      const result = await service.remove(1);
      expect(result).toEqual({ message: '评论 #1 已成功删除' });
    });

    it('删除不存在的评论时应该抛出NotFoundException', async () => {
      const error = new PrismaClientKnownRequestError('评论不存在', {
        code: 'P2025',
        clientVersion: '2.0.0',
      });
      mockPrismaService.comment.update.mockRejectedValue(error);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByMediaId', () => {
    it('应该返回指定媒体ID的评论列表', async () => {
      mockPrismaService.comment.findMany.mockResolvedValue([mockComment]);
      const result = await service.findByMediaId(1);
      expect(result).toEqual({
        list: [
          {
            ...mockComment,
            imageUrls: ['url1', 'url2'],
          },
        ],
      });
    });

    it('查询失败时应该抛出异常', async () => {
      const error = new PrismaClientKnownRequestError('查询失败', {
        code: 'P2002',
        clientVersion: '2.0.0',
      });
      mockPrismaService.comment.findMany.mockRejectedValue(error);
      await expect(service.findByMediaId(1)).rejects.toThrow();
    });
  });
});
