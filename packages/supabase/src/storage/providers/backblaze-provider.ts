import B2 from 'backblaze-b2';
import { createHash } from 'crypto';
import type { Readable } from 'stream';
import type {
  BackblazeConfig,
  FileUploadOptions,
  FileDownloadOptions,
  FileListOptions,
  StorageFile,
  SignedUrlOptions,
  UploadResult,
  StorageResponse,
  UploadProgressCallback,
} from '../types';

export class BackblazeStorageProvider {
  private b2: any;
  private config: BackblazeConfig;
  private authToken?: string;
  private apiUrl?: string;
  private downloadUrl?: string;

  constructor(config: BackblazeConfig) {
    this.config = config;
    this.b2 = new B2({
      applicationKeyId: config.applicationKeyId,
      applicationKey: config.applicationKey,
    });
  }

  async initialize(): Promise<void> {
    try {
      const authResponse = await this.b2.authorize();
      this.authToken = authResponse.data.authorizationToken;
      this.apiUrl = authResponse.data.apiUrl;
      this.downloadUrl = authResponse.data.downloadUrl;
    } catch (error: any) {
      throw new Error(`Failed to initialize Backblaze B2: ${error.message}`);
    }
  }

  async upload(
    options: FileUploadOptions,
    onProgress?: UploadProgressCallback
  ): Promise<StorageResponse<UploadResult>> {
    try {
      if (!this.authToken) {
        await this.initialize();
      }

      // Get upload URL
      const uploadUrlResponse = await this.b2.getUploadUrl({
        bucketId: this.config.bucketId,
      });

      const { uploadUrl, authorizationToken } = uploadUrlResponse.data;

      // Convert file to buffer if needed
      const buffer = await this.fileToBuffer(options.file);
      const fileName = `${options.bucket}/${options.path}`;
      const sha1 = createHash('sha1').update(buffer).digest('hex');

      // Upload file
      const uploadResponse = await this.b2.uploadFile({
        uploadUrl,
        uploadAuthToken: authorizationToken,
        filename: fileName,
        data: buffer,
        hash: sha1,
        contentType: options.contentType || 'application/octet-stream',
        info: options.metadata || {},
        onUploadProgress: (event: any) => {
          if (onProgress) {
            onProgress({
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
            });
          }
        },
      });

      const result: UploadResult = {
        path: options.path,
        fullPath: fileName,
        size: buffer.length,
        mimeType: options.contentType || 'application/octet-stream',
        metadata: options.metadata,
        publicUrl: this.getPublicUrl(fileName),
      };

      return { data: result, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Upload failed',
          code: error.code,
          statusCode: error.status,
        },
      };
    }
  }

  async download(
    options: FileDownloadOptions
  ): Promise<StorageResponse<Buffer>> {
    try {
      if (!this.authToken) {
        await this.initialize();
      }

      const fileName = `${options.bucket}/${options.path}`;

      const response = await this.b2.downloadFileByName({
        bucketName: this.config.bucketName,
        fileName,
      });

      return { data: response.data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Download failed',
          code: error.code,
          statusCode: error.status,
        },
      };
    }
  }

  async delete(bucket: string, path: string): Promise<StorageResponse<void>> {
    try {
      if (!this.authToken) {
        await this.initialize();
      }

      const fileName = `${bucket}/${path}`;

      // First, get file info to get fileId
      const listResponse = await this.b2.listFileNames({
        bucketId: this.config.bucketId,
        prefix: fileName,
        maxFileCount: 1,
      });

      const file = listResponse.data.files.find((f: any) => f.fileName === fileName);
      if (!file) {
        return {
          data: null,
          error: {
            message: 'File not found',
            code: 'FILE_NOT_FOUND',
            statusCode: 404,
          },
        };
      }

      // Delete the file
      await this.b2.deleteFileVersion({
        fileId: file.fileId,
        fileName: file.fileName,
      });

      return { data: null, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Delete failed',
          code: error.code,
          statusCode: error.status,
        },
      };
    }
  }

  async list(
    options: FileListOptions
  ): Promise<StorageResponse<StorageFile[]>> {
    try {
      if (!this.authToken) {
        await this.initialize();
      }

      const prefix = options.path
        ? `${options.bucket}/${options.path}`
        : `${options.bucket}/`;

      const listResponse = await this.b2.listFileNames({
        bucketId: this.config.bucketId,
        prefix,
        maxFileCount: options.limit || 100,
        startFileName: options.offset ? prefix + options.offset : undefined,
      });

      const files: StorageFile[] = listResponse.data.files.map((file: any) => ({
        name: file.fileName.replace(prefix, ''),
        id: file.fileId,
        bucket: options.bucket,
        path: file.fileName,
        size: file.size,
        mimeType: file.contentType,
        metadata: file.fileInfo,
        createdAt: new Date(file.uploadTimestamp),
        updatedAt: new Date(file.uploadTimestamp),
      }));

      return { data: files, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'List failed',
          code: error.code,
          statusCode: error.status,
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
      if (!this.authToken) {
        await this.initialize();
      }

      const fileName = `${bucket}/${path}`;
      const validDuration = Math.min(options.expiresIn, 604800); // Max 7 days

      // B2 doesn't have native signed URLs like S3
      // For private buckets, we need to use authorization tokens
      const authResponse = await this.b2.getDownloadAuthorization({
        bucketId: this.config.bucketId,
        fileNamePrefix: fileName,
        validDurationInSeconds: validDuration,
      });

      const signedUrl = `${this.downloadUrl}/file/${this.config.bucketName}/${fileName}?Authorization=${authResponse.data.authorizationToken}`;

      return { data: signedUrl, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to create signed URL',
          code: error.code,
          statusCode: error.status,
        },
      };
    }
  }

  async createBucket(name: string, isPublic: boolean): Promise<StorageResponse<void>> {
    try {
      if (!this.authToken) {
        await this.initialize();
      }

      await this.b2.createBucket({
        bucketName: name,
        bucketType: isPublic ? 'allPublic' : 'allPrivate',
      });

      return { data: null, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to create bucket',
          code: error.code,
          statusCode: error.status,
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

  private getPublicUrl(fileName: string): string {
    return `${this.downloadUrl}/file/${this.config.bucketName}/${fileName}`;
  }
}