import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateStoryDto {
  @ApiProperty()
  @IsString()
  storyId!: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  options?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  model?: string;
}
