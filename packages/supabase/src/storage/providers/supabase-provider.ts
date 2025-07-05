import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  SupabaseStorageConfig,
  FileUploadOptions,
  FileDownloadOptions,
  FileListOptions,
  StorageFile,
  SignedUrlOptions,
  UploadResult,
  StorageResponse,
  UploadProgressCallback,
} from '../types';

export class SupabaseStorageProvider {
  private client: SupabaseClient;
  private config: SupabaseStorageConfig;

  constructor(config: SupabaseStorageConfig) {
    this.config = config;
    this.client = createClient(
      config.url,
      config.serviceRoleKey || config.anonKey
    );
  }

  async upload(
    options: FileUploadOptions,
    onProgress?: UploadProgressCallback
  ): Promise<StorageResponse<UploadResult>> {
    try {
      const storage = this.client.storage.from(options.bucket);
      
      const { data, error } = await storage.upload(
        options.path,
        options.file,
        {
          cacheControl: options.cacheControl || '3600',
          upsert: options.upsert || false,
          contentType: options.contentType,
        }
      );

      if (error) {
        return {
          data: null,
          error: {
            message: error.message,
            code: error.name,
            statusCode: error.status,
          },
        };
      }

      const { data: publicUrlData } = storage.getPublicUrl(options.path);

      const result: UploadResult = {
        path: data.path,
        fullPath: data.path,
        size: 0, // Supabase doesn't return size in upload response
        mimeType: options.contentType || 'application/octet-stream',
        metadata: options.metadata,
        publicUrl: publicUrlData.publicUrl,
      };

      return { data: result, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Upload failed',
          code: 'UPLOAD_ERROR',
        },
      };
    }
  }

  async download(
    options: FileDownloadOptions
  ): Promise<StorageResponse<Blob>> {
    try {
      const { data, error } = await this.client.storage
        .from(options.bucket)
        .download(options.path);

      if (error) {
        return {
          data: null,
          error: {
            message: error.message,
            code: error.name,
            statusCode: error.status,
          },
        };
      }

      return { data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Download failed',
          code: 'DOWNLOAD_ERROR',
        },
      };
    }
  }

  async delete(bucket: string, path: string): Promise<StorageResponse<void>> {
    try {
      const { error } = await this.client.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        return {
          data: null,
          error: {
            message: error.message,
            code: error.name,
            statusCode: error.status,
          },
        };
      }

      return { data: null, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Delete failed',
          code: 'DELETE_ERROR',
        },
      };
    }
  }

  async list(
    options: FileListOptions
  ): Promise<StorageResponse<StorageFile[]>> {
    try {
      const { data, error } = await this.client.storage
        .from(options.bucket)
        .list(options.path, {
          limit: options.limit || 100,
          offset: options.offset || 0,
          search: options.search,
          sortBy: options.sortBy
            ? {
                column: options.sortBy.column,
                order: options.sortBy.order,
              }
            : undefined,
        });

      if (error) {
        return {
          data: null,
          error: {
            message: error.message,
            code: error.name,
            statusCode: error.status,
          },
        };
      }

      const files: StorageFile[] = (data || []).map((file) => ({
        name: file.name,
        id: file.id,
        bucket: options.bucket,
        path: options.path ? `${options.path}/${file.name}` : file.name,
        size: file.metadata?.size || 0,
        mimeType: file.metadata?.mimetype || 'application/octet-stream',
        metadata: file.metadata,
        createdAt: new Date(file.created_at),
        updatedAt: new Date(file.updated_at || file.created_at),
        lastAccessedAt: file.last_accessed_at
          ? new Date(file.last_accessed_at)
          : undefined,
      }));

      return { data: files, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'List failed',
          code: 'LIST_ERROR',
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
      const { data, error } = await this.client.storage
        .from(bucket)
        .createSignedUrl(path, options.expiresIn, {
          download: options.download,
          transform: options.transform
            ? {
                width: options.transform.width,
                height: options.transform.height,
                quality: options.transform.quality,
                format: options.transform.format,
                resize: options.transform.resize,
              }
            : undefined,
        });

      if (error) {
        return {
          data: null,
          error: {
            message: error.message,
            code: error.name,
            statusCode: error.status,
          },
        };
      }

      return { data: data.signedUrl, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to create signed URL',
          code: 'SIGNED_URL_ERROR',
        },
      };
    }
  }

  async createBucket(
    name: string,
    isPublic: boolean
  ): Promise<StorageResponse<void>> {
    try {
      const { error } = await this.client.storage.createBucket(name, {
        public: isPublic,
      });

      if (error) {
        return {
          data: null,
          error: {
            message: error.message,
            code: error.name,
            statusCode: error.status,
          },
        };
      }

      return { data: null, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to create bucket',
          code: 'CREATE_BUCKET_ERROR',
        },
      };
    }
  }

  async updateBucket(
    name: string,
    options: { public?: boolean; fileSizeLimit?: number; allowedMimeTypes?: string[] }
  ): Promise<StorageResponse<void>> {
    try {
      const { error } = await this.client.storage.updateBucket(name, options);

      if (error) {
        return {
          data: null,
          error: {
            message: error.message,
            code: error.name,
            statusCode: error.status,
          },
        };
      }

      return { data: null, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to update bucket',
          code: 'UPDATE_BUCKET_ERROR',
        },
      };
    }
  }

  async deleteBucket(name: string): Promise<StorageResponse<void>> {
    try {
      const { error } = await this.client.storage.deleteBucket(name);

      if (error) {
        return {
          data: null,
          error: {
            message: error.message,
            code: error.name,
            statusCode: error.status,
          },
        };
      }

      return { data: null, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to delete bucket',
          code: 'DELETE_BUCKET_ERROR',
        },
      };
    }
  }
}