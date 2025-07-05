import { BackblazeStorageProvider } from './providers/backblaze-provider';
import { S3StorageProvider } from './providers/s3-provider';
import { SupabaseStorageProvider } from './providers/supabase-provider';
import type {
  StorageConfig,
  StorageProvider,
  FileUploadOptions,
  FileDownloadOptions,
  FileListOptions,
  StorageFile,
  SignedUrlOptions,
  UploadResult,
  StorageResponse,
  UploadProgressCallback,
} from './types';

export class StorageClient {
  private provider: BackblazeStorageProvider | S3StorageProvider | SupabaseStorageProvider;
  private config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = config;

    switch (config.provider) {
      case 'backblaze':
        if (!config.backblaze) {
          throw new Error('Backblaze configuration is required');
        }
        this.provider = new BackblazeStorageProvider(config.backblaze);
        break;
      case 's3':
        if (!config.s3) {
          throw new Error('S3 configuration is required');
        }
        this.provider = new S3StorageProvider(config.s3);
        break;
      case 'supabase':
        if (!config.supabase) {
          throw new Error('Supabase configuration is required');
        }
        this.provider = new SupabaseStorageProvider(config.supabase);
        break;
      default:
        throw new Error(`Unsupported storage provider: ${config.provider}`);
    }
  }

  /**
   * Initialize the storage provider (if needed)
   */
  async initialize(): Promise<void> {
    if (this.provider instanceof BackblazeStorageProvider) {
      await this.provider.initialize();
    }
  }

  /**
   * Upload a file
   */
  async upload(
    options: FileUploadOptions,
    onProgress?: UploadProgressCallback
  ): Promise<StorageResponse<UploadResult>> {
    return this.provider.upload(options, onProgress);
  }

  /**
   * Download a file
   */
  async download(
    options: FileDownloadOptions
  ): Promise<StorageResponse<Buffer | Blob>> {
    return this.provider.download(options);
  }

  /**
   * Delete a file
   */
  async delete(bucket: string, path: string): Promise<StorageResponse<void>> {
    return this.provider.delete(bucket, path);
  }

  /**
   * List files in a bucket/path
   */
  async list(
    options: FileListOptions
  ): Promise<StorageResponse<StorageFile[]>> {
    return this.provider.list(options);
  }

  /**
   * Create a signed URL for temporary access
   */
  async createSignedUrl(
    bucket: string,
    path: string,
    options: SignedUrlOptions
  ): Promise<StorageResponse<string>> {
    return this.provider.createSignedUrl(bucket, path, options);
  }

  /**
   * Create a new bucket
   */
  async createBucket(
    name: string,
    isPublic: boolean = false
  ): Promise<StorageResponse<void>> {
    return this.provider.createBucket(name, isPublic);
  }

  /**
   * Get the current storage provider
   */
  getProvider(): StorageProvider {
    return this.config.provider;
  }

  /**
   * Check if a file exists
   */
  async exists(bucket: string, path: string): Promise<boolean> {
    if (this.provider instanceof S3StorageProvider) {
      const result = await this.provider.getFileInfo(bucket, path);
      return result.data !== null;
    }

    // For other providers, try to list the specific file
    const result = await this.list({
      bucket,
      path,
      limit: 1,
    });

    return result.data?.some(file => file.name === path) || false;
  }

  /**
   * Copy a file
   */
  async copy(
    sourceBucket: string,
    sourcePath: string,
    destBucket: string,
    destPath: string
  ): Promise<StorageResponse<void>> {
    // Download from source
    const downloadResult = await this.download({
      bucket: sourceBucket,
      path: sourcePath,
    });

    if (downloadResult.error) {
      return {
        data: null,
        error: downloadResult.error,
      };
    }

    // Upload to destination
    const uploadResult = await this.upload({
      bucket: destBucket,
      path: destPath,
      file: downloadResult.data!,
    });

    if (uploadResult.error) {
      return {
        data: null,
        error: uploadResult.error,
      };
    }

    return { data: null, error: null };
  }

  /**
   * Move a file (copy + delete)
   */
  async move(
    sourceBucket: string,
    sourcePath: string,
    destBucket: string,
    destPath: string
  ): Promise<StorageResponse<void>> {
    // Copy file
    const copyResult = await this.copy(
      sourceBucket,
      sourcePath,
      destBucket,
      destPath
    );

    if (copyResult.error) {
      return copyResult;
    }

    // Delete original
    return this.delete(sourceBucket, sourcePath);
  }
}