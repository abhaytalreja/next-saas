-- User Sessions and Devices Table
-- Tracks active user sessions and device information for security

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Session Information
  session_token VARCHAR(255) UNIQUE NOT NULL,
  refresh_token VARCHAR(255),
  
  -- Device Information
  device_name VARCHAR(255), -- User-defined device name
  device_type VARCHAR(20) NOT NULL CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  device_fingerprint VARCHAR(255), -- Unique device identifier
  
  -- Browser & OS Information
  browser VARCHAR(50),
  browser_version VARCHAR(20),
  os VARCHAR(50),
  os_version VARCHAR(20),
  user_agent TEXT,
  
  -- Network Information
  ip_address INET NOT NULL,
  location_country VARCHAR(2), -- ISO country code
  location_region VARCHAR(100),
  location_city VARCHAR(100),
  isp VARCHAR(255),
  
  -- Security Information
  is_trusted BOOLEAN DEFAULT false,
  is_current BOOLEAN DEFAULT false, -- Current active session
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Session Management
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_reason VARCHAR(100), -- 'user_logout', 'security_breach', 'admin_action', 'timeout'
  
  -- Organization Context
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  organization_role VARCHAR(50),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for session management and security
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_active ON user_sessions(user_id, last_activity_at DESC) WHERE revoked_at IS NULL;
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_ip_address ON user_sessions(ip_address);
CREATE INDEX idx_user_sessions_device_fingerprint ON user_sessions(device_fingerprint) WHERE device_fingerprint IS NOT NULL;
CREATE INDEX idx_user_sessions_trusted ON user_sessions(user_id, is_trusted) WHERE is_trusted = true;

-- Composite indexes for security monitoring
CREATE INDEX idx_user_sessions_suspicious ON user_sessions(user_id, ip_address, created_at DESC);
CREATE INDEX idx_user_sessions_concurrent ON user_sessions(user_id, created_at DESC) WHERE revoked_at IS NULL;

-- Add trigger for updated_at
CREATE TRIGGER trigger_user_sessions_updated_at
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  UPDATE user_sessions 
  SET revoked_at = NOW(), revoked_reason = 'timeout'
  WHERE expires_at < NOW() AND revoked_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to limit concurrent sessions per user
CREATE OR REPLACE FUNCTION enforce_session_limit()
RETURNS TRIGGER AS $$
DECLARE
  max_sessions INTEGER := 10; -- Maximum concurrent sessions per user
  session_count INTEGER;
BEGIN
  -- Count active sessions for this user
  SELECT COUNT(*) INTO session_count
  FROM user_sessions
  WHERE user_id = NEW.user_id 
    AND revoked_at IS NULL 
    AND expires_at > NOW();
  
  -- If limit exceeded, revoke oldest sessions
  IF session_count >= max_sessions THEN
    UPDATE user_sessions
    SET revoked_at = NOW(), revoked_reason = 'session_limit_exceeded'
    WHERE id IN (
      SELECT id FROM user_sessions
      WHERE user_id = NEW.user_id 
        AND revoked_at IS NULL 
        AND expires_at > NOW()
        AND id != NEW.id
      ORDER BY last_activity_at ASC
      LIMIT (session_count - max_sessions + 1)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce session limits
CREATE TRIGGER trigger_enforce_session_limit
  AFTER INSERT ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION enforce_session_limit();

-- User Devices Summary View (for device management UI)
CREATE VIEW user_devices_summary AS
SELECT 
  user_id,
  device_fingerprint,
  device_name,
  device_type,
  browser,
  os,
  location_city,
  location_country,
  is_trusted,
  COUNT(*) as session_count,
  MAX(last_activity_at) as last_seen,
  MAX(created_at) as first_seen,
  BOOL_OR(is_current) as has_current_session
FROM user_sessions
WHERE revoked_at IS NULL AND expires_at > NOW()
GROUP BY user_id, device_fingerprint, device_name, device_type, browser, os, location_city, location_country, is_trusted;

-- Add comments
COMMENT ON TABLE user_sessions IS 'Active user sessions and device tracking for security';
COMMENT ON COLUMN user_sessions.session_token IS 'Unique session identifier token';
COMMENT ON COLUMN user_sessions.device_fingerprint IS 'Unique identifier for the device';
COMMENT ON COLUMN user_sessions.is_trusted IS 'Whether this device is marked as trusted';
COMMENT ON COLUMN user_sessions.is_current IS 'Whether this is the current active session';
COMMENT ON COLUMN user_sessions.revoked_reason IS 'Reason why the session was revoked';
COMMENT ON VIEW user_devices_summary IS 'Summary view of user devices for management UI';
COMMENT ON FUNCTION cleanup_expired_sessions() IS 'Marks expired sessions as revoked';
COMMENT ON FUNCTION enforce_session_limit() IS 'Enforces maximum concurrent sessions per user';