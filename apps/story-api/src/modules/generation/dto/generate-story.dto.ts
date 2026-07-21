import { IsString, IsOptional, IsObject, IsNumber, IsArray, ValidateNested, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChapterInputDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  number!: number;

  @ApiProperty()
  @IsString()
  title!: string;
}

export class GenerateStoryDto {
  @ApiProperty()
  @IsString()
  storyId!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ type: [ChapterInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChapterInputDto)
  @IsOptional()
  chapters?: ChapterInputDto[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  provider?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  temperature?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  maxTokens?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  stream?: boolean;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  options?: Record<string, unknown>;
}
