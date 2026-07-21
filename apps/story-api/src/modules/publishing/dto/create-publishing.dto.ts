import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePublishingDto {
  @ApiProperty()
  @IsString()
  storyId!: string;

  @ApiPropertyOptional({ example: ['pdf', 'epub', 'html'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  formats?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  profile?: string;
}
