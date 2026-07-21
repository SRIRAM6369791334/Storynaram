import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TimelineResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  createdAt!: string;
}
