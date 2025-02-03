import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@/prisma/client';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCommentDto: CreateCommentDto) {
    try {
      const imageUrls = createCommentDto.imageUrls.join(',');
      const userId = createCommentDto.userId;
      const mediaId = createCommentDto.mediaId;
      const newVal: Prisma.CommentCreateInput = {
        content: createCommentDto.content,
        imageUrls: imageUrls,
        timestamp: createCommentDto.timestamp,
        user: { connect: { id: userId } },
        media: { connect: { id: mediaId } },
      };
      const res = await this.prisma.comment.create({
        data: newVal,
      });
      return res;
    } catch (error) {
      throw new Error('发生错误：' + error);
    }
  }
  async findOne(id: number) {
    const comment = await this.prisma.comment.findFirstOrThrow({
      where: { id, deletedAt: null },
    });
    const val = {
      ...comment,
      imageUrls: [...comment.imageUrls.split(',')].filter((item) => !!item),
    };
    return val;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    // 检查 imageUrls 是否存在并进行处理
    const imageUrls = updateCommentDto.imageUrls
      ? updateCommentDto.imageUrls.join(',')
      : '';
    // 解析用户ID和媒体ID
    const userId = updateCommentDto.userId;

    const mediaId = updateCommentDto.mediaId;

    // 创建更新数据对象
    const newVal: Prisma.CommentUpdateInput = {
      ...updateCommentDto,
      imageUrls: imageUrls,
      user: userId ? { connect: { id: userId } } : undefined,
      media: mediaId ? { connect: { id: mediaId } } : undefined,
    };

    // 执行更新操作
    return this.prisma.comment.update({
      where: { id },
      data: newVal,
    });
  }

  async remove(id: number) {
    return await this.prisma.comment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findByMediaId(mediaId: number) {
    const list = await this.prisma.comment.findMany({
      where: {
        mediaId: mediaId,
        deletedAt: null,
      },
      include: {
        user: true,
      },
    });
    const val = list.map((item) => {
      return {
        ...item,
        imageUrls: [...item.imageUrls.split(',')].filter((item) => !!item),
      };
    });
    return {
      list: val,
    };
  }
}
