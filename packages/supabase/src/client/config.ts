import { z } from 'zod';

/**
 * Supabase client configuration schema
 */
export const supabaseConfigSchema = z.object({
  url: z.string().url().startsWith('https://'),
  anonKey: z.string().min(1),
  serviceRoleKey: z.string().min(1).optional(),
  options: z.object({
    auth: z.object({
      autoRefreshToken: z.boolean().default(true),
      persistSession: z.boolean().default(true),
      detectSessionInUrl: z.boolean().default(true),
      flowType: z.enum(['implicit', 'pkce']).default('pkce'),
      storage: z.any().optional(),
      storageKey: z.string().optional(),
    }).optional(),
    db: z.object({
      schema: z.string().default('public'),
    }).optional(),
    global: z.object({
      headers: z.record(z.string()).optional(),
      fetch: z.function().optional(),
    }).optional(),
    realtime: z.object({
      params: z.object({
        eventsPerSecond: z.number().optional(),
      }).optional(),
    }).optional(),
  }).optional(),
});

export type SupabaseConfig = z.infer<typeof supabaseConfigSchema>;

/**
 * Get Supabase configuration from environment variables
 */
export function getSupabaseConfig(): SupabaseConfig {
  const config: SupabaseConfig = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    options: {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'x-application-name': 'nextsaas',
        },
      },
    },
  };

  // Validate configuration
  const parsed = supabaseConfigSchema.safeParse(config);
  if (!parsed.success) {
    console.error('Invalid Supabase configuration:', parsed.error.errors);
    console.error('Current config:', {
      url: config.url ? 'Set' : 'Missing',
      anonKey: config.anonKey ? 'Set' : 'Missing',
      serviceRoleKey: config.serviceRoleKey ? 'Set' : 'Missing',
    });
    throw new Error(`Invalid Supabase configuration: ${JSON.stringify(parsed.error.errors)}`);
  }

  return parsed.data;
}

/**
 * Check if we're running on the server
 */
export const isServer = typeof window === 'undefined';

/**
 * Check if we're in development mode
 */
export const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Check if we're in production mode
 */
export const isProduction = process.env.NODE_ENV === 'production';