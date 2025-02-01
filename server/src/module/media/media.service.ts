import { Injectable } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { Media } from 'prisma';
import { Prisma } from '@prisma/client';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  create(createMediaDto: CreateMediaDto) {
    const value: Prisma.MediaCreateInput = {
      ...createMediaDto,
    };
    return this.prisma.media.create({
      data: value,
    });
  }

  async findAll(): Promise<Media[]> {
    return await this.prisma.media.findMany();
  }

  async findOne(id: number): Promise<Media> {
    return await this.prisma.media.findFirstOrThrow({
      where: { id },
    });
  }

  async update(id: number, updateMediaDto: UpdateMediaDto) {
    return this.prisma.media.update({
      where: { id },
      data: updateMediaDto,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} media`;
  }
}
