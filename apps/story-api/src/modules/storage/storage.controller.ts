import {
  Controller, Get, Post, Delete, Param, ParseUUIDPipe,
  UseInterceptors, UploadedFile, Res, StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import type { Response } from 'express';
import { StorageService } from './storage.service.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@ApiTags('Storage')
@ApiBearerAuth()
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @Roles('author', 'admin')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: { buffer: Buffer; originalname: string; mimetype: string }) {
    return this.storageService.upload(file.buffer, file.originalname, file.mimetype);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Download a file' })
  async download(@Param('id', ParseUUIDPipe) id: string, @Res({ passthrough: true }) res: Response) {
    const file = await this.storageService.getFile(id);
    res.set({ 'Content-Type': file.mimeType, 'Content-Disposition': `attachment; filename="${file.originalName}"` });
    return new StreamableFile(file.buffer);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a file' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.storageService.delete(id);
    return { deleted: true };
  }
}
