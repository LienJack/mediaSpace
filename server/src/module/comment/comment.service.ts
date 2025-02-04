import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 将字符串数组转换为逗号分隔的字符串
   * @param urls 图片URL数组
   * @returns 逗号分隔的字符串
   */
  private convertUrlsToString(urls: string[]): string {
    return urls.filter((url) => !!url).join(',');
  }

  /**
   * 将逗号分隔的字符串转换为字符串数组
   * @param urlString 逗号分隔的URL字符串
   * @returns 图片URL数组
   */
  private convertStringToUrls(urlString: string): string[] {
    return urlString.split(',').filter((url) => !!url);
  }

  /**
   * 创建新的评论
   * @param createCommentDto 评论创建DTO
   * @returns 创建的评论信息
   * @throws 如果创建失败抛出异常
   */
  async create(createCommentDto: CreateCommentDto) {
    try {
      const newVal: Prisma.CommentCreateInput = {
        content: createCommentDto.content,
        imageUrls: this.convertUrlsToString(createCommentDto.imageUrls),
        timestamp: createCommentDto.timestamp,
        user: { connect: { id: createCommentDto.userId } },
        media: { connect: { id: createCommentDto.mediaId } },
      };

      const comment = await this.prisma.comment.create({
        data: newVal,
        include: {
          user: true,
        },
      });

      return {
        ...comment,
        imageUrls: this.convertStringToUrls(comment.imageUrls),
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new Error(`创建评论失败: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 根据ID获取单个评论
   * @param id 评论ID
   * @returns 评论信息
   * @throws 如果评论不存在或查询失败抛出异常
   */
  async findOne(id: number) {
    try {
      const comment = await this.prisma.comment.findFirstOrThrow({
        where: { id, deletedAt: null },
        include: {
          user: true,
        },
      });

      return {
        ...comment,
        imageUrls: this.convertStringToUrls(comment.imageUrls),
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`评论 #${id} 不存在`);
        }
        throw new Error(`获取评论失败: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 更新评论信息
   * @param id 评论ID
   * @param updateCommentDto 评论更新数据
   * @returns 更新后的评论信息
   * @throws 如果更新失败抛出异常
   */
  async update(id: number, updateCommentDto: UpdateCommentDto) {
    try {
      const newVal: Prisma.CommentUpdateInput = {
        content: updateCommentDto.content,
        imageUrls: updateCommentDto.imageUrls
          ? this.convertUrlsToString(updateCommentDto.imageUrls)
          : undefined,
        timestamp: updateCommentDto.timestamp,
        user: updateCommentDto.userId
          ? { connect: { id: updateCommentDto.userId } }
          : undefined,
        media: updateCommentDto.mediaId
          ? { connect: { id: updateCommentDto.mediaId } }
          : undefined,
        isEdited: true,
      };

      const comment = await this.prisma.comment.update({
        where: { id },
        data: newVal,
        include: {
          user: true,
        },
      });

      return {
        ...comment,
        imageUrls: this.convertStringToUrls(comment.imageUrls),
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`评论 #${id} 不存在`);
        }
        throw new Error(`更新评论失败: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 软删除评论
   * @param id 评论ID
   * @returns 删除成功信息
   * @throws 如果删除失败抛出异常
   */
  async remove(id: number) {
    try {
      await this.prisma.comment.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return { message: `评论 #${id} 已成功删除` };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`评论 #${id} 不存在`);
        }
        throw new Error(`删除评论失败: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 根据媒体ID获取评论列表
   * @param mediaId 媒体ID
   * @returns 评论列表
   * @throws 如果查询失败抛出异常
   */
  async findByMediaId(mediaId: number) {
    try {
      const comments = await this.prisma.comment.findMany({
        where: {
          mediaId,
          deletedAt: null,
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        list: comments.map((comment) => ({
          ...comment,
          imageUrls: this.convertStringToUrls(comment.imageUrls),
        })),
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new Error(`获取评论列表失败: ${error.message}`);
      }
      throw error;
    }
  }
}
