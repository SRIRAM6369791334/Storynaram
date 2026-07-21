import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PlanStoryDto {
  @ApiProperty()
  @IsString()
  storyId!: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  constraints?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  genre?: string;
}
