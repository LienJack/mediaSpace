import { Prisma } from '@prisma/client';
import {
  IsDefined,
  IsString,
  IsNotEmpty,
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
  @IsNotEmpty()
  avatarUrl!: string;
}
