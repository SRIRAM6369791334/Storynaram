import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviseStoryDto {
  @ApiProperty()
  @IsString()
  storyId!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  focus?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  style?: string;
}
