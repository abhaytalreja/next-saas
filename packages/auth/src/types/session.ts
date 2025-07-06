// Session-related types

export interface SessionInfo {
  id: string;
  userId: string;
  deviceId?: string;
  deviceName?: string;
  browser?: string;
  os?: string;
  ipAddress: string;
  location?: string;
  userAgent: string;
  current: boolean;
  lastActivity: Date;
  expiresAt: Date;
  createdAt: Date;
}

export interface SessionActivity {
  id: string;
  sessionId: string;
  action: string;
  path?: string;
  method?: string;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface CreateSessionData {
  deviceName?: string;
  browser?: string;
  os?: string;
  location?: string;
  persistent?: boolean;
}

export interface SessionSettings {
  maxConcurrentSessions: number;
  sessionTimeout: number; // minutes
  requireReauthForSensitive: boolean;
  logoutOnClose: boolean;
  trackActivity: boolean;
}