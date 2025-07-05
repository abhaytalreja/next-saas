import { z } from 'zod';
import type { StorageConfig } from './types';

/**
 * Storage configuration schema
 */
export const storageConfigSchema = z.object({
  provider: z.enum(['backblaze', 's3', 'supabase']),
  backblaze: z
    .object({
      applicationKeyId: z.string(),
      applicationKey: z.string(),
      bucketId: z.string(),
      bucketName: z.string(),
      region: z.string().optional(),
    })
    .optional(),
  s3: z
    .object({
      accessKeyId: z.string(),
      secretAccessKey: z.string(),
      region: z.string(),
      bucket: z.string(),
      endpoint: z.string().url().optional(),
    })
    .optional(),
  supabase: z
    .object({
      url: z.string().url(),
      anonKey: z.string(),
      serviceRoleKey: z.string().optional(),
    })
    .optional(),
});

/**
 * Get storage configuration from environment variables
 */
export function getStorageConfig(): StorageConfig {
  const provider = process.env.STORAGE_PROVIDER || 'backblaze';

  const config: StorageConfig = {
    provider: provider as any,
  };

  switch (provider) {
    case 'backblaze':
      config.backblaze = {
        applicationKeyId: process.env.BACKBLAZE_KEY_ID!,
        applicationKey: process.env.BACKBLAZE_APPLICATION_KEY!,
        bucketId: process.env.BACKBLAZE_BUCKET_ID!,
        bucketName: process.env.BACKBLAZE_BUCKET_NAME!,
        region: process.env.BACKBLAZE_REGION,
      };
      break;
    case 's3':
      config.s3 = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        region: process.env.AWS_REGION || 'us-east-1',
        bucket: process.env.AWS_S3_BUCKET!,
        endpoint: process.env.AWS_S3_ENDPOINT,
      };
      break;
    case 'supabase':
      config.supabase = {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      };
      break;
  }

  // Validate configuration
  const parsed = storageConfigSchema.safeParse(config);
  if (!parsed.success) {
    console.error('Invalid storage configuration:', parsed.error.errors);
    throw new Error('Invalid storage configuration. Please check your environment variables.');
  }

  return parsed.data;
}

/**
 * Storage bucket configurations
 */
export const storageBuckets = {
  avatars: {
    name: 'avatars',
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
  documents: {
    name: 'documents',
    public: false,
    fileSizeLimit: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
    ],
  },
  images: {
    name: 'images',
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
  },
  exports: {
    name: 'exports',
    public: false,
    fileSizeLimit: 100 * 1024 * 1024, // 100MB
    allowedMimeTypes: ['application/zip', 'application/json', 'text/csv'],
  },
} as const;

/**
 * Get bucket configuration
 */
export function getBucketConfig(bucketName: string) {
  return storageBuckets[bucketName as keyof typeof storageBuckets];
}