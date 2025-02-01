import {
  IsInt,
  IsDefined,
  IsString,
  IsArray,
  IsNotEmpty,
} from 'class-validator';

export class CreateCommentDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  mediaId!: string;

  @IsArray()
  @IsDefined()
  imageUrls: string[] = [];

  @IsDefined()
  @IsInt()
  @IsNotEmpty()
  timestamp!: number;
}
