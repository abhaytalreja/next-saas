-- Fix RLS policy that causes permission denied for auth.users table access
-- The issue is that the policy references auth.users which may not be accessible during INSERT operations

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view invitations sent to them" ON organization_invitations;

-- Recreate it with a safer approach that doesn't reference auth.users in the qualification
-- Instead, we'll use auth.jwt() to get the user's email directly
CREATE POLICY "Users can view invitations sent to them" ON organization_invitations
  FOR SELECT USING (
    email = (auth.jwt() ->> 'email')::text
  );

-- Also ensure that the INSERT policy doesn't have issues with auth.users access
-- The existing INSERT policy should work fine, but let's make sure the qualification is correct
-- We don't need to change it since it only references the memberships table