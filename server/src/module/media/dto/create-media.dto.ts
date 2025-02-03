import {
  IsDefined,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt, // 添加 IsNotEmpty 导入
} from 'class-validator'; // 移除未使用的 IsInt, IsDate, IsOptional 导入

export class CreateMediaDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  path!: string;

  @IsOptional()
  @IsString()
  descript?: string;

  @IsOptional()
  @IsInt()
  type?: number;
}
