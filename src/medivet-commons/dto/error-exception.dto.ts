import { ApiProperty } from "@nestjs/swagger";

export class ErrorExceptionDto {
    @ApiProperty({ example: 401 })
    statusCode: number;

    @ApiProperty({ example: ['User with this email already exists.'] })
    message: string[];

    @ApiProperty({ example: 'Unauthorized'})
    error: string;
}