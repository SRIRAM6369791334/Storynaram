import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CharacterResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  role?: string;

  @ApiPropertyOptional()
  species?: string;

  @ApiProperty()
  createdAt!: string;
}
