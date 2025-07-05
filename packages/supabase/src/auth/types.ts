import type { User, Session } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

export type UserProfile = Database['public']['Tables']['users']['Row'];
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type Membership = Database['public']['Tables']['memberships']['Row'];

export interface AuthUser extends User {
  profile?: UserProfile;
  organizations?: Organization[];
  currentOrganization?: Organization;
  membership?: Membership;
}

export interface AuthSession extends Session {
  user: AuthUser;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends SignInCredentials {
  name?: string;
  organizationName?: string;
}

export interface OAuthProvider {
  provider: 'google' | 'github' | 'gitlab' | 'bitbucket' | 'azure' | 'discord' | 'facebook' | 'twitter';
  redirectTo?: string;
  scopes?: string;
  queryParams?: Record<string, string>;
}

export interface MagicLinkCredentials {
  email: string;
  redirectTo?: string;
}

export interface PhoneCredentials {
  phone: string;
  password?: string;
  channel?: 'sms' | 'whatsapp';
}

export interface AuthError {
  message: string;
  status?: number;
  code?: string;
}

export interface AuthResponse<T = any> {
  data: T | null;
  error: AuthError | null;
}

export interface ResetPasswordCredentials {
  email: string;
  redirectTo?: string;
}

export interface UpdatePasswordCredentials {
  password: string;
  confirmPassword: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  error: AuthError | null;
  signIn: (credentials: SignInCredentials) => Promise<AuthResponse<AuthSession>>;
  signUp: (credentials: SignUpCredentials) => Promise<AuthResponse<AuthSession>>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<AuthResponse<void>>;
  signInWithMagicLink: (credentials: MagicLinkCredentials) => Promise<AuthResponse<void>>;
  signInWithPhone: (credentials: PhoneCredentials) => Promise<AuthResponse<AuthSession>>;
  signOut: () => Promise<AuthResponse<void>>;
  resetPassword: (credentials: ResetPasswordCredentials) => Promise<AuthResponse<void>>;
  updatePassword: (credentials: UpdatePasswordCredentials) => Promise<AuthResponse<AuthUser>>;
  refreshSession: () => Promise<AuthResponse<AuthSession>>;
  switchOrganization: (organizationId: string) => Promise<AuthResponse<void>>;
}