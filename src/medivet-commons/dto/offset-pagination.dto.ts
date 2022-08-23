import { ApiProperty } from "@nestjs/swagger";

export class OffsetPaginationDto {
    @ApiProperty({
        example: 10
    })
    pageSize: number;

    @ApiProperty({
        example: 0
    })
    offset: number;
}