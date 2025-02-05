import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { NotFoundException } from '@nestjs/common';

describe('MediaController', () => {
  let controller: MediaController;
  let mediaService: MediaService;

  const mockMedia = {
    id: 1,
    name: '测试媒体',
    path: 'http://test.com',
    descript: '测试描述',
    type: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockMediaService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        {
          provide: MediaService,
          useValue: mockMediaService,
        },
      ],
    }).compile();

    controller = module.get<MediaController>(MediaController);
    mediaService = module.get<MediaService>(MediaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('应该正确初始化', () => {
    expect(controller).toBeDefined();
    expect(mediaService).toBeDefined();
  });

  describe('create', () => {
    const createMediaDto: CreateMediaDto = {
      name: '测试媒体',
      path: 'http://test.com',
      descript: '测试描述',
      type: 1,
    };

    it('应该成功创建媒体资源', async () => {
      mockMediaService.create.mockResolvedValue(mockMedia);
      const result = await controller.create(createMediaDto);
      expect(mockMediaService.create).toHaveBeenCalledWith(createMediaDto);
      expect(result).toEqual(mockMedia);
    });

    it('创建失败时应该抛出异常', async () => {
      mockMediaService.create.mockRejectedValue(new Error('创建失败'));
      await expect(controller.create(createMediaDto)).rejects.toThrow('创建失败');
    });
  });

  describe('findAll', () => {
    it('应该返回媒体资源列表', async () => {
      mockMediaService.findAll.mockResolvedValue([mockMedia]);
      const result = await controller.findAll();
      expect(mockMediaService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockMedia]);
    });

    it('查询失败时应该抛出异常', async () => {
      mockMediaService.findAll.mockRejectedValue(new Error('查询失败'));
      await expect(controller.findAll()).rejects.toThrow('查询失败');
    });
  });

  describe('findOne', () => {
    it('应该返回指定ID的媒体资源', async () => {
      mockMediaService.findOne.mockResolvedValue(mockMedia);
      const result = await controller.findOne('1');
      expect(mockMediaService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockMedia);
    });

    it('媒体资源不存在时应该抛出NotFoundException', async () => {
      mockMediaService.findOne.mockRejectedValue(new NotFoundException());
      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateMediaDto: UpdateMediaDto = {
      name: '更新后的标题',
    };

    it('应该成功更新媒体资源', async () => {
      mockMediaService.update.mockResolvedValue({
        ...mockMedia,
        name: '更新后的标题',
      });
      const result = await controller.update('1', updateMediaDto);
      expect(mockMediaService.update).toHaveBeenCalledWith(1, updateMediaDto);
      expect(result).toEqual({
        ...mockMedia,
        name: '更新后的标题',
      });
    });

    it('更新不存在的媒体资源时应该抛出NotFoundException', async () => {
      mockMediaService.update.mockRejectedValue(new NotFoundException());
      await expect(controller.update('999', updateMediaDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('应该成功删除媒体资源', async () => {
      const deleteMessage = { message: '媒体资源 #1 已成功删除' };
      mockMediaService.remove.mockResolvedValue(deleteMessage);
      const result = await controller.remove('1');
      expect(mockMediaService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(deleteMessage);
    });

    it('删除不存在的媒体资源时应该抛出NotFoundException', async () => {
      mockMediaService.remove.mockRejectedValue(new NotFoundException());
      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
}); 