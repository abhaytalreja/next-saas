import { z } from 'zod';

/**
 * Storage Configuration Schema
 * 
 * Validates file storage settings including:
 * - Local file system storage
 * - Cloud storage providers (AWS S3, Google Cloud, Azure)
 * - CDN configuration
 * - File upload limits and validation
 * - Image processing and optimization
 * - Backup and retention policies
 */

// Storage provider enum
export const StorageProvider = z.enum([
  'local',
  'aws-s3',
  'google-cloud',
  'azure-blob',
  'digitalocean-spaces',
  'cloudflare-r2',
  'minio'
]);

// Local storage configuration
const localStorageSchema = z.object({
  uploadPath: z.string().default('./uploads'),
  publicPath: z.string().default('/uploads'),
  createDirectories: z.boolean().default(true),
  preserveExtension: z.boolean().default(true),
  generateUniqueFilename: z.boolean().default(true),
}).describe('Local file system storage configuration');

// AWS S3 configuration
const awsS3Schema = z.object({
  accessKeyId: z.string().min(1, 'AWS access key ID is required'),
  secretAccessKey: z.string().min(1, 'AWS secret access key is required'),
  region: z.string().default('us-east-1'),
  bucket: z.string().min(1, 'S3 bucket name is required'),
  endpoint: z.string().url().optional(),
  forcePathStyle: z.boolean().default(false),
  signatureVersion: z.string().default('v4'),
  accelerate: z.boolean().default(false),
  presignedUrlExpiry: z.number().int().min(60).default(3600), // 1 hour
}).describe('AWS S3 storage configuration');

// Google Cloud Storage configuration
const googleCloudSchema = z.object({
  projectId: z.string().min(1, 'Google Cloud project ID is required'),
  keyFilename: z.string().optional(),
  credentials: z.object({
    type: z.string().optional(),
    project_id: z.string().optional(),
    private_key_id: z.string().optional(),
    private_key: z.string().optional(),
    client_email: z.string().optional(),
    client_id: z.string().optional(),
    auth_uri: z.string().optional(),
    token_uri: z.string().optional(),
  }).optional(),
  bucket: z.string().min(1, 'Google Cloud Storage bucket name is required'),
  presignedUrlExpiry: z.number().int().min(60).default(3600),
}).describe('Google Cloud Storage configuration');

// Azure Blob Storage configuration
const azureBlobSchema = z.object({
  accountName: z.string().min(1, 'Azure storage account name is required'),
  accountKey: z.string().min(1, 'Azure storage account key is required'),
  containerName: z.string().min(1, 'Azure blob container name is required'),
  endpoint: z.string().url().optional(),
  presignedUrlExpiry: z.number().int().min(60).default(3600),
}).describe('Azure Blob Storage configuration');

// DigitalOcean Spaces configuration
const digitalOceanSpacesSchema = z.object({
  accessKeyId: z.string().min(1, 'DigitalOcean Spaces access key is required'),
  secretAccessKey: z.string().min(1, 'DigitalOcean Spaces secret key is required'),
  endpoint: z.string().url(),
  region: z.string().default('nyc3'),
  bucket: z.string().min(1, 'DigitalOcean Spaces bucket name is required'),
  cdnEndpoint: z.string().url().optional(),
}).describe('DigitalOcean Spaces configuration');

// Cloudflare R2 configuration
const cloudflareR2Schema = z.object({
  accessKeyId: z.string().min(1, 'Cloudflare R2 access key is required'),
  secretAccessKey: z.string().min(1, 'Cloudflare R2 secret key is required'),
  endpoint: z.string().url(),
  bucket: z.string().min(1, 'Cloudflare R2 bucket name is required'),
  publicUrl: z.string().url().optional(),
}).describe('Cloudflare R2 configuration');

// File upload limits and validation
const uploadLimitsSchema = z.object({
  maxFileSize: z.number().int().min(1024).default(10485760), // 10MB
  maxFiles: z.number().int().min(1).default(10),
  allowedMimeTypes: z.array(z.string()).default([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]),
  allowedExtensions: z.array(z.string()).default([
    '.jpg', '.jpeg', '.png', '.gif', '.webp',
    '.pdf', '.txt', '.csv', '.xls', '.xlsx'
  ]),
  disallowedMimeTypes: z.array(z.string()).default([
    'application/x-executable',
    'application/x-msdownload',
    'application/x-msdos-program'
  ]),
  virusScanning: z.boolean().default(false),
}).describe('File upload limits and validation');

// Image processing configuration
const imageProcessingSchema = z.object({
  enabled: z.boolean().default(true),
  engine: z.enum(['sharp', 'imagemagick', 'jimp']).default('sharp'),
  autoOptimize: z.boolean().default(true),
  quality: z.number().int().min(1).max(100).default(85),
  formats: z.object({
    jpeg: z.object({
      quality: z.number().int().min(1).max(100).default(85),
      progressive: z.boolean().default(true),
    }).default({}),
    png: z.object({
      compressionLevel: z.number().int().min(0).max(9).default(6),
      progressive: z.boolean().default(false),
    }).default({}),
    webp: z.object({
      quality: z.number().int().min(1).max(100).default(80),
      lossless: z.boolean().default(false),
    }).default({}),
  }).default({}),
  thumbnails: z.object({
    enabled: z.boolean().default(true),
    sizes: z.array(z.object({
      name: z.string(),
      width: z.number().int().min(1),
      height: z.number().int().min(1),
      fit: z.enum(['cover', 'contain', 'fill', 'inside', 'outside']).default('cover'),
    })).default([
      { name: 'thumb', width: 150, height: 150, fit: 'cover' },
      { name: 'small', width: 300, height: 300, fit: 'cover' },
      { name: 'medium', width: 600, height: 600, fit: 'cover' },
      { name: 'large', width: 1200, height: 1200, fit: 'cover' },
    ]),
  }).default({}),
  watermark: z.object({
    enabled: z.boolean().default(false),
    image: z.string().optional(),
    text: z.string().optional(),
    position: z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']).default('bottom-right'),
    opacity: z.number().min(0).max(1).default(0.5),
  }).default({}),
}).describe('Image processing configuration');

// CDN configuration
const cdnConfigSchema = z.object({
  enabled: z.boolean().default(false),
  provider: z.enum(['cloudflare', 'aws-cloudfront', 'google-cdn', 'azure-cdn', 'custom']).optional(),
  baseUrl: z.string().url().optional(),
  cacheTtl: z.number().int().min(300).default(86400), // 24 hours
  customHeaders: z.record(z.string(), z.string()).default({}),
  purgeOnUpload: z.boolean().default(false),
  
  // Cloudflare configuration
  cloudflare: z.object({
    zoneId: z.string().optional(),
    apiToken: z.string().optional(),
  }).optional(),
  
  // AWS CloudFront configuration
  cloudfront: z.object({
    distributionId: z.string().optional(),
    accessKeyId: z.string().optional(),
    secretAccessKey: z.string().optional(),
    region: z.string().optional(),
  }).optional(),
}).describe('CDN configuration');

// Backup and retention configuration
const backupConfigSchema = z.object({
  enabled: z.boolean().default(false),
  provider: z.enum(['same', 'aws-s3', 'google-cloud', 'azure-blob']).default('same'),
  schedule: z.string().regex(/^(\d+|\*)\s+(\d+|\*)\s+(\d+|\*)\s+(\d+|\*)\s+(\d+|\*)$/).optional(),
  retention: z.object({
    days: z.number().int().min(1).default(30),
    maxFiles: z.number().int().min(1).default(1000),
    deleteAfterDays: z.number().int().min(1).default(365),
  }).default({}),
  versioning: z.object({
    enabled: z.boolean().default(false),
    maxVersions: z.number().int().min(1).default(5),
  }).default({}),
}).describe('Backup and retention configuration');

// Security configuration
const securityConfigSchema = z.object({
  encryption: z.object({
    enabled: z.boolean().default(false),
    algorithm: z.enum(['AES-256-GCM', 'AES-256-CBC']).default('AES-256-GCM'),
    keyRotation: z.boolean().default(false),
  }).default({}),
  accessControl: z.object({
    publicRead: z.boolean().default(false),
    signedUrls: z.boolean().default(true),
    corsEnabled: z.boolean().default(true),
    allowedOrigins: z.array(z.string()).default(['*']),
    allowedMethods: z.array(z.string()).default(['GET', 'POST', 'PUT', 'DELETE']),
    allowedHeaders: z.array(z.string()).default(['*']),
  }).default({}),
  scanning: z.object({
    antiVirus: z.boolean().default(false),
    malwareDetection: z.boolean().default(false),
    contentModeration: z.boolean().default(false),
  }).default({}),
}).describe('Storage security configuration');

// Main storage configuration schema
export const storageConfigSchema = z.object({
  // Primary storage provider
  provider: StorageProvider.default('local'),
  
  // Provider-specific configurations
  local: localStorageSchema.optional(),
  awsS3: awsS3Schema.optional(),
  googleCloud: googleCloudSchema.optional(),
  azureBlob: azureBlobSchema.optional(),
  digitalOceanSpaces: digitalOceanSpacesSchema.optional(),
  cloudflareR2: cloudflareR2Schema.optional(),
  
  // Upload configuration
  uploads: uploadLimitsSchema.default({}),
  
  // Image processing
  imageProcessing: imageProcessingSchema.default({}),
  
  // CDN configuration
  cdn: cdnConfigSchema.default({}),
  
  // Backup and retention
  backup: backupConfigSchema.default({}),
  
  // Security settings
  security: securityConfigSchema.default({}),
  
  // Storage organization
  organization: z.object({
    strategy: z.enum(['flat', 'date-based', 'user-based', 'type-based']).default('date-based'),
    pathTemplate: z.string().default('{{year}}/{{month}}/{{day}}/{{filename}}'),
    preserveOriginalName: z.boolean().default(false),
    nameConflictResolution: z.enum(['overwrite', 'rename', 'error']).default('rename'),
  }).default({}),
  
  // Cleanup configuration
  cleanup: z.object({
    enabled: z.boolean().default(true),
    orphanedFiles: z.boolean().default(true),
    tempFiles: z.boolean().default(true),
    tempFileMaxAge: z.number().int().min(3600).default(86400), // 24 hours
    schedule: z.string().default('0 2 * * *'), // Daily at 2 AM
  }).default({}),
  
  // Monitoring and logging
  monitoring: z.object({
    enabled: z.boolean().default(true),
    logUploads: z.boolean().default(true),
    logDownloads: z.boolean().default(false),
    logDeletes: z.boolean().default(true),
    metricsCollection: z.boolean().default(true),
    alertOnQuotaLimit: z.boolean().default(true),
    quotaLimitPercentage: z.number().min(0).max(100).default(90),
  }).default({}),
  
}).describe('File storage configuration settings');

// Export types
export type StorageConfig = z.infer<typeof storageConfigSchema>;
export type StorageProvider = z.infer<typeof StorageProvider>;
export type UploadLimits = z.infer<typeof uploadLimitsSchema>;

// Environment-specific storage configurations
export const developmentStorageDefaults: Partial<StorageConfig> = {
  provider: 'local',
  local: {
    uploadPath: './uploads',
    publicPath: '/uploads',
    createDirectories: true,
    generateUniqueFilename: true,
  },
  uploads: {
    maxFileSize: 50 * 1024 * 1024, // 50MB for development
    maxFiles: 20,
    virusScanning: false,
  },
  imageProcessing: {
    enabled: true,
    autoOptimize: false,
    quality: 90,
  },
  cdn: {
    enabled: false,
  },
  backup: {
    enabled: false,
  },
  security: {
    encryption: {
      enabled: false,
    },
    accessControl: {
      publicRead: true,
      signedUrls: false,
    },
    scanning: {
      antiVirus: false,
      malwareDetection: false,
    },
  },
  monitoring: {
    logUploads: true,
    logDownloads: true,
    logDeletes: true,
  },
};

export const productionStorageDefaults: Partial<StorageConfig> = {
  uploads: {
    maxFileSize: 10 * 1024 * 1024, // 10MB for production
    maxFiles: 10,
    virusScanning: true,
  },
  imageProcessing: {
    enabled: true,
    autoOptimize: true,
    quality: 85,
  },
  cdn: {
    enabled: true,
    cacheTtl: 86400 * 7, // 7 days
    purgeOnUpload: true,
  },
  backup: {
    enabled: true,
    schedule: '0 3 * * *', // Daily at 3 AM
    retention: {
      days: 90,
      maxFiles: 10000,
      deleteAfterDays: 365,
    },
    versioning: {
      enabled: true,
      maxVersions: 3,
    },
  },
  security: {
    encryption: {
      enabled: true,
      keyRotation: true,
    },
    accessControl: {
      publicRead: false,
      signedUrls: true,
      corsEnabled: true,
      allowedOrigins: ['https://yourdomain.com'],
    },
    scanning: {
      antiVirus: true,
      malwareDetection: true,
      contentModeration: true,
    },
  },
  cleanup: {
    enabled: true,
    orphanedFiles: true,
    tempFiles: true,
  },
  monitoring: {
    enabled: true,
    logUploads: true,
    logDownloads: false,
    logDeletes: true,
    alertOnQuotaLimit: true,
  },
};

export const testStorageDefaults: Partial<StorageConfig> = {
  provider: 'local',
  local: {
    uploadPath: './test-uploads',
    publicPath: '/test-uploads',
    createDirectories: true,
  },
  uploads: {
    maxFileSize: 1024 * 1024, // 1MB for testing
    maxFiles: 5,
    virusScanning: false,
  },
  imageProcessing: {
    enabled: false,
    engine: 'sharp',
    autoOptimize: false,
    quality: {
      jpeg: 80,
      png: 90,
      webp: 80,
    },
    formats: {
      jpeg: { enabled: true },
      png: { enabled: true },
      webp: { enabled: false },
    },
    thumbnails: {
      enabled: false,
      sizes: [],
    },
    watermark: {
      enabled: false,
    },
  },
  cdn: {
    enabled: false,
    cacheTtl: 86400,
    customHeaders: {},
    purgeOnUpload: false,
  },
  backup: {
    enabled: false,
    provider: 'same',
    retention: {
      maxFiles: 100,
      days: 30,
      deleteAfterDays: 90,
    },
    versioning: {
      enabled: false,
      maxVersions: 5,
    },
  },
  security: {
    encryption: {
      enabled: false,
      algorithm: 'AES-256-GCM',
      keyRotation: false,
    },
    accessControl: {
      publicRead: true,
      signedUrls: false,
      corsEnabled: false,
      allowedOrigins: [],
      allowedMethods: [],
      allowedHeaders: [],
    },
    scanning: {
      antiVirus: false,
      malwareDetection: false,
      contentModeration: false,
    },
  },
  cleanup: {
    enabled: true,
    schedule: '0 0 * * *',
    orphanedFiles: false,
    tempFiles: true,
    tempFileMaxAge: 3600, // 1 hour for tests
  },
  monitoring: {
    enabled: false,
    logUploads: false,
    logDownloads: false,
    logDeletes: false,
    metricsCollection: false,
    alertOnQuotaLimit: false,
    quotaLimitPercentage: 80,
  },
};