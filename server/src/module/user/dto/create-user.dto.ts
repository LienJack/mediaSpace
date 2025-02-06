import { Prisma } from '@prisma/client';
import {
  IsDefined,
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateUserDto implements Prisma.UserCreateInput {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  account!: string;

  @IsDefined()
  @IsString()
  @IsOptional()
  avatarUrl!: string;
}
