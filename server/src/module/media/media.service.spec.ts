import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from './media.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NotFoundException } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

describe('MediaService', () => {
  let service: MediaService;
  let prismaService: PrismaService;

  const mockMedia = {
    id: 1,
    title: '测试媒体',
    description: '测试描述',
    url: 'http://test.com',
    type: 'image',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockPrismaService = {
    media: {
      create: jest.fn(),
      findFirstOrThrow: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createMediaDto: CreateMediaDto = {
      name: '测试媒体',
      path: 'http://test.com',
      descript: '1111',
      type: 1,
    };

    it('应该成功创建媒体资源', async () => {
      mockPrismaService.media.create.mockResolvedValue(mockMedia);
      const result = await service.create(createMediaDto);
      expect(result).toEqual(mockMedia);
    });

    it('创建媒体资源失败时应该抛出异常', async () => {
      const error = new PrismaClientKnownRequestError('创建失败', {
        code: 'P2002',
        clientVersion: '2.0.0',
      });
      mockPrismaService.media.create.mockRejectedValue(error);
      await expect(service.create(createMediaDto)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('应该返回所有未删除的媒体资源', async () => {
      mockPrismaService.media.findMany.mockResolvedValue([mockMedia]);
      const result = await service.findAll();
      expect(result).toEqual([mockMedia]);
    });

    it('查询媒体资源列表失败时应该抛出异常', async () => {
      const error = new PrismaClientKnownRequestError('查询失败', {
        code: 'P2002',
        clientVersion: '2.0.0',
      });
      mockPrismaService.media.findMany.mockRejectedValue(error);
      await expect(service.findAll()).rejects.toThrow();
    });
  });

  describe('findOne', () => {
    it('应该返回指定ID的媒体资源', async () => {
      mockPrismaService.media.findFirstOrThrow.mockResolvedValue(mockMedia);
      const result = await service.findOne(1);
      expect(result).toEqual(mockMedia);
    });

    it('媒体资源不存在时应该抛出NotFoundException', async () => {
      const error = new PrismaClientKnownRequestError('媒体不存在', {
        code: 'P2025',
        clientVersion: '2.0.0',
      });
      mockPrismaService.media.findFirstOrThrow.mockRejectedValue(error);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateMediaDto: UpdateMediaDto = {
      name: '更新后的标题',
    };

    it('应该成功更新媒体资源', async () => {
      mockPrismaService.media.update.mockResolvedValue({
        ...mockMedia,
        title: '更新后的标题',
      });
      const result = await service.update(1, updateMediaDto);
      expect(result).toEqual({
        ...mockMedia,
        title: '更新后的标题',
      });
    });

    it('更新不存在的媒体资源时应该抛出NotFoundException', async () => {
      const error = new PrismaClientKnownRequestError('媒体不存在', {
        code: 'P2025',
        clientVersion: '2.0.0',
      });
      mockPrismaService.media.update.mockRejectedValue(error);
      await expect(service.update(999, updateMediaDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('应该成功软删除媒体资源', async () => {
      const now = new Date();
      mockPrismaService.media.update.mockResolvedValue({
        ...mockMedia,
        deletedAt: now,
      });
      const result = await service.remove(1);
      expect(result).toEqual({ message: '媒体资源 #1 已成功删除' });
    });

    it('删除不存在的媒体资源时应该抛出NotFoundException', async () => {
      const error = new PrismaClientKnownRequestError('媒体不存在', {
        code: 'P2025',
        clientVersion: '2.0.0',
      });
      mockPrismaService.media.update.mockRejectedValue(error);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
