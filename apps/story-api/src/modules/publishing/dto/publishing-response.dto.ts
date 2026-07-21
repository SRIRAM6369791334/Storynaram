import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublishingResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  storyId!: string;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional({ type: [String] })
  formats?: string[];

  @ApiProperty()
  createdAt!: string;
}
