import { IsInt, IsDefined, IsString, IsOptional, IsDate } from "class-validator";
import { Comment } from "./";

export class Media {
    @IsDefined()
    @IsInt()
    id!: number;

    @IsDefined()
    @IsString()
    name!: string;

    @IsDefined()
    @IsString()
    path!: string;

    @IsOptional()
    @IsString()
    descript?: string;

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
    comment!: Comment[];
}
