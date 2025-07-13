-- Simple fix for activities table RLS - remove all ambiguity
-- Migration: 007_simple_activities_fix
-- Date: 2025-01-12

-- Drop the problematic SELECT policy that has the ambiguous reference
DROP POLICY IF EXISTS "Organization members can view activities" ON activities;

-- Create a much simpler SELECT policy without the problematic check_org_membership call
CREATE POLICY "Users can view their own activities" ON activities
FOR SELECT
TO authenticated
USING (activities.user_id = auth.uid());

-- Create a separate policy for viewing public activities in their organizations
CREATE POLICY "Users can view public org activities" ON activities
FOR SELECT
TO authenticated
USING (
  activities.is_public = true 
  AND EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.organization_id = activities.organization_id
    AND m.user_id = auth.uid()
    AND m.accepted_at IS NOT NULL
  )
);