import { Injectable, Logger } from '@nestjs/common';
import { StorageClient } from './storage-client';
import type { SignedUrlOptions, SignedUrlOperation } from './types';
import { SignedUrlError } from './errors';

@Injectable()
export class SignedUrlService {
  private readonly logger = new Logger(SignedUrlService.name);

  constructor(private readonly client: StorageClient) {}

  async generate(
    operation: SignedUrlOperation,
    bucket: string,
    key: string,
    options?: SignedUrlOptions,
  ): Promise<string> {
    try {
      const url = await this.client.getAdapter().getSignedUrl(operation, bucket, key, options);
      this.logger.debug(`Signed URL generated for ${operation} ${bucket}/${key}`);
      return url;
    } catch (err) {
      throw new SignedUrlError(`Failed to generate signed URL: ${(err as Error).message}`);
    }
  }
}
