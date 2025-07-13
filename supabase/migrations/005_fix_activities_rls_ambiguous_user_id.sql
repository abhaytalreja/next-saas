-- Fix ambiguous user_id reference in activities table RLS policy
-- Migration: 005_fix_activities_rls_ambiguous_user_id
-- Date: 2025-01-12

-- Drop the problematic RLS policy
DROP POLICY IF EXISTS "Organization members can view activities" ON activities;

-- Recreate the policy with explicit table qualification to avoid ambiguous reference
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

-- Also make sure the INSERT policy doesn't have issues
DROP POLICY IF EXISTS "System can create activities" ON activities;

CREATE POLICY "System can create activities" ON activities
FOR INSERT
TO authenticated
WITH CHECK (true);