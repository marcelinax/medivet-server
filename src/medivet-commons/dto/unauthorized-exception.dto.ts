import { ApiProperty } from "@nestjs/swagger";

export class UnauthorizedExceptionDto {
  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({
      example: [
          {
              message: "Unauthorized",
              property: "email",
          }
      ]
  })
  message: UnauthorizedExceptionDtoMessageDto[];
}

export class UnauthorizedExceptionDtoMessageDto {
  @ApiProperty({ example: "Unauthorized" })
  message: string;

  @ApiProperty({ example: "all" })
  property: string;
}
