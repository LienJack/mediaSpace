import {
  IsInt,
  IsDefined,
  IsString,
  IsArray,
  IsNotEmpty,
  isNumber,
} from 'class-validator';

export class CreateCommentDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsDefined()
  @IsInt()
  @IsNotEmpty()
  userId!: number;

  @IsDefined()
  @IsInt()
  @IsNotEmpty()
  mediaId!: number;

  @IsArray()
  @IsDefined()
  imageUrls: string[] = [];

  @IsDefined()
  @IsInt()
  @IsNotEmpty()
  timestamp!: number;
}
