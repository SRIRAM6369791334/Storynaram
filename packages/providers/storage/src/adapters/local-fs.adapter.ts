import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import * as os from 'node:os';
import type { IStorageAdapter } from './storage-adapter.interface';
import type {
  BucketOptions,
  UploadOptions,
  DownloadOptions,
  UploadResult,
  DownloadResult,
  ObjectMetadata,
  ObjectVersion,
  ListResult,
  ListOptions,
  CopySource,
  CopyDestination,
  PartETag,
  MultipartUploadOptions,
  SignedUrlOptions,
  SignedUrlOperation,
  LifecycleRule,
  ReplicationConfiguration,
  StorageCapacityInfo,
} from '../types';
import {
  ConnectionError,
  ObjectNotFoundError,
  BucketNotFoundError,
  BucketAlreadyExistsError,
} from '../errors';

@Injectable()
export class LocalFSAdapter implements IStorageAdapter {
  readonly providerType = 'local-fs';
  private readonly logger = new Logger(LocalFSAdapter.name);
  private basePath: string;
  private _connected = false;

  private readonly uploadsDir: string;
  private readonly activeUploads = new Map<string, { parts: Map<number, Buffer>; metadata: Record<string, string> }>();

  constructor(
    readonly providerName: string,
    private readonly options: {
      basePath?: string;
    },
  ) {
    this.basePath = this.options.basePath ?? path.join(os.tmpdir(), 'storynaram-storage');
    this.uploadsDir = path.join(this.basePath, '.uploads');
  }

  async connect(): Promise<void> {
    try {
      await fsp.mkdir(this.basePath, { recursive: true });
      await fsp.mkdir(this.uploadsDir, { recursive: true });
      this._connected = true;
      this.logger.log(`LocalFS provider ${this.providerName} ready at ${this.basePath}`);
    } catch (err) {
      throw new ConnectionError(`Failed to initialize local storage: ${(err as Error).message}`);
    }
  }

  async close(): Promise<void> {
    this._connected = false;
  }

  async ping(): Promise<boolean> {
    try {
      await fsp.access(this.basePath, fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }

  private bucketPath(bucket: string): string {
    return path.join(this.basePath, bucket);
  }

  private objectPath(bucket: string, key: string): string {
    return path.join(this.bucketPath(bucket), key);
  }

  private ensureNoTraversal(bucket: string, key: string): void {
    const resolved = path.resolve(this.objectPath(bucket, key));
    if (!resolved.startsWith(path.resolve(this.basePath))) {
      throw new Error('Path traversal detected');
    }
  }

  async createBucket(bucket: string, _options?: BucketOptions): Promise<void> {
    const bp = this.bucketPath(bucket);
    try {
      await fsp.mkdir(bp, { recursive: true });
    } catch {
      throw new BucketAlreadyExistsError(bucket);
    }
  }

  async deleteBucket(bucket: string): Promise<void> {
    const bp = this.bucketPath(bucket);
    try {
      await fsp.rm(bp, { recursive: true, force: true });
    } catch {
      throw new BucketNotFoundError(bucket);
    }
  }

  async listBuckets(): Promise<string[]> {
    const entries = await fsp.readdir(this.basePath, { withFileTypes: true });
    return entries.filter(e => e.isDirectory() && !e.name.startsWith('.')).map(e => e.name);
  }

  async bucketExists(bucket: string): Promise<boolean> {
    try {
      const stat = await fsp.stat(this.bucketPath(bucket));
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  async upload(bucket: string, key: string, data: Buffer, options?: UploadOptions): Promise<UploadResult> {
    this.ensureNoTraversal(bucket, key);
    const fp = this.objectPath(bucket, key);
    await fsp.mkdir(path.dirname(fp), { recursive: true });
    await fsp.writeFile(fp, data);
    const etag = crypto.createHash('md5').update(data).digest('hex');
    const stat = await fsp.stat(fp);
    return {
      bucket,
      key,
      etag: `"${etag}"`,
      size: data.length,
      contentType: options?.contentType ?? this.detectContentType(key),
      checksum: etag,
    };
  }

  async download(bucket: string, key: string, _options?: DownloadOptions): Promise<DownloadResult> {
    this.ensureNoTraversal(bucket, key);
    const fp = this.objectPath(bucket, key);
    try {
      const data = await fsp.readFile(fp);
      const stat = await fsp.stat(fp);
      const etag = crypto.createHash('md5').update(data).digest('hex');
      return {
        bucket,
        key,
        data,
        contentType: this.detectContentType(key),
        contentLength: data.length,
        etag: `"${etag}"`,
        lastModified: stat.mtime,
      };
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new ObjectNotFoundError(bucket, key);
      }
      throw err;
    }
  }

  async delete(bucket: string, key: string): Promise<void> {
    this.ensureNoTraversal(bucket, key);
    const fp = this.objectPath(bucket, key);
    try {
      await fsp.unlink(fp);
      await this.removeEmptyParents(path.dirname(fp), this.bucketPath(bucket));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new ObjectNotFoundError(bucket, key);
      }
      throw err;
    }
  }

  private async removeEmptyParents(dir: string, stopAt: string): Promise<void> {
    if (dir === stopAt || dir.length <= stopAt.length) return;
    try {
      const entries = await fsp.readdir(dir);
      if (entries.length === 0) {
        await fsp.rmdir(dir);
        await this.removeEmptyParents(path.dirname(dir), stopAt);
      }
    } catch {
      // ignore
    }
  }

  async copy(source: CopySource, destination: CopyDestination): Promise<void> {
    this.ensureNoTraversal(source.bucket, source.key);
    this.ensureNoTraversal(destination.bucket, destination.key);
    const srcPath = this.objectPath(source.bucket, source.key);
    const dstPath = this.objectPath(destination.bucket, destination.key);
    await fsp.mkdir(path.dirname(dstPath), { recursive: true });
    await fsp.copyFile(srcPath, dstPath);
  }

  async move(source: CopySource, destination: CopyDestination): Promise<void> {
    await this.copy(source, destination);
    await this.delete(source.bucket, source.key);
  }

  async rename(bucket: string, oldKey: string, newKey: string): Promise<void> {
    await this.move({ bucket, key: oldKey }, { bucket, key: newKey });
  }

  async list(bucket: string, options?: ListOptions): Promise<ListResult> {
    const bp = this.bucketPath(bucket);
    const objects: ListResult['objects'] = [];
    const prefixes = new Set<string>();
    const prefix = options?.prefix ?? '';
    const delimiter = options?.delimiter;
    const maxKeys = options?.maxKeys ?? 1000;
    const recursive = options?.recursive ?? false;
    let count = 0;

    async function walk(dir: string, relDir: string): Promise<void> {
      if (count >= maxKeys) return;
      let entries: fs.Dirent[];
      try {
        entries = await fsp.readdir(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        if (count >= maxKeys) return;
        const relPath = relDir ? `${relDir}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          const shouldDescend = !prefix || prefix === relPath || prefix.startsWith(relPath ? `${relPath}/` : '');
          if (!shouldDescend) continue;
          if (!recursive && delimiter) {
            if (relPath.startsWith(prefix)) {
              const delimIdx = relPath.indexOf(delimiter, prefix.length);
              if (delimIdx >= 0) {
                prefixes.add(relPath.substring(0, delimIdx + delimiter.length));
                continue;
              }
            }
            await walk(path.join(dir, entry.name), relPath);
          } else {
            await walk(path.join(dir, entry.name), relPath);
          }
        } else if (entry.isFile()) {
          if (!relPath.startsWith(prefix)) continue;
          const stat = await fsp.stat(path.join(dir, entry.name));
          objects.push({
            key: relPath,
            size: stat.size,
            etag: '',
            lastModified: stat.mtime,
          });
          count++;
        }
      }
    }

    await walk(bp, '');
    return {
      objects,
      prefixes: Array.from(prefixes),
      isTruncated: count >= maxKeys,
    };
  }

  async exists(bucket: string, key: string): Promise<boolean> {
    this.ensureNoTraversal(bucket, key);
    try {
      const stat = await fsp.stat(this.objectPath(bucket, key));
      return stat.isFile();
    } catch {
      return false;
    }
  }

  async getMetadata(bucket: string, key: string): Promise<ObjectMetadata> {
    this.ensureNoTraversal(bucket, key);
    const fp = this.objectPath(bucket, key);
    try {
      const data = await fsp.readFile(fp);
      const stat = await fsp.stat(fp);
      const etag = crypto.createHash('md5').update(data).digest('hex');
      return {
        bucket,
        key,
        size: data.length,
        etag: `"${etag}"`,
        contentType: this.detectContentType(key),
        lastModified: stat.mtime,
        metadata: {},
        tags: {},
      };
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new ObjectNotFoundError(bucket, key);
      }
      throw err;
    }
  }

  async setMetadata(_bucket: string, _key: string, _metadata: Record<string, string>): Promise<void> {
    // Local FS does not support metadata natively
  }

  async getTags(_bucket: string, _key: string): Promise<Record<string, string>> {
    return {};
  }

  async setTags(_bucket: string, _key: string, _tags: Record<string, string>): Promise<void> {
    // Local FS does not support tags
  }

  async createMultipartUpload(bucket: string, key: string, options?: MultipartUploadOptions): Promise<string> {
    const uploadId = crypto.randomUUID();
    const partDir = path.join(this.uploadsDir, uploadId);
    await fsp.mkdir(partDir, { recursive: true });
    this.activeUploads.set(uploadId, { parts: new Map(), metadata: options?.metadata ?? {} });
    return uploadId;
  }

  async uploadPart(_bucket: string, _key: string, uploadId: string, partNumber: number, data: Buffer): Promise<PartETag> {
    const upload = this.activeUploads.get(uploadId);
    if (!upload) throw new Error(`Upload ${uploadId} not found`);
    const etag = crypto.createHash('md5').update(data).digest('hex');
    upload.parts.set(partNumber, data);
    return { partNumber, etag };
  }

  async completeMultipartUpload(bucket: string, key: string, uploadId: string, parts: PartETag[]): Promise<void> {
    const upload = this.activeUploads.get(uploadId);
    if (!upload) throw new Error(`Upload ${uploadId} not found`);
    const sorted = [...parts].sort((a, b) => a.partNumber - b.partNumber);
    const chunks: Buffer[] = [];
    for (const part of sorted) {
      const data = upload.parts.get(part.partNumber);
      if (data) chunks.push(data);
    }
    const complete = Buffer.concat(chunks);
    await this.upload(bucket, key, complete, { metadata: upload.metadata });
    this.activeUploads.delete(uploadId);
    const partDir = path.join(this.uploadsDir, uploadId);
    await fsp.rm(partDir, { recursive: true, force: true });
  }

  async abortMultipartUpload(_bucket: string, _key: string, uploadId: string): Promise<void> {
    this.activeUploads.delete(uploadId);
    const partDir = path.join(this.uploadsDir, uploadId);
    await fsp.rm(partDir, { recursive: true, force: true }).catch(() => {});
  }

  async getSignedUrl(_operation: SignedUrlOperation, _bucket: string, _key: string, _options?: SignedUrlOptions): Promise<string> {
    throw new Error('Signed URLs not supported by LocalFS adapter');
  }

  async setLifecycleRules(_bucket: string, _rules: LifecycleRule[]): Promise<void> {
    throw new Error('Lifecycle rules not supported by LocalFS adapter');
  }

  async getLifecycleRules(_bucket: string): Promise<LifecycleRule[]> {
    throw new Error('Lifecycle rules not supported by LocalFS adapter');
  }

  async setReplication(_bucket: string, _config: ReplicationConfiguration): Promise<void> {
    throw new Error('Replication not supported by LocalFS adapter');
  }

  async getReplication(_bucket: string): Promise<ReplicationConfiguration> {
    throw new Error('Replication not supported by LocalFS adapter');
  }

  async setVersioning(_bucket: string, _enabled: boolean): Promise<void> {
    throw new Error('Versioning not supported by LocalFS adapter');
  }

  async getVersioningStatus(_bucket: string): Promise<boolean> {
    return false;
  }

  async listVersions(_bucket: string, _key: string): Promise<ObjectVersion[]> {
    return [];
  }

  async deleteVersion(bucket: string, key: string, _versionId: string): Promise<void> {
    await this.delete(bucket, key);
  }

  async getCapacity(): Promise<StorageCapacityInfo> {
    try {
      const stats = await fsp.stat(this.basePath);
      const free = os.freemem();
      const total = os.totalmem();
      return {
        usedBytes: stats.size,
        totalBytes: total,
        availableBytes: free,
        usedPercent: ((total - free) / total) * 100,
      };
    } catch {
      return { usedBytes: 0, totalBytes: 0, availableBytes: 0, usedPercent: 0 };
    }
  }

  private detectContentType(key: string): string {
    const ext = path.extname(key).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
      '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf', '.json': 'application/json',
      '.txt': 'text/plain', '.html': 'text/html', '.css': 'text/css',
      '.js': 'application/javascript', '.ts': 'application/typescript',
      '.zip': 'application/zip', '.gz': 'application/gzip',
      '.mp4': 'video/mp4', '.mp3': 'audio/mpeg',
      '.wasm': 'application/wasm',
    };
    return mimeMap[ext] ?? 'application/octet-stream';
  }
}
