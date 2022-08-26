import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class SearchDto {
    @ApiProperty({ example: "q" })
    @IsString()
    public query: string;
}