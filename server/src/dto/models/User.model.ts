import { IsInt, IsDefined, IsString, IsDate, IsOptional } from "class-validator";
import { Comment } from "./";

export class User {
    @IsDefined()
    @IsInt()
    id!: number;

    @IsDefined()
    @IsString()
    name!: string;

    @IsDefined()
    @IsString()
    account!: string;

    @IsDefined()
    @IsString()
    avatarUrl!: string;

    @IsDefined()
    @IsDate()
    createdAt!: Date;

    @IsOptional()
    @IsDate()
    deletedAt?: Date;

    @IsOptional()
    @IsDate()
    updatedAt?: Date;

    @IsDefined()
    comment!: Comment[];
}
