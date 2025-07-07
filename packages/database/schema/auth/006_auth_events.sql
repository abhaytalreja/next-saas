-- Authentication Events for Security Tracking
CREATE TABLE IF NOT EXISTS auth_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_auth_events_user_id ON auth_events(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_events_event_type ON auth_events(event_type);
CREATE INDEX IF NOT EXISTS idx_auth_events_created_at ON auth_events(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_events_user_created ON auth_events(user_id, created_at);

-- Add comments
COMMENT ON TABLE auth_events IS 'Authentication and security events for audit trail';
COMMENT ON COLUMN auth_events.id IS 'Unique event identifier';
COMMENT ON COLUMN auth_events.user_id IS 'User associated with the event (nullable for failed attempts)';
COMMENT ON COLUMN auth_events.event_type IS 'Type of authentication event (login, logout, failed_login, password_reset, etc)';
COMMENT ON COLUMN auth_events.ip_address IS 'IP address where event originated';
COMMENT ON COLUMN auth_events.user_agent IS 'Browser user agent string';
COMMENT ON COLUMN auth_events.metadata IS 'Additional event-specific data';
COMMENT ON COLUMN auth_events.created_at IS 'When the event occurred';