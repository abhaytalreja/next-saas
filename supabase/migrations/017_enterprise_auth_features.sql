-- Enterprise Authentication Features Migration
-- Adds SSO configurations, security policies, and related tables

-- SSO Configurations table
CREATE TABLE sso_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('saml', 'oauth')),
  provider_name TEXT NOT NULL,
  metadata JSONB NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, provider_type, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Security Policies table
CREATE TABLE security_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  policy_type TEXT NOT NULL CHECK (
    policy_type IN ('ip_whitelist', 'mfa_enforcement', 'session_timeout', 'password_policy')
  ),
  configuration JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security Events table (for audit logging)
CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (
    event_type IN ('login_attempt', 'mfa_challenge', 'ip_blocked', 'policy_violation', 'suspicious_activity')
  ),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  location JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User MFA Settings table
CREATE TABLE user_mfa_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  backup_codes TEXT[],
  totp_secret TEXT,
  phone_number TEXT,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User Sessions table enhancement for enterprise auth
-- Table already exists, adding enterprise auth specific columns if needed
DO $$ 
BEGIN
  -- Add browser_info column if it doesn't exist (existing table has individual browser columns)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'browser_info') THEN
    ALTER TABLE user_sessions ADD COLUMN browser_info JSONB DEFAULT '{}';
  END IF;
  
  -- Add started_at column if it doesn't exist (map to created_at functionality)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'started_at') THEN
    ALTER TABLE user_sessions ADD COLUMN started_at TIMESTAMPTZ DEFAULT NOW();
    -- Update existing rows to use created_at value
    UPDATE user_sessions SET started_at = created_at WHERE started_at IS NULL;
  END IF;
  
  -- Add is_active column if it doesn't exist (derive from revoked_at)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'is_active') THEN
    ALTER TABLE user_sessions ADD COLUMN is_active BOOLEAN DEFAULT true;
    -- Update existing rows: active if not revoked and not expired
    UPDATE user_sessions SET is_active = (revoked_at IS NULL AND expires_at > NOW());
  END IF;
END $$;

-- SSO Sessions table (for SSO session tracking)
CREATE TABLE sso_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sso_configuration_id UUID NOT NULL REFERENCES sso_configurations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_index TEXT,
  name_id TEXT NOT NULL,
  saml_attributes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  logout_url TEXT
);

-- Organization Settings table enhancement for SSO
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS sso_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enforce_sso BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS security_settings JSONB DEFAULT '{}';

-- Performance indexes
CREATE INDEX idx_sso_configurations_org_id ON sso_configurations(organization_id);
CREATE INDEX idx_sso_configurations_active ON sso_configurations(organization_id, is_active) WHERE is_active = true;
CREATE INDEX idx_security_policies_org_id ON security_policies(organization_id);
CREATE INDEX idx_security_policies_type ON security_policies(organization_id, policy_type);
CREATE INDEX idx_security_policies_active ON security_policies(organization_id, is_active) WHERE is_active = true;
CREATE INDEX idx_security_events_org_id ON security_events(organization_id);
CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_type ON security_events(organization_id, event_type);
CREATE INDEX idx_security_events_severity ON security_events(organization_id, severity);
CREATE INDEX idx_security_events_created_at ON security_events(created_at DESC);
CREATE INDEX idx_user_mfa_settings_user_id ON user_mfa_settings(user_id);
-- Create additional indexes for enterprise auth (skip if they already exist)
CREATE INDEX IF NOT EXISTS idx_user_sessions_enterprise_active ON user_sessions(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_sessions_enterprise_org_id ON user_sessions(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_sso_sessions_user_id ON sso_sessions(user_id);
CREATE INDEX idx_sso_sessions_config_id ON sso_sessions(sso_configuration_id);

-- Enable RLS on all new tables
ALTER TABLE sso_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mfa_settings ENABLE ROW LEVEL SECURITY;
-- Enable RLS on user_sessions if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'user_sessions' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;
ALTER TABLE sso_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for SSO configurations
CREATE POLICY "Organization admins can manage SSO configurations" ON sso_configurations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.organization_id = sso_configurations.organization_id
      AND memberships.user_id = auth.uid()
      AND memberships.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for security policies
CREATE POLICY "Organization admins can manage security policies" ON security_policies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.organization_id = security_policies.organization_id
      AND memberships.user_id = auth.uid()
      AND memberships.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for security events
CREATE POLICY "Organization admins can view security events" ON security_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.organization_id = security_events.organization_id
      AND memberships.user_id = auth.uid()
      AND memberships.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "System can insert security events" ON security_events
  FOR INSERT WITH CHECK (true);

-- RLS Policies for user MFA settings
CREATE POLICY "Users can manage own MFA settings" ON user_mfa_settings
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user sessions (check if they exist first)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_sessions' 
    AND policyname = 'Users can view own sessions'
  ) THEN
    CREATE POLICY "Users can view own sessions" ON user_sessions
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_sessions' 
    AND policyname = 'System can manage user sessions'
  ) THEN
    CREATE POLICY "System can manage user sessions" ON user_sessions
      FOR ALL USING (true);
  END IF;
END $$;

-- RLS Policies for SSO sessions
CREATE POLICY "Users can view own SSO sessions" ON sso_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage SSO sessions" ON sso_sessions
  FOR ALL USING (true);

-- Helper function to check organization membership with roles
CREATE OR REPLACE FUNCTION check_org_membership(org_id UUID, required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM memberships
    WHERE organization_id = org_id
    AND user_id = auth.uid()
    AND role = ANY(required_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_organization_id UUID,
  p_user_id UUID,
  p_event_type TEXT,
  p_severity TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO security_events (
    organization_id,
    user_id,
    event_type,
    severity,
    description,
    metadata,
    ip_address,
    user_agent
  ) VALUES (
    p_organization_id,
    p_user_id,
    p_event_type,
    p_severity,
    p_description,
    p_metadata,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active SSO configuration for organization
CREATE OR REPLACE FUNCTION get_active_sso_config(org_id UUID)
RETURNS sso_configurations AS $$
DECLARE
  config sso_configurations;
BEGIN
  SELECT * INTO config
  FROM sso_configurations
  WHERE organization_id = org_id
  AND is_active = true
  LIMIT 1;
  
  RETURN config;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate unique active SSO configuration per organization
CREATE OR REPLACE FUNCTION validate_single_active_sso()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting a configuration to active, deactivate others
  IF NEW.is_active = true AND (OLD.is_active IS NULL OR OLD.is_active = false) THEN
    UPDATE sso_configurations
    SET is_active = false
    WHERE organization_id = NEW.organization_id
    AND id != NEW.id
    AND is_active = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to ensure only one active SSO configuration per organization
CREATE TRIGGER ensure_single_active_sso
  BEFORE UPDATE ON sso_configurations
  FOR EACH ROW
  EXECUTE FUNCTION validate_single_active_sso();

-- Enhanced function to clean up expired sessions (extends existing function)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  -- Update revoked sessions to match is_active (from existing schema)
  UPDATE user_sessions 
  SET revoked_at = NOW(), revoked_reason = 'timeout'
  WHERE expires_at < NOW() AND revoked_at IS NULL;
  
  -- Also update is_active column for enterprise auth compatibility
  UPDATE user_sessions
  SET is_active = false
  WHERE (expires_at < NOW() OR revoked_at IS NOT NULL)
  AND is_active = true;
  
  -- Clean up old security events (keep 90 days)
  DELETE FROM security_events
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Updated_at triggers for new tables
CREATE TRIGGER update_sso_configurations_updated_at
  BEFORE UPDATE ON sso_configurations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_policies_updated_at
  BEFORE UPDATE ON security_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_mfa_settings_updated_at
  BEFORE UPDATE ON user_mfa_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default security policies for existing organizations
DO $$
DECLARE
  org_record RECORD;
BEGIN
  FOR org_record IN SELECT id FROM organizations LOOP
    -- Insert default password policy
    INSERT INTO security_policies (
      organization_id,
      name,
      description,
      policy_type,
      configuration,
      is_active
    ) VALUES (
      org_record.id,
      'Default Password Policy',
      'Basic password requirements for security',
      'password_policy',
      '{"min_length": 8, "require_uppercase": true, "require_lowercase": true, "require_numbers": true, "require_symbols": false, "prevent_reuse_count": 5}',
      false
    ) ON CONFLICT DO NOTHING;
  END LOOP;
END $$;