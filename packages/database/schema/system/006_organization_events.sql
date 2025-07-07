-- Organization Events for audit and activity tracking
CREATE TABLE IF NOT EXISTS organization_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(100) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_organization_events_organization_id ON organization_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_events_user_id ON organization_events(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_events_event_type ON organization_events(event_type);
CREATE INDEX IF NOT EXISTS idx_organization_events_created_at ON organization_events(created_at);
CREATE INDEX IF NOT EXISTS idx_organization_events_org_created ON organization_events(organization_id, created_at);

-- Add comments
COMMENT ON TABLE organization_events IS 'Track important events within organizations';
COMMENT ON COLUMN organization_events.id IS 'Unique event identifier';
COMMENT ON COLUMN organization_events.organization_id IS 'Organization where event occurred';
COMMENT ON COLUMN organization_events.user_id IS 'User who triggered the event (nullable for system events)';
COMMENT ON COLUMN organization_events.event_type IS 'Type of event (member_added, member_removed, settings_updated, etc)';
COMMENT ON COLUMN organization_events.metadata IS 'Event-specific data and context';
COMMENT ON COLUMN organization_events.created_at IS 'When the event occurred';