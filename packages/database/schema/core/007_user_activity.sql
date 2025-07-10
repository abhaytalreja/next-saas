-- User Activity Tracking Table
-- Stores user activity logs for security, analytics, and audit purposes

CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Activity Details
  action VARCHAR(100) NOT NULL, -- e.g., 'login', 'logout', 'profile_update', 'password_change'
  resource VARCHAR(100), -- e.g., 'profile', 'organization', 'project'
  resource_id UUID, -- ID of the affected resource
  
  -- Activity Context
  description TEXT, -- Human-readable description of the action
  metadata JSONB DEFAULT '{}', -- Additional context data
  
  -- Security & Tracking
  ip_address INET,
  user_agent TEXT,
  device_type VARCHAR(20), -- 'desktop', 'mobile', 'tablet'
  browser VARCHAR(50),
  os VARCHAR(50),
  location_country VARCHAR(2), -- ISO country code
  location_city VARCHAR(100),
  
  -- Session Context
  session_id VARCHAR(255),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  
  -- Status & Results
  status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failure', 'pending')),
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days')
);

-- Create indexes for performance and common queries
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_action ON user_activity(action);
CREATE INDEX idx_user_activity_created_at ON user_activity(created_at);
CREATE INDEX idx_user_activity_user_action ON user_activity(user_id, action);
CREATE INDEX idx_user_activity_user_created ON user_activity(user_id, created_at DESC);
CREATE INDEX idx_user_activity_session_id ON user_activity(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_user_activity_expires_at ON user_activity(expires_at);
CREATE INDEX idx_user_activity_ip_address ON user_activity(ip_address) WHERE ip_address IS NOT NULL;

-- Composite indexes for common filter patterns
CREATE INDEX idx_user_activity_user_resource ON user_activity(user_id, resource, created_at DESC);
CREATE INDEX idx_user_activity_org_created ON user_activity(organization_id, created_at DESC) WHERE organization_id IS NOT NULL;

-- Partial indexes for security monitoring
CREATE INDEX idx_user_activity_failed_logins ON user_activity(user_id, created_at DESC) 
  WHERE action = 'login' AND status = 'failure';
CREATE INDEX idx_user_activity_security_events ON user_activity(user_id, action, created_at DESC)
  WHERE action IN ('login', 'logout', 'password_change', 'email_change', 'two_factor_enable', 'two_factor_disable');

-- Add automatic cleanup for old activity records
CREATE OR REPLACE FUNCTION cleanup_expired_user_activity()
RETURNS void AS $$
BEGIN
  DELETE FROM user_activity WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE user_activity IS 'User activity logs for security monitoring and audit trails';
COMMENT ON COLUMN user_activity.user_id IS 'User who performed the action';
COMMENT ON COLUMN user_activity.action IS 'Type of action performed (login, profile_update, etc.)';
COMMENT ON COLUMN user_activity.resource IS 'Type of resource affected by the action';
COMMENT ON COLUMN user_activity.resource_id IS 'ID of the specific resource affected';
COMMENT ON COLUMN user_activity.metadata IS 'Additional context data in JSON format';
COMMENT ON COLUMN user_activity.ip_address IS 'IP address from which the action was performed';
COMMENT ON COLUMN user_activity.user_agent IS 'Browser user agent string';
COMMENT ON COLUMN user_activity.session_id IS 'Session identifier for grouping related activities';
COMMENT ON COLUMN user_activity.expires_at IS 'When this activity record should be automatically deleted';
COMMENT ON FUNCTION cleanup_expired_user_activity() IS 'Removes expired activity records to manage storage';