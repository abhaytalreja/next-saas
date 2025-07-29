-- Seed: 001_create_super_admin
-- Description: Create initial super admin user
-- Usage: Replace email with actual admin email before running

-- Insert or update super admin user
-- REPLACE 'admin@nextsaas.com' WITH YOUR ACTUAL ADMIN EMAIL
INSERT INTO users (
  id, 
  email, 
  name, 
  email_verified_at, 
  is_system_admin,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@nextsaas.com', -- CHANGE THIS TO YOUR EMAIL
  'System Administrator',
  NOW(),
  TRUE,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  is_system_admin = TRUE,
  updated_at = NOW();

-- Grant system admin privileges
INSERT INTO system_admins (
  user_id,
  granted_by,
  granted_at,
  permissions,
  metadata
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001', -- Self-granted for initial admin
  NOW(),
  '["admin:access_dashboard", "admin:manage_users", "admin:manage_organizations", "admin:view_analytics", "admin:manage_billing", "admin:manage_email", "admin:manage_security", "admin:view_audit_logs", "admin:manage_system", "admin:manage_settings", "admin:impersonate_users", "admin:manage_features", "admin:view_system_health", "admin:manage_announcements", "admin:export_data", "admin:suspend_users", "admin:delete_organizations"]',
  '{"initial_admin": true, "created_by": "seed_script"}'
) ON CONFLICT (user_id) DO UPDATE SET
  permissions = EXCLUDED.permissions,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- Log the admin creation
INSERT INTO system_admin_audit (
  admin_user_id,
  action,
  target_type,
  target_id,
  details
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'system_admin_created',
  'user',
  '00000000-0000-0000-0000-000000000001',
  '{"method": "seed_script", "initial_admin": true}'
);

-- Output success message
DO $$
BEGIN
  RAISE NOTICE 'Super admin user created successfully!';
  RAISE NOTICE 'Email: admin@nextsaas.com';
  RAISE NOTICE 'Please change the email in this script before running in production!';
END $$;