// User-related types extending the core auth types

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  emailNotifications: EmailNotificationSettings;
  pushNotifications: PushNotificationSettings;
}

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

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

export interface UserStats {
  totalLogins: number;
  lastLogin: Date;
  sessionCount: number;
  averageSessionDuration: number;
  totalTimeSpent: number;
  organizationsCount: number;
  projectsCount: number;
}

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