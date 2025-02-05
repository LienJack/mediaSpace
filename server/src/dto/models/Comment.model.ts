import { IsInt, IsDefined, IsString, IsBoolean, IsDate, IsOptional } from "class-validator";
import { Media, User } from "./";

export class Comment {
    @IsDefined()
    @IsInt()
    id!: number;

    @IsDefined()
    @IsString()
    content!: string;

    @IsDefined()
    @IsInt()
    userId!: number;

    @IsDefined()
    @IsInt()
    mediaId!: number;

    @IsDefined()
    @IsBoolean()
    isEdited!: boolean;

    @IsDefined()
    @IsString()
    imageUrls!: string;

    @IsDefined()
    timestamp!: number;

    @IsDefined()
    @IsDate()
    createdAt!: Date;

    @IsOptional()
    @IsDate()
    updatedAt?: Date;

    @IsOptional()
    @IsDate()
    deletedAt?: Date;

    @IsDefined()
    media!: Media;

    @IsDefined()
    user!: User;
}
