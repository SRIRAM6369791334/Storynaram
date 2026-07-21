import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NarrativeResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  createdAt!: string;
}
