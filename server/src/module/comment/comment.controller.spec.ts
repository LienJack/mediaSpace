import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { NotFoundException } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

describe('CommentController', () => {
  let controller: CommentController;
  let commentService: CommentService;

  const mockComment = {
    id: 1,
    content: '测试评论',
    imageUrls: ['url1', 'url2'],
    timestamp: new Date(),
    userId: 1,
    mediaId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    isEdited: false,
  };

  const mockCommentService = {
    create: jest.fn(),
    findByMediaId: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        {
          provide: CommentService,
          useValue: mockCommentService,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    controller = module.get<CommentController>(CommentController);
    commentService = module.get<CommentService>(CommentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createCommentDto: CreateCommentDto = {
      content: '测试评论',
      imageUrls: ['url1', 'url2'],
      timestamp: 0,
      userId: 1,
      mediaId: 1,
    };

    it('应该成功创建评论', async () => {
      mockCommentService.create.mockResolvedValue(mockComment);
      const result = await controller.create(createCommentDto);
      expect(result).toEqual(mockComment);
      expect(mockCommentService.create).toHaveBeenCalledWith(createCommentDto);
    });

    it('创建失败时应该抛出异常', async () => {
      mockCommentService.create.mockRejectedValue(new Error('创建失败'));
      await expect(controller.create(createCommentDto)).rejects.toThrow('创建失败');
    });
  });

  describe('findByMediaId', () => {
    it('应该返回指定媒体ID的评论列表', async () => {
      mockCommentService.findByMediaId.mockResolvedValue({ list: [mockComment] });
      const result = await controller.findAll('1');
      expect(result).toEqual({ list: [mockComment] });
      expect(mockCommentService.findByMediaId).toHaveBeenCalledWith(1);
    });

    it('查询失败时应该抛出异常', async () => {
      mockCommentService.findByMediaId.mockRejectedValue(new Error('查询失败'));
      await expect(controller.findAll('1')).rejects.toThrow('查询失败');
    });
  });

  describe('findOne', () => {
    it('应该返回指定ID的评论', async () => {
      mockCommentService.findOne.mockResolvedValue(mockComment);
      const result = await controller.findOne('1');
      expect(result).toEqual(mockComment);
      expect(mockCommentService.findOne).toHaveBeenCalledWith(1);
    });

    it('评论不存在时应该抛出NotFoundException', async () => {
      mockCommentService.findOne.mockRejectedValue(new NotFoundException());
      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateCommentDto: UpdateCommentDto = {
      content: '更新后的评论',
    };

    it('应该成功更新评论', async () => {
      mockCommentService.update.mockResolvedValue({
        ...mockComment,
        content: '更新后的评论',
      });
      const result = await controller.update('1', updateCommentDto);
      expect(result).toEqual({
        ...mockComment,
        content: '更新后的评论',
      });
      expect(mockCommentService.update).toHaveBeenCalledWith(1, updateCommentDto);
    });

    it('更新不存在的评论时应该抛出NotFoundException', async () => {
      mockCommentService.update.mockRejectedValue(new NotFoundException());
      await expect(controller.update('999', updateCommentDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('应该成功删除评论', async () => {
      const deleteMessage = { message: '评论 #1 已成功删除' };
      mockCommentService.remove.mockResolvedValue(deleteMessage);
      const result = await controller.remove('1');
      expect(result).toEqual(deleteMessage);
      expect(mockCommentService.remove).toHaveBeenCalledWith(1);
    });

    it('删除不存在的评论时应该抛出NotFoundException', async () => {
      mockCommentService.remove.mockRejectedValue(new NotFoundException());
      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
}); 