import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, Prisma } from '@/prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: createUserDto,
    });
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.user
      .findFirstOrThrow({
        where: { id, deletedAt: null },
      })
      .then((res) => {
        return {
          ...res,
          id: res.id.toString(),
        };
      });
  }

  update(id: number, updateUserDto: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number) {
    await this.prisma.user.delete({
      where: { id },
    });
    return { message: `用户 #${id} 已成功删除` };
  }
}
