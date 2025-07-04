-- User Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Add comments
COMMENT ON TABLE sessions IS 'Active user sessions for authentication';
COMMENT ON COLUMN sessions.id IS 'Unique session identifier';
COMMENT ON COLUMN sessions.user_id IS 'User who owns this session';
COMMENT ON COLUMN sessions.token IS 'Unique session token';
COMMENT ON COLUMN sessions.ip_address IS 'IP address of the session';
COMMENT ON COLUMN sessions.user_agent IS 'Browser user agent string';
COMMENT ON COLUMN sessions.device_info IS 'Additional device information';
COMMENT ON COLUMN sessions.expires_at IS 'When this session expires';