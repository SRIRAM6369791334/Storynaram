import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AiPublishDto {
  @ApiProperty()
  @IsString()
  storyId!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  formats?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  profile?: string;
}
