import { ApiProperty } from '@nestjs/swagger';

export class AiPublishResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  storyId!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  createdAt!: string;
}
