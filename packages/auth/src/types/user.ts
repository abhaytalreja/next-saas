// User-related types extending the core auth types

// Enhanced User Profile Interface
export interface UserProfile {
  // Basic Information
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  email: string;
  avatar_url?: string;
  
  // Contact Information
  phone?: string;
  website?: string;
  bio?: string;
  location?: string;
  timezone: string;
  locale: string;
  
  // Professional Information
  job_title?: string;
  company?: string;
  department?: string;
  
  // System Fields
  email_verified_at?: string;
  last_seen_at?: string;
  current_organization_id?: string;
  metadata?: Record<string, any>;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// Comprehensive User Preferences
export interface UserPreferences {
  id: string;
  user_id: string;
  
  // Theme & Appearance
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  date_format: string;
  time_format: '12h' | '24h';
  
  // Email Notifications
  email_notifications_enabled: boolean;
  email_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  email_digest: boolean;
  
  // Notification Types
  notify_security_alerts: boolean;
  notify_account_updates: boolean;
  notify_organization_updates: boolean;
  notify_project_updates: boolean;
  notify_mentions: boolean;
  notify_comments: boolean;
  notify_invitations: boolean;
  notify_billing_alerts: boolean;
  notify_feature_announcements: boolean;
  
  // Push Notifications
  browser_notifications_enabled: boolean;
  desktop_notifications_enabled: boolean;
  mobile_notifications_enabled: boolean;
  
  // Marketing & Communication
  marketing_emails: boolean;
  product_updates: boolean;
  newsletters: boolean;
  surveys: boolean;
  
  // Privacy Settings
  profile_visibility: 'public' | 'organization' | 'private';
  email_visibility: 'public' | 'organization' | 'private';
  activity_visibility: 'public' | 'organization' | 'private';
  hide_last_seen: boolean;
  hide_activity_status: boolean;
  
  // Advanced Settings
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone_aware: boolean;
  
  // Accessibility
  reduce_motion: boolean;
  high_contrast: boolean;
  screen_reader_optimized: boolean;
  
  // Data & Privacy
  data_retention_period: number;
  auto_delete_inactive: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// Legacy interfaces for backward compatibility
export interface EmailNotificationSettings {
  marketing: boolean;
  productUpdates: boolean;
  securityAlerts: boolean;
  organizationInvites: boolean;
  projectUpdates: boolean;
  weeklyDigest: boolean;
}

export interface PushNotificationSettings {
  enabled: boolean;
  mentions: boolean;
  messages: boolean;
  reminders: boolean;
  securityAlerts: boolean;
}

// Enhanced User Activity Interface
export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  resource?: string;
  resource_id?: string;
  description?: string;
  metadata?: Record<string, any>;
  
  // Security & Tracking
  ip_address?: string;
  user_agent?: string;
  device_type?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
  location_country?: string;
  location_city?: string;
  
  // Session Context
  session_id?: string;
  organization_id?: string;
  
  // Status & Results
  status: 'success' | 'failure' | 'pending';
  error_message?: string;
  
  // Timestamps
  created_at: string;
  expires_at?: string;
}

// User Session Management
export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  refresh_token?: string;
  
  // Device Information
  device_name?: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  device_fingerprint?: string;
  
  // Browser & OS Information
  browser?: string;
  browser_version?: string;
  os?: string;
  os_version?: string;
  user_agent?: string;
  
  // Network Information
  ip_address: string;
  location_country?: string;
  location_region?: string;
  location_city?: string;
  isp?: string;
  
  // Security Information
  is_trusted: boolean;
  is_current: boolean;
  last_activity_at: string;
  
  // Session Management
  expires_at: string;
  revoked_at?: string;
  revoked_reason?: string;
  
  // Organization Context
  organization_id?: string;
  organization_role?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// User Avatar Management
export interface UserAvatar {
  id: string;
  user_id: string;
  
  // Storage Information
  storage_path: string;
  storage_bucket: string;
  public_url?: string;
  
  // File Information
  original_filename?: string;
  file_size: number;
  mime_type: string;
  width?: number;
  height?: number;
  
  // Image Processing
  is_processed: boolean;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_error?: string;
  
  // Variants/Sizes
  variants: Record<string, string>;
  
  // Status & Moderation
  is_active: boolean;
  is_approved: boolean;
  moderation_notes?: string;
  
  // Security & Validation
  file_hash?: string;
  virus_scan_status: 'pending' | 'clean' | 'infected' | 'failed';
  virus_scan_result?: string;
  
  // Metadata
  uploaded_via: string;
  upload_session_id?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

// Enhanced User Stats
export interface UserStats {
  total_logins: number;
  last_login?: string;
  session_count: number;
  average_session_duration: number;
  total_time_spent: number;
  organizations_count: number;
  projects_count: number;
  avatar_uploads: number;
  profile_completeness: number;
  security_score: number;
}

// Legacy Device interface for backward compatibility
export interface UserDevice {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  lastSeen: Date;
  trusted: boolean;
  current: boolean;
}

// Device Summary from database view
export interface UserDeviceSummary {
  user_id: string;
  device_fingerprint?: string;
  device_name?: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
  location_city?: string;
  location_country?: string;
  is_trusted: boolean;
  session_count: number;
  last_seen: string;
  first_seen: string;
  has_current_session: boolean;
}

// Form interfaces for profile management
export interface ProfileFormData {
  first_name: string;
  last_name: string;
  display_name?: string;
  bio?: string;
  phone?: string;
  website?: string;
  job_title?: string;
  company?: string;
  department?: string;
  location?: string;
  timezone: string;
  locale: string;
}

export interface PreferencesFormData {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  date_format: string;
  time_format: '12h' | '24h';
  profile_visibility: 'public' | 'organization' | 'private';
  email_notifications_enabled: boolean;
  email_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

export interface NotificationPreferencesFormData {
  notify_security_alerts: boolean;
  notify_account_updates: boolean;
  notify_organization_updates: boolean;
  notify_project_updates: boolean;
  notify_mentions: boolean;
  notify_comments: boolean;
  notify_invitations: boolean;
  notify_billing_alerts: boolean;
  notify_feature_announcements: boolean;
  browser_notifications_enabled: boolean;
  desktop_notifications_enabled: boolean;
  mobile_notifications_enabled: boolean;
  marketing_emails: boolean;
  product_updates: boolean;
  newsletters: boolean;
  surveys: boolean;
}

// Avatar upload interfaces
export interface AvatarUploadOptions {
  maxSize: number;
  allowedTypes: string[];
  quality: number;
  outputSize: number;
}

export interface AvatarUploadResult {
  success: boolean;
  avatar?: UserAvatar;
  error?: string;
}

// Data export interfaces
export interface UserDataExport {
  profile: UserProfile;
  preferences: UserPreferences;
  activity: UserActivity[];
  sessions: UserSession[];
  avatars: UserAvatar[];
  exported_at: string;
  export_version: string;
}

// API response interfaces
export interface ProfileUpdateResponse {
  success: boolean;
  profile?: UserProfile;
  error?: string;
}

export interface PreferencesUpdateResponse {
  success: boolean;
  preferences?: UserPreferences;
  error?: string;
}

export interface ActivityLogResponse {
  activities: UserActivity[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}