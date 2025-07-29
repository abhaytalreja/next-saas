-- Migration: 022_add_super_admin_system
-- Description: Add super admin role and system admin functionality
-- Created: 2024-01-22

-- Add system_admin column to users table for flagging super admins
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_system_admin BOOLEAN DEFAULT FALSE;

-- Create index for system admin lookup
CREATE INDEX IF NOT EXISTS idx_users_is_system_admin ON users(is_system_admin) WHERE is_system_admin = TRUE;

-- Create system_admins table for additional admin metadata
CREATE TABLE IF NOT EXISTS system_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE,
  permissions JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Create indexes for system_admins
CREATE INDEX idx_system_admins_user_id ON system_admins(user_id);
CREATE INDEX idx_system_admins_granted_by ON system_admins(granted_by);
CREATE INDEX idx_system_admins_revoked_at ON system_admins(revoked_at) WHERE revoked_at IS NULL;

-- Add comments
COMMENT ON COLUMN users.is_system_admin IS 'Flag indicating if user has system admin privileges';
COMMENT ON TABLE system_admins IS 'System administrators with platform-wide access';
COMMENT ON COLUMN system_admins.user_id IS 'User who has system admin privileges';
COMMENT ON COLUMN system_admins.granted_by IS 'User who granted the admin privileges';
COMMENT ON COLUMN system_admins.granted_at IS 'When admin privileges were granted';
COMMENT ON COLUMN system_admins.revoked_at IS 'When admin privileges were revoked (null if active)';
COMMENT ON COLUMN system_admins.permissions IS 'Additional admin permissions';
COMMENT ON COLUMN system_admins.metadata IS 'Additional admin metadata';

-- Create system admin audit table
CREATE TABLE IF NOT EXISTS system_admin_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for system admin audit
CREATE INDEX idx_system_admin_audit_admin_user_id ON system_admin_audit(admin_user_id);
CREATE INDEX idx_system_admin_audit_action ON system_admin_audit(action);
CREATE INDEX idx_system_admin_audit_target ON system_admin_audit(target_type, target_id);
CREATE INDEX idx_system_admin_audit_created_at ON system_admin_audit(created_at);

-- Add comments
COMMENT ON TABLE system_admin_audit IS 'Audit log for all system admin actions';
COMMENT ON COLUMN system_admin_audit.admin_user_id IS 'System admin who performed the action';
COMMENT ON COLUMN system_admin_audit.action IS 'Action performed (e.g., user_suspended, org_deleted)';
COMMENT ON COLUMN system_admin_audit.target_type IS 'Type of target (user, organization, etc.)';
COMMENT ON COLUMN system_admin_audit.target_id IS 'ID of the target entity';
COMMENT ON COLUMN system_admin_audit.details IS 'Additional action details';

-- Create function to check if user is system admin
CREATE OR REPLACE FUNCTION is_system_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users u 
    JOIN system_admins sa ON u.id = sa.user_id 
    WHERE u.id = user_uuid 
    AND u.is_system_admin = TRUE 
    AND sa.revoked_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log system admin actions
CREATE OR REPLACE FUNCTION log_system_admin_action(
  admin_id UUID,
  action_name VARCHAR,
  target_type VARCHAR DEFAULT NULL,
  target_id UUID DEFAULT NULL,
  action_details JSONB DEFAULT '{}',
  ip_addr INET DEFAULT NULL,
  user_agent_str TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO system_admin_audit (
    admin_user_id,
    action,
    target_type,
    target_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    admin_id,
    action_name,
    target_type,
    target_id,
    action_details,
    ip_addr,
    user_agent_str
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for system_admins table
ALTER TABLE system_admins ENABLE ROW LEVEL SECURITY;

-- Only system admins can view system admin records
CREATE POLICY "system_admins_select_policy" ON system_admins
  FOR SELECT USING (is_system_admin(auth.uid()));

-- Only existing system admins can manage other system admins
CREATE POLICY "system_admins_insert_policy" ON system_admins
  FOR INSERT WITH CHECK (is_system_admin(auth.uid()));

CREATE POLICY "system_admins_update_policy" ON system_admins
  FOR UPDATE USING (is_system_admin(auth.uid()));

-- RLS Policies for system_admin_audit table
ALTER TABLE system_admin_audit ENABLE ROW LEVEL SECURITY;

-- Only system admins can view audit logs
CREATE POLICY "system_admin_audit_select_policy" ON system_admin_audit
  FOR SELECT USING (is_system_admin(auth.uid()));

-- System can insert audit records (triggers, functions)
CREATE POLICY "system_admin_audit_insert_policy" ON system_admin_audit
  FOR INSERT WITH CHECK (true);

-- Grant permissions to authenticated users
GRANT SELECT ON system_admins TO authenticated;
GRANT INSERT, UPDATE ON system_admins TO authenticated;
GRANT SELECT ON system_admin_audit TO authenticated;
GRANT INSERT ON system_admin_audit TO authenticated;
GRANT EXECUTE ON FUNCTION is_system_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION log_system_admin_action(UUID, VARCHAR, VARCHAR, UUID, JSONB, INET, TEXT) TO authenticated;