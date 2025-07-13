-- Create missing organization_events table
-- This table was defined in the original migration but appears to be missing

CREATE TABLE organization_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX idx_organization_events_organization_id ON organization_events(organization_id);
CREATE INDEX idx_organization_events_user_id ON organization_events(user_id);
CREATE INDEX idx_organization_events_event_type ON organization_events(event_type);
CREATE INDEX idx_organization_events_created_at ON organization_events(created_at);

-- Enable RLS
ALTER TABLE organization_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_events
-- Users can view events for organizations they belong to
CREATE POLICY "Users can view organization events" ON organization_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.organization_id = organization_events.organization_id
      AND m.user_id = auth.uid()
      AND m.accepted_at IS NOT NULL
    )
  );

-- Admins and owners can insert organization events
CREATE POLICY "Admins can create organization events" ON organization_events
  FOR INSERT WITH CHECK (
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
  FOR ALL USING (true);