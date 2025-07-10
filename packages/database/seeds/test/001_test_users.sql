-- E2E Test User Seeds
-- These users are specifically designed for E2E testing with Mailinator emails

-- Clear existing test data first
DELETE FROM users WHERE email LIKE '%@mailinator.com';

-- Core E2E Test Users with Mailinator emails
INSERT INTO users (id, email, email_verified_at, name, avatar_url, timezone, locale, metadata, created_at, updated_at) VALUES
  -- Admin Users
  ('10000000-0000-0000-0000-000000000001', 'next-saas-admin@mailinator.com', NOW(), 'Admin User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 'UTC', 'en', '{"role": "admin", "test_account": true}', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000002', 'next-saas-org-admin@mailinator.com', NOW(), 'Org Admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=orgadmin', 'America/New_York', 'en', '{"role": "org_admin", "test_account": true}', NOW(), NOW()),
  
  -- Regular Users  
  ('10000000-0000-0000-0000-000000000003', 'next-saas-user@mailinator.com', NOW(), 'Test User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user', 'America/New_York', 'en', '{"role": "user", "test_account": true}', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000004', 'next-saas-multi@mailinator.com', NOW(), 'Multi Org User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=multi', 'Europe/London', 'en', '{"role": "user", "test_account": true}', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000005', 'next-saas-mobile@mailinator.com', NOW(), 'Mobile User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mobile', 'America/Los_Angeles', 'en', '{"role": "user", "test_account": true, "mobile_optimized": true}', NOW(), NOW()),
  
  -- Edge Case Users
  ('10000000-0000-0000-0000-000000000006', 'next-saas-pending@mailinator.com', NULL, 'Pending User', NULL, 'UTC', 'en', '{"role": "user", "test_account": true, "verification_pending": true}', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000007', 'next-saas-incomplete@mailinator.com', NOW(), 'Incomplete User', NULL, 'UTC', 'en', '{"role": "user", "test_account": true, "profile_incomplete": true}', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000008', 'next-saas-gdpr@mailinator.com', NOW(), 'GDPR Test User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=gdpr', 'Europe/Berlin', 'de', '{"role": "user", "test_account": true, "gdpr_test": true}', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000009', 'next-saas-deleted@mailinator.com', NOW(), 'Deleted User', NULL, 'UTC', 'en', '{"role": "user", "test_account": true, "deletion_requested": true}', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000010', 'next-saas-locked@mailinator.com', NOW(), 'Locked User', NULL, 'UTC', 'en', '{"role": "user", "test_account": true, "account_locked": true}', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  email_verified_at = EXCLUDED.email_verified_at,
  name = EXCLUDED.name,
  avatar_url = EXCLUDED.avatar_url,
  timezone = EXCLUDED.timezone,
  locale = EXCLUDED.locale,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- User Preferences for Test Users
INSERT INTO user_preferences (user_id, theme, notifications, language, privacy_settings, accessibility, created_at, updated_at) VALUES
  ('10000000-0000-0000-0000-000000000001', 'dark', '{"email": true, "push": true, "security": true}', 'en', '{"profile_public": false, "activity_tracking": true}', '{"high_contrast": false, "reduce_motion": false}', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000002', 'light', '{"email": true, "push": true, "security": true}', 'en', '{"profile_public": true, "activity_tracking": true}', '{"high_contrast": false, "reduce_motion": false}', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000003', 'system', '{"email": true, "push": false, "security": true}', 'en', '{"profile_public": true, "activity_tracking": true}', '{"high_contrast": false, "reduce_motion": false}', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000004', 'light', '{"email": true, "push": true, "security": true}', 'en', '{"profile_public": true, "activity_tracking": true}', '{"high_contrast": false, "reduce_motion": false}', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000005', 'dark', '{"email": false, "push": true, "security": true}', 'en', '{"profile_public": true, "activity_tracking": true}', '{"high_contrast": false, "reduce_motion": false}', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000006', 'system', '{"email": true, "push": false, "security": false}', 'en', '{"profile_public": false, "activity_tracking": false}', '{"high_contrast": false, "reduce_motion": false}', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000007', 'light', '{"email": true, "push": false, "security": false}', 'en', '{"profile_public": false, "activity_tracking": false}', '{"high_contrast": false, "reduce_motion": false}', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000008', 'system', '{"email": true, "push": true, "security": true}', 'de', '{"profile_public": false, "activity_tracking": true}', '{"high_contrast": true, "reduce_motion": true}', NOW(), NOW())
ON CONFLICT (user_id) DO UPDATE SET
  theme = EXCLUDED.theme,
  notifications = EXCLUDED.notifications,
  language = EXCLUDED.language,
  privacy_settings = EXCLUDED.privacy_settings,
  accessibility = EXCLUDED.accessibility,
  updated_at = NOW();

-- User Activity for Test Users (sample login history)
INSERT INTO user_activity (id, user_id, activity_type, description, ip_address, user_agent, metadata, created_at) VALUES
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', 'login', 'User logged in', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '{"location": "New York, NY", "device": "desktop"}', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', 'profile_update', 'Updated profile information', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '{"fields_changed": ["name", "avatar"]}', NOW() - INTERVAL '2 hours'),
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000003', 'login', 'User logged in', '10.0.0.50', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '{"location": "San Francisco, CA", "device": "desktop"}', NOW() - INTERVAL '3 hours'),
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000005', 'login', 'User logged in from mobile', '192.168.1.150', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15', '{"location": "Los Angeles, CA", "device": "mobile"}', NOW() - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;