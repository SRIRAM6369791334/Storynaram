import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GeneratedChapterDto {
  @ApiProperty()
  number!: number;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  content!: string;

  @ApiProperty()
  wordCount!: number;

  @ApiProperty()
  model!: string;

  @ApiProperty()
  provider!: string;

  @ApiProperty()
  latencyMs!: number;
}

export class GenerationMetricsDto {
  @ApiProperty()
  totalDurationMs!: number;

  @ApiProperty()
  totalTokens!: number;

  @ApiProperty()
  totalCost!: number;

  @ApiProperty()
  chaptersGenerated!: number;

  @ApiProperty()
  averageLatencyMs!: number;

  @ApiProperty({ type: [String] })
  modelsUsed!: string[];

  @ApiProperty({ type: [String] })
  providersUsed!: string[];
}

export class GenerationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  storyId!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional()
  startedAt?: string;

  @ApiPropertyOptional()
  completedAt?: string;

  @ApiPropertyOptional()
  error?: string;

  @ApiPropertyOptional({ type: [GeneratedChapterDto] })
  chapters?: GeneratedChapterDto[];

  @ApiPropertyOptional()
  fullStory?: string;

  @ApiPropertyOptional()
  qualityPassed?: boolean;

  @ApiPropertyOptional()
  metrics?: GenerationMetricsDto;

  @ApiPropertyOptional()
  progress?: number;

  @ApiPropertyOptional()
  retryAttempt?: number;
}
