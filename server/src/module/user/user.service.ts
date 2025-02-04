import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
// import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建新用户
   * @param createUserDto 用户创建DTO
   * @returns 创建的用户信息
   * @throws 如果创建失败抛出异常
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: createUserDto,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new Error(`创建用户失败: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 获取所有未删除用户
   * @returns 用户列表
   * @throws 如果查询失败抛出异常
   */
  async findAll(): Promise<User[]> {
    try {
      return await this.prisma.user.findMany({
        where: {
          deletedAt: null,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new Error(`获取用户列表失败: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 根据ID获取单个用户
   * @param id 用户ID
   * @returns 用户信息
   * @throws 如果用户不存在或查询失败抛出异常
   */
  async findOne(id: number): Promise<User> {
    try {
      const user = await this.prisma.user.findFirstOrThrow({
        where: { id, deletedAt: null },
      });

      // 返回原始用户对象，不修改id类型
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`用户 #${id} 不存在`);
        }
        throw new Error(`获取用户信息失败: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 更新用户信息
   * @param id 用户ID
   * @param updateUserDto 用户更新数据
   * @returns 更新后的用户信息
   * @throws 如果更新失败抛出异常
   */
  async update(
    id: number,
    updateUserDto: Prisma.UserUpdateInput,
  ): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`用户 #${id} 不存在`);
        }
        throw new Error(`更新用户信息失败: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 删除用户（软删除）
   * @param id 用户ID
   * @returns 删除成功信息
   * @throws 如果删除失败抛出异常
   */
  async remove(id: number): Promise<{ message: string }> {
    try {
      // 改为软删除
      await this.prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return { message: `用户 #${id} 已成功删除` };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`用户 #${id} 不存在`);
        }
        throw new Error(`删除用户失败: ${error.message}`);
      }
      throw error;
    }
  }
}
