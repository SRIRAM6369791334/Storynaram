import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { writeFile, readFile, mkdir, unlink } from 'fs/promises';
import { join, extname } from 'path';
import { existsSync } from 'fs';

export interface UploadResult {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  createdAt: string;
}

export interface StoredFile {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  createdAt: Date;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly files = new Map<string, StoredFile>();
  private readonly basePath: string;

  constructor() {
    this.basePath = process.env.STORAGE_PATH ?? './storage';
  }

  async upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<UploadResult> {
    const id = randomUUID();
    const ext = extname(originalName) || '.bin';
    const filename = `${id}${ext}`;
    const relativePath = join('uploads', filename);
    const fullPath = join(this.basePath, relativePath);

    try {
      const dir = join(this.basePath, 'uploads');
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }

      await writeFile(fullPath, buffer);

      const record: StoredFile = {
        id,
        originalName,
        mimeType,
        size: buffer.length,
        path: relativePath,
        createdAt: new Date(),
      };

      this.files.set(id, record);

      return {
        id,
        filename,
        originalName,
        mimeType,
        size: buffer.length,
        path: relativePath,
        createdAt: record.createdAt.toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error}`);
      throw new BadRequestException('File upload failed');
    }
  }

  async getFile(id: string): Promise<{ buffer: Buffer; mimeType: string; originalName: string }> {
    const record = this.files.get(id);
    if (!record) throw new NotFoundException(`File ${id} not found`);

    const fullPath = join(this.basePath, record.path);
    if (!existsSync(fullPath)) {
      throw new NotFoundException(`File ${id} not found on disk`);
    }

    const buffer = await readFile(fullPath);
    return { buffer, mimeType: record.mimeType, originalName: record.originalName };
  }

  async delete(id: string): Promise<void> {
    const record = this.files.get(id);
    if (!record) throw new NotFoundException(`File ${id} not found`);

    const fullPath = join(this.basePath, record.path);
    if (existsSync(fullPath)) {
      await unlink(fullPath);
    }

    this.files.delete(id);
  }
}
