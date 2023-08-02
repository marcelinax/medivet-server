import { ApiProperty } from "@nestjs/swagger";

export class BadRequestExceptionDto {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({
      example: [
          {
              message: "Bad request",
              property: "name",
              resource: { index: 1 }
          }
      ]
  })
  message: BadRequestExceptionMessageDto[];
}

export class BadRequestExceptionMessageDto {
  @ApiProperty({ example: "Bad request" })
  message: string;

  @ApiProperty({ example: "all" })
  property: string;

  @ApiProperty({
      example: {
          id: 1,
          index: 1
      }
  })
  resource?: Record<string, any>;
}
