import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStoryDto {
  @ApiProperty({ example: 'The Great Adventure' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ example: 'A story about a hero' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: ['fantasy', 'adventure'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  genres?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  authorId?: string;
}
