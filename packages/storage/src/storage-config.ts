export class StorageConfig {
  readonly bucket: string;
  readonly maxRetries: number;

  constructor(data?: Partial<StorageConfig>) {
    this.bucket = data?.bucket ?? 'default';
    this.maxRetries = data?.maxRetries ?? 3;
  }
}
