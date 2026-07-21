import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WorldResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  genre?: string;

  @ApiProperty()
  createdAt!: string;
}
