// Re-export from supabase package for convenience
export { 
  getSupabaseBrowserClient as getSupabase,
  useAuth,
  useSession,
} from '@next-saas/supabase/client'

export function useSupabase() {
  const { getSupabaseBrowserClient } = require('@next-saas/supabase/client')
  const { useAuth } = require('@next-saas/supabase/client')
  
  const supabase = getSupabaseBrowserClient()
  const { user } = useAuth()
  
  return { supabase, user }
}