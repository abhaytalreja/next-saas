// Email types
export * from './email';
export * from './provider';
export * from './template';
export * from './campaign';
export * from './analytics';
export * from './subscription';

// Re-export commonly used types for convenience
export type {
  EmailData,
  EmailResult,
  EmailProvider,
  TemplateProps,
  OrganizationBranding,
  TemplateContent,
  TemplateRecipient,
} from './email';

export type {
  EmailProviderConfig,
  EmailProviderFeatures,
  ProviderName,
} from './provider';

export type {
  TemplateMetadata,
  TemplateCategory,
  TemplateVariable,
} from './template';