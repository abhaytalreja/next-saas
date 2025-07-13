-- Fix RLS policies for organization_events to use correct roles
-- The policies were created with {public} instead of {authenticated}

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view organization events" ON organization_events;
DROP POLICY IF EXISTS "Admins can create organization events" ON organization_events;
DROP POLICY IF EXISTS "Service role has full access to organization events" ON organization_events;

-- Recreate with correct roles
-- Users can view events for organizations they belong to
CREATE POLICY "Users can view organization events" ON organization_events
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.organization_id = organization_events.organization_id
      AND m.user_id = auth.uid()
      AND m.accepted_at IS NOT NULL
    )
  );

-- Admins and owners can insert organization events
CREATE POLICY "Admins can create organization events" ON organization_events
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.organization_id = organization_events.organization_id
      AND m.user_id = auth.uid()
      AND m.role IN ('admin', 'owner')
      AND m.accepted_at IS NOT NULL
    )
  );

-- Service role has full access
CREATE POLICY "Service role has full access to organization events" ON organization_events
  FOR ALL TO service_role USING (true);