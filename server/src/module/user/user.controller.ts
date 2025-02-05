import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';

/**
 * 用户控制器，处理用户相关的HTTP请求
 */
@Controller('v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 创建新用户
   * @param createUserDto 用户创建DTO
   * @returns 新创建的用户信息
   */
  @Post('create')
  @UsePipes(new ValidationPipe())
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  /**
   * 获取所有用户列表
   * @returns 用户列表
   */
  @Get('list')
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  /**
   * 根据ID获取单个用户
   * @param id 用户ID
   * @returns 用户信息
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(+id);
  }

  /**
   * 删除用户
   * @param id 用户ID
   * @returns 删除结果
   */
  @Post('delete/:id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.userService.remove(+id);
  }
}
