-- Force fix the ambiguous user_id reference in activities table RLS policy
-- Migration: 006_force_fix_activities_rls
-- Date: 2025-01-12

-- Completely disable RLS temporarily and recreate all policies from scratch
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Organization members can view activities" ON activities;
DROP POLICY IF EXISTS "Service role has full access to activities" ON activities;
DROP POLICY IF EXISTS "System can create activities" ON activities;

-- Re-enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Recreate policies with explicit table qualification
CREATE POLICY "Service role has full access to activities" ON activities
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "System can create activities" ON activities
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Organization members can view activities" ON activities
FOR SELECT
TO authenticated
USING (
  check_org_membership(activities.organization_id, auth.uid()) 
  AND (
    (activities.is_public = true) 
    OR (activities.user_id = auth.uid())
  )
);