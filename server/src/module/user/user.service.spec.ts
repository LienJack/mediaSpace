import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  const mockUser: User = {
    id: 1,
    name: '测试用户',
    account: 'test_account',
    avatarUrl: 'https://example.com/avatar.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirstOrThrow: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
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
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      const result = await service.create(createUserDto);
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: createUserDto,
      });
    });

    it('创建用户失败时应该抛出异常', async () => {
      const error = new PrismaClientKnownRequestError('创建失败', {
        code: 'P2002',
        clientVersion: '2.0.0',
      });
      mockPrismaService.user.create.mockRejectedValue(error);
      await expect(service.create(createUserDto)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('应该返回所有未删除的用户列表', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);
      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
      });
    });

    it('查询失败时应该抛出异常', async () => {
      const error = new PrismaClientKnownRequestError('查询失败', {
        code: 'P2002',
        clientVersion: '2.0.0',
      });
      mockPrismaService.user.findMany.mockRejectedValue(error);
      await expect(service.findAll()).rejects.toThrow();
    });
  });

  describe('findOne', () => {
    it('应该返回指定ID的用户', async () => {
      mockPrismaService.user.findFirstOrThrow.mockResolvedValue(mockUser);
      const result = await service.findOne(1);
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findFirstOrThrow).toHaveBeenCalledWith({
        where: { id: 1, deletedAt: null },
      });
    });

    it('用户不存在时应该抛出NotFoundException', async () => {
      const error = new PrismaClientKnownRequestError('用户不存在', {
        code: 'P2025',
        clientVersion: '2.0.0',
      });
      mockPrismaService.user.findFirstOrThrow.mockRejectedValue(error);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('应该成功软删除用户', async () => {
      const now = new Date();
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        deletedAt: now,
      });

      const result = await service.remove(1);
      expect(result).toEqual({ message: '用户 #1 已成功删除' });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('删除不存在的用户时应该抛出NotFoundException', async () => {
      const error = new PrismaClientKnownRequestError('用户不存在', {
        code: 'P2025',
        clientVersion: '2.0.0',
      });
      mockPrismaService.user.update.mockRejectedValue(error);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
