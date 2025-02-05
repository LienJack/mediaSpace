import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUser: User = {
    id: 1,
    name: '测试用户',
    account: 'test_account',
    avatarUrl: 'https://example.com/avatar.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      name: '测试用户',
      account: 'test_account',
      avatarUrl: 'https://example.com/avatar.jpg',
    };

    it('应该成功创建用户', async () => {
      mockUserService.create.mockResolvedValue(mockUser);
      const result = await controller.create(createUserDto);
      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });

    it('创建失败时应该抛出异常', async () => {
      mockUserService.create.mockRejectedValue(new Error('创建失败'));
      await expect(controller.create(createUserDto)).rejects.toThrow('创建失败');
    });
  });

  describe('findAll', () => {
    it('应该返回用户列表', async () => {
      mockUserService.findAll.mockResolvedValue([mockUser]);
      const result = await controller.findAll();
      expect(mockUserService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });

    it('查询失败时应该抛出异常', async () => {
      mockUserService.findAll.mockRejectedValue(new Error('查询失败'));
      await expect(controller.findAll()).rejects.toThrow('查询失败');
    });
  });

  describe('findOne', () => {
    it('应该返回指定ID的用户', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      const result = await controller.findOne('1');
      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('用户不存在时应该抛出NotFoundException', async () => {
      mockUserService.findOne.mockRejectedValue(new NotFoundException());
      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('应该成功删除用户', async () => {
      const deleteMessage = { message: '用户已成功删除' };
      mockUserService.remove.mockResolvedValue(deleteMessage);
      const result = await controller.remove('1');
      expect(mockUserService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(deleteMessage);
    });

    it('删除不存在的用户时应该抛出NotFoundException', async () => {
      mockUserService.remove.mockRejectedValue(new NotFoundException());
      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
