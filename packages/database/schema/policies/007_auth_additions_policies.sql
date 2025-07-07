-- RLS Policies for new authentication tables

-- Enable RLS on new tables (if not already enabled)
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_events ENABLE ROW LEVEL SECURITY;

-- Organization Invitations Policies
-- Drop existing policies if they exist to avoid conflicts
DO $$ BEGIN
  DROP POLICY IF EXISTS "Organization admins can view invitations" ON organization_invitations;
  DROP POLICY IF EXISTS "Organization admins can create invitations" ON organization_invitations;
  DROP POLICY IF EXISTS "Anyone with token can view invitation" ON organization_invitations;
  DROP POLICY IF EXISTS "Organization admins can update invitations" ON organization_invitations;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Organization admins can view their org invitations
CREATE POLICY "Organization admins can view invitations" ON organization_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.organization_id = organization_invitations.organization_id
      AND memberships.user_id = auth.uid()
      AND memberships.role IN ('owner', 'admin')
      AND (memberships.status IS NULL OR memberships.status = 'active')
    )
  );

-- Organization admins can create invitations
CREATE POLICY "Organization admins can create invitations" ON organization_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.organization_id = organization_invitations.organization_id
      AND memberships.user_id = auth.uid()
      AND memberships.role IN ('owner', 'admin')
      AND (memberships.status IS NULL OR memberships.status = 'active')
    )
    AND invited_by = auth.uid()
  );

-- Anyone with valid token can view invitation (for acceptance flow)
CREATE POLICY "Anyone with token can view invitation" ON organization_invitations
  FOR SELECT USING (true); -- Token validation happens in application layer

-- Organization admins can update their invitations (cancel, etc)
CREATE POLICY "Organization admins can update invitations" ON organization_invitations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.organization_id = organization_invitations.organization_id
      AND memberships.user_id = auth.uid()
      AND memberships.role IN ('owner', 'admin')
      AND (memberships.status IS NULL OR memberships.status = 'active')
    )
  );

-- Auth Events Policies
-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own auth events" ON auth_events;
  DROP POLICY IF EXISTS "System can insert auth events" ON auth_events;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Users can only view their own auth events
CREATE POLICY "Users can view own auth events" ON auth_events
  FOR SELECT USING (user_id = auth.uid());

-- System can insert auth events (controlled by application)
CREATE POLICY "System can insert auth events" ON auth_events
  FOR INSERT WITH CHECK (true); -- Application handles validation

-- Organization Events Policies
-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Organization members can view events" ON organization_events;
  DROP POLICY IF EXISTS "System can insert organization events" ON organization_events;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Organization members can view their org events
CREATE POLICY "Organization members can view events" ON organization_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.organization_id = organization_events.organization_id
      AND memberships.user_id = auth.uid()
      AND (memberships.status IS NULL OR memberships.status = 'active')
    )
  );

-- System can insert organization events (controlled by application)
CREATE POLICY "System can insert organization events" ON organization_events
  FOR INSERT WITH CHECK (true); -- Application handles validation