import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  CreateBucketCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Readable } from 'stream';
import type {
  S3Config,
  FileUploadOptions,
  FileDownloadOptions,
  FileListOptions,
  StorageFile,
  SignedUrlOptions,
  UploadResult,
  StorageResponse,
  UploadProgressCallback,
} from '../types';

export class S3StorageProvider {
  private client: S3Client;
  private config: S3Config;

  constructor(config: S3Config) {
    this.config = config;
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      endpoint: config.endpoint,
    });
  }

  async upload(
    options: FileUploadOptions,
    onProgress?: UploadProgressCallback
  ): Promise<StorageResponse<UploadResult>> {
    try {
      const key = `${options.bucket}/${options.path}`;
      const buffer = await this.fileToBuffer(options.file);

      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: buffer,
        ContentType: options.contentType || 'application/octet-stream',
        CacheControl: options.cacheControl,
        Metadata: options.metadata || {},
      });

      // S3 SDK doesn't support upload progress for PutObject
      // For progress tracking, use multipart upload for large files
      await this.client.send(command);

      const result: UploadResult = {
        path: options.path,
        fullPath: key,
        size: buffer.length,
        mimeType: options.contentType || 'application/octet-stream',
        metadata: options.metadata,
        publicUrl: this.getPublicUrl(key),
      };

      // Simulate progress completion
      if (onProgress) {
        onProgress({
          loaded: buffer.length,
          total: buffer.length,
          percentage: 100,
        });
      }

      return { data: result, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Upload failed',
          code: error.name,
          statusCode: error.$metadata?.httpStatusCode,
        },
      };
    }
  }

  async download(
    options: FileDownloadOptions
  ): Promise<StorageResponse<Buffer>> {
    try {
      const key = `${options.bucket}/${options.path}`;

      const command = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });

      const response = await this.client.send(command);
      const stream = response.Body as Readable;
      
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      
      const buffer = Buffer.concat(chunks);

      return { data: buffer, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Download failed',
          code: error.name,
          statusCode: error.$metadata?.httpStatusCode,
        },
      };
    }
  }

  async delete(bucket: string, path: string): Promise<StorageResponse<void>> {
    try {
      const key = `${bucket}/${path}`;

      const command = new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });

      await this.client.send(command);

      return { data: null, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Delete failed',
          code: error.name,
          statusCode: error.$metadata?.httpStatusCode,
        },
      };
    }
  }

  async list(
    options: FileListOptions
  ): Promise<StorageResponse<StorageFile[]>> {
    try {
      const prefix = options.path
        ? `${options.bucket}/${options.path}`
        : `${options.bucket}/`;

      const command = new ListObjectsV2Command({
        Bucket: this.config.bucket,
        Prefix: prefix,
        MaxKeys: options.limit || 100,
        ContinuationToken: options.offset,
      });

      const response = await this.client.send(command);

      const files: StorageFile[] = (response.Contents || []).map((object) => ({
        name: object.Key!.replace(prefix, ''),
        bucket: options.bucket,
        path: object.Key!,
        size: object.Size || 0,
        mimeType: 'application/octet-stream', // S3 doesn't return content type in list
        createdAt: object.LastModified!,
        updatedAt: object.LastModified!,
      }));

      return { data: files, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'List failed',
          code: error.name,
          statusCode: error.$metadata?.httpStatusCode,
        },
      };
    }
  }

  async createSignedUrl(
    bucket: string,
    path: string,
    options: SignedUrlOptions
  ): Promise<StorageResponse<string>> {
    try {
      const key = `${bucket}/${path}`;

      const command = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        ResponseContentDisposition: options.download
          ? `attachment; filename="${options.download === true ? path : options.download}"`
          : undefined,
      });

      const signedUrl = await getSignedUrl(this.client, command, {
        expiresIn: options.expiresIn,
      });

      return { data: signedUrl, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to create signed URL',
          code: error.name,
          statusCode: error.$metadata?.httpStatusCode,
        },
      };
    }
  }

  async createBucket(name: string, isPublic: boolean): Promise<StorageResponse<void>> {
    try {
      const command = new CreateBucketCommand({
        Bucket: name,
        ACL: isPublic ? 'public-read' : 'private',
      });

      await this.client.send(command);

      return { data: null, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to create bucket',
          code: error.name,
          statusCode: error.$metadata?.httpStatusCode,
        },
      };
    }
  }

  async getFileInfo(
    bucket: string,
    path: string
  ): Promise<StorageResponse<StorageFile>> {
    try {
      const key = `${bucket}/${path}`;

      const command = new HeadObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });

      const response = await this.client.send(command);

      const file: StorageFile = {
        name: path,
        bucket,
        path: key,
        size: response.ContentLength || 0,
        mimeType: response.ContentType || 'application/octet-stream',
        metadata: response.Metadata,
        createdAt: response.LastModified!,
        updatedAt: response.LastModified!,
      };

      return { data: file, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to get file info',
          code: error.name,
          statusCode: error.$metadata?.httpStatusCode,
        },
      };
    }
  }

  private async fileToBuffer(file: File | Buffer | Blob | Readable): Promise<Buffer> {
    if (Buffer.isBuffer(file)) {
      return file;
    }

    if (file instanceof Blob || file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }

    if (file instanceof Readable) {
      const chunks: Buffer[] = [];
      for await (const chunk of file) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    }

    throw new Error('Unsupported file type');
  }

  private getPublicUrl(key: string): string {
    if (this.config.endpoint) {
      return `${this.config.endpoint}/${this.config.bucket}/${key}`;
    }
    return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`;
  }
}