import { Injectable, Logger } from '@nestjs/common';
import { StorageClient } from './storage-client';
import type { MultipartUploadOptions, PartETag, MultipartUploadInfo } from './types';
import { MultipartUploadError } from './errors';

@Injectable()
export class MultipartUploadManager {
  private readonly logger = new Logger(MultipartUploadManager.name);

  constructor(private readonly client: StorageClient) {}

  async create(bucket: string, key: string, options?: MultipartUploadOptions): Promise<MultipartUploadInfo> {
    try {
      const uploadId = await this.client.getAdapter().createMultipartUpload(bucket, key, options);
      this.logger.debug(`Multipart upload created: ${bucket}/${key} (${uploadId})`);
      return { uploadId, bucket, key, initiated: new Date() };
    } catch (err) {
      throw new MultipartUploadError(`Failed to create multipart upload: ${(err as Error).message}`);
    }
  }

  async uploadPart(bucket: string, key: string, uploadId: string, partNumber: number, data: Buffer): Promise<PartETag> {
    try {
      return await this.client.getAdapter().uploadPart(bucket, key, uploadId, partNumber, data);
    } catch (err) {
      throw new MultipartUploadError(`Failed to upload part ${partNumber}: ${(err as Error).message}`);
    }
  }

  async complete(bucket: string, key: string, uploadId: string, parts: PartETag[]): Promise<void> {
    try {
      await this.client.getAdapter().completeMultipartUpload(bucket, key, uploadId, parts);
      this.logger.debug(`Multipart upload completed: ${bucket}/${key}`);
    } catch (err) {
      throw new MultipartUploadError(`Failed to complete multipart upload: ${(err as Error).message}`);
    }
  }

  async abort(bucket: string, key: string, uploadId: string): Promise<void> {
    try {
      await this.client.getAdapter().abortMultipartUpload(bucket, key, uploadId);
      this.logger.debug(`Multipart upload aborted: ${bucket}/${key}`);
    } catch (err) {
      throw new MultipartUploadError(`Failed to abort multipart upload: ${(err as Error).message}`);
    }
  }

  async uploadLargeFile(
    bucket: string,
    key: string,
    data: Buffer,
    options?: MultipartUploadOptions,
  ): Promise<void> {
    const partSize = options?.partSize ?? 5 * 1024 * 1024;
    const totalParts = Math.ceil(data.length / partSize);
    const uploadInfo = await this.create(bucket, key, options);
    const parts: PartETag[] = [];

    try {
      for (let i = 0; i < totalParts; i++) {
        const start = i * partSize;
        const end = Math.min(start + partSize, data.length);
        const partData = data.subarray(start, end);
        const part = await this.uploadPart(bucket, key, uploadInfo.uploadId, i + 1, partData);
        parts.push(part);
        this.logger.debug(`Uploaded part ${i + 1}/${totalParts}`);
      }
      await this.complete(bucket, key, uploadInfo.uploadId, parts);
    } catch (err) {
      await this.abort(bucket, key, uploadInfo.uploadId).catch(() => {});
      throw err;
    }
  }
}
