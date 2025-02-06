import { IsString, IsOptional, IsEmail } from 'class-validator';

/**
 * 更新用户DTO
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  // 其他需要更新的字段...
}
