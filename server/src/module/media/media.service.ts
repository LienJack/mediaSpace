import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Media } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建新的媒体资源
   * @param createMediaDto 媒体创建DTO
   * @returns 创建的媒体信息
   * @throws 如果创建失败抛出异常
   */
  async create(createMediaDto: CreateMediaDto): Promise<Media> {
    try {
      const mediaData: Prisma.MediaCreateInput = {
        ...createMediaDto,
      };
      return await this.prisma.media.create({
        data: mediaData,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new Error(`创建媒体资源失败: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 获取所有未删除的媒体资源
   * @returns 媒体资源列表
   * @throws 如果查询失败抛出异常
   */
  async findAll(): Promise<Media[]> {
    try {
      return await this.prisma.media.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new Error(`获取媒体资源列表失败: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 根据ID获取单个媒体资源
   * @param id 媒体ID
   * @returns 媒体资源信息
   * @throws 如果媒体不存在或查询失败抛出异常
   */
  async findOne(id: number): Promise<Media> {
    try {
      return await this.prisma.media.findFirstOrThrow({
        where: { id, deletedAt: null },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`媒体资源 #${id} 不存在`);
        }
        throw new Error(`获取媒体资源信息失败: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 更新媒体资源信息
   * @param id 媒体ID
   * @param updateMediaDto 媒体更新数据
   * @returns 更新后的媒体信息
   * @throws 如果更新失败抛出异常
   */
  async update(id: number, updateMediaDto: UpdateMediaDto): Promise<Media> {
    try {
      return await this.prisma.media.update({
        where: { id },
        data: updateMediaDto,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`媒体资源 #${id} 不存在`);
        }
        throw new Error(`更新媒体资源信息失败: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 删除媒体资源（软删除）
   * @param id 媒体ID
   * @returns 删除成功信息
   * @throws 如果删除失败抛出异常
   */
  async remove(id: number): Promise<{ message: string }> {
    try {
      await this.prisma.media.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return { message: `媒体资源 #${id} 已成功删除` };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`媒体资源 #${id} 不存在`);
        }
        throw new Error(`删除媒体资源失败: ${error.message}`);
      }
      throw error;
    }
  }
}
