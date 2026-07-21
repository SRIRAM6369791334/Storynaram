import { ApiProperty } from '@nestjs/swagger';

export class GenerationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  storyId!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  createdAt!: string;
}
