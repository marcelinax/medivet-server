import { ApiProperty } from "@nestjs/swagger";

export class BadRequestExceptionDto {
    @ApiProperty({ example: 404 })
    statusCode: number;

    @ApiProperty({ example: ["Bad request"] })
    message: string[];
}