import type { Readable } from 'stream';

export type StorageProvider = 'backblaze' | 's3' | 'supabase';

export interface StorageConfig {
  provider: StorageProvider;
  backblaze?: BackblazeConfig;
  s3?: S3Config;
  supabase?: SupabaseStorageConfig;
}

export interface BackblazeConfig {
  applicationKeyId: string;
  applicationKey: string;
  bucketId: string;
  bucketName: string;
  region?: string;
}

export interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
  endpoint?: string; // For S3-compatible services
}

export interface SupabaseStorageConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

export interface StorageBucket {
  name: string;
  public: boolean;
  fileSizeLimit?: number; // in bytes
  allowedMimeTypes?: string[];
}

export interface FileUploadOptions {
  bucket: string;
  path: string;
  file: File | Buffer | Blob | Readable;
  metadata?: Record<string, string>;
  contentType?: string;
  cacheControl?: string;
  upsert?: boolean;
}

export interface FileDownloadOptions {
  bucket: string;
  path: string;
  transform?: ImageTransformOptions;
}

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  resize?: 'cover' | 'contain' | 'fill';
}

export interface FileListOptions {
  bucket: string;
  path?: string;
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: {
    column: 'name' | 'created_at' | 'updated_at' | 'size';
    order: 'asc' | 'desc';
  };
}

export interface StorageFile {
  name: string;
  id?: string;
  bucket: string;
  path: string;
  size: number;
  mimeType: string;
  metadata?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
}

export interface SignedUrlOptions {
  expiresIn: number; // seconds
  download?: boolean | string; // true or filename
  transform?: ImageTransformOptions;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  path: string;
  fullPath: string;
  publicUrl?: string;
  size: number;
  mimeType: string;
  metadata?: Record<string, string>;
}

export interface StorageError {
  message: string;
  code?: string;
  statusCode?: number;
}

export interface StorageResponse<T> {
  data: T | null;
  error: StorageError | null;
}

export type UploadProgressCallback = (progress: UploadProgress) => void;