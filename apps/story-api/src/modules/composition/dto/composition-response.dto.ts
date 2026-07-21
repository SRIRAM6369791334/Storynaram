import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompositionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  createdAt!: string;
}
