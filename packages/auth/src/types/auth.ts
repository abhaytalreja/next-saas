import type { User, Session } from '@supabase/supabase-js';

// Core Authentication Types
export interface AuthUser extends User {
  user_metadata: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    avatar_url?: string;
    provider?: string;
    email_verified?: boolean;
    bio?: string;
    phone?: string;
    website?: string;
    timezone?: string;
    locale?: string;
  };
  app_metadata: {
    provider?: string;
    providers?: string[];
    role?: string;
  };
}

export interface AuthSession extends Session {
  user: AuthUser;
}

export interface AuthError {
  message: string;
  status?: number;
  code?: string;
}

export interface AuthResponse<T> {
  data: T | null;
  error: AuthError | null;
}

// Credential Types
export interface SignInCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

export interface ResetPasswordCredentials {
  email: string;
  redirectTo?: string;
}

export interface UpdatePasswordCredentials {
  password: string;
  confirmPassword: string;
}

export interface MagicLinkCredentials {
  email: string;
  redirectTo?: string;
}

export interface PhoneCredentials {
  phone: string;
  password?: string;
  token?: string;
}

// OAuth Types
export type OAuthProvider = 'google' | 'github' | 'microsoft' | 'apple' | 'discord' | 'twitter';

export interface OAuthCredentials {
  provider: OAuthProvider;
  redirectTo?: string;
  scopes?: string;
  queryParams?: Record<string, string>;
}

// Profile Types
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl?: string;
  timezone: string;
  locale: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  timezone?: string;
  locale?: string;
  bio?: string;
  phone?: string;
  website?: string;
}

// Security Types
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  backupCodes: string[];
  sessions: ActiveSession[];
  loginHistory: LoginAttempt[];
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location?: string;
  current: boolean;
  lastActive: Date;
  createdAt: Date;
}

export interface LoginAttempt {
  id: string;
  ip: string;
  userAgent: string;
  success: boolean;
  reason?: string;
  location?: string;
  createdAt: Date;
}

// Two-Factor Authentication
export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFactorCredentials {
  token: string;
  backupCode?: string;
}

// Invitation Types
export interface UserInvitation {
  id: string;
  email: string;
  organizationId: string;
  organizationName: string;
  role: string;
  invitedBy: string;
  expiresAt: Date;
  createdAt: Date;
  acceptedAt?: Date;
  token: string;
}

export interface InviteUserData {
  email: string;
  role: string;
  organizationId: string;
  redirectTo?: string;
}

// Permission Types
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  organizationId?: string;
  isSystem: boolean;
}

// Auth Context Types
export interface AuthContextValue {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  error: AuthError | null;
  signIn: (credentials: SignInCredentials) => Promise<AuthResponse<AuthSession>>;
  signUp: (credentials: SignUpCredentials) => Promise<AuthResponse<AuthSession>>;
  signInWithOAuth: (credentials: OAuthCredentials) => Promise<AuthResponse<void>>;
  signInWithMagicLink: (credentials: MagicLinkCredentials) => Promise<AuthResponse<void>>;
  signInWithPhone: (credentials: PhoneCredentials) => Promise<AuthResponse<AuthSession>>;
  signOut: () => Promise<AuthResponse<void>>;
  resetPassword: (credentials: ResetPasswordCredentials) => Promise<AuthResponse<void>>;
  updatePassword: (credentials: UpdatePasswordCredentials) => Promise<AuthResponse<void>>;
  updateProfile: (data: UpdateProfileData) => Promise<AuthResponse<UserProfile>>;
  refreshSession: () => Promise<AuthResponse<AuthSession>>;
  resendVerification: () => Promise<AuthResponse<void>>;
  verifyEmail: (token: string) => Promise<AuthResponse<void>>;
}

// Route Protection Types
export interface RouteProtectionConfig {
  requireAuth?: boolean;
  requireEmailVerification?: boolean;
  requireRole?: string | string[];
  requirePermission?: string | string[];
  redirectTo?: string;
  fallback?: React.ComponentType;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  config?: RouteProtectionConfig;
  fallback?: React.ComponentType;
  loading?: React.ComponentType;
}

// Session Management Types
export interface SessionConfig {
  autoRefresh?: boolean;
  refreshThreshold?: number; // minutes before expiry
  maxRetries?: number;
  storage?: 'localStorage' | 'sessionStorage' | 'cookie';
}

export interface SessionState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  error: AuthError | null;
  lastActivity: Date | null;
  expiresAt: Date | null;
}

// Middleware Types
export interface MiddlewareConfig {
  publicRoutes: string[];
  protectedRoutes: string[];
  authRoutes: string[];
  adminRoutes: string[];
  callbackUrl: string;
  loginUrl: string;
  unauthorizedUrl: string;
}

// Event Types
export type AuthEvent = 
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'PASSWORD_RECOVERY'
  | 'EMAIL_VERIFIED'
  | 'PHONE_VERIFIED';

export interface AuthEventHandler {
  (event: AuthEvent, session: AuthSession | null): void | Promise<void>;
}

// Analytics Types
export interface AuthAnalytics {
  event: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface AuthMetrics {
  totalUsers: number;
  activeUsers: number;
  signupsToday: number;
  loginAttemptsToday: number;
  failedLoginsToday: number;
  averageSessionDuration: number;
}