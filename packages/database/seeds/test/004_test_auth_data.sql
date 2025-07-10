-- E2E Test Authentication Data
-- Sessions, password resets, email verifications for testing auth flows

-- Clear existing test auth data
DELETE FROM sessions WHERE user_id IN (
  SELECT id FROM users WHERE metadata::text LIKE '%test_account%'
);
DELETE FROM password_resets WHERE email LIKE '%@mailinator.com';
DELETE FROM email_verifications WHERE email LIKE '%@mailinator.com';

-- Test Sessions for active users
INSERT INTO sessions (id, user_id, token, expires_at, user_agent, ip_address, metadata, created_at, updated_at) VALUES
  -- Admin user active session
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', encode(gen_random_bytes(32), 'hex'), NOW() + INTERVAL '30 days', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '192.168.1.100', '{"device": "desktop", "location": "New York, NY", "test_session": true}', NOW() - INTERVAL '1 day', NOW()),
  
  -- Regular user active session
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000003', encode(gen_random_bytes(32), 'hex'), NOW() + INTERVAL '30 days', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '10.0.0.50', '{"device": "desktop", "location": "San Francisco, CA", "test_session": true}', NOW() - INTERVAL '3 hours', NOW()),
  
  -- Mobile user active session
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000005', encode(gen_random_bytes(32), 'hex'), NOW() + INTERVAL '30 days', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15', '192.168.1.150', '{"device": "mobile", "location": "Los Angeles, CA", "test_session": true}', NOW() - INTERVAL '1 hour', NOW()),
  
  -- Multi-org user multiple sessions (desktop and mobile)
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000004', encode(gen_random_bytes(32), 'hex'), NOW() + INTERVAL '30 days', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '172.16.0.100', '{"device": "desktop", "location": "London, UK", "test_session": true}', NOW() - INTERVAL '2 hours', NOW()),
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000004', encode(gen_random_bytes(32), 'hex'), NOW() + INTERVAL '30 days', 'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0', '172.16.0.101', '{"device": "mobile", "location": "London, UK", "test_session": true}', NOW() - INTERVAL '30 minutes', NOW()),
  
  -- Expired session for testing cleanup
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000008', encode(gen_random_bytes(32), 'hex'), NOW() - INTERVAL '1 day', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '192.168.1.200', '{"device": "desktop", "location": "Berlin, Germany", "test_session": true}', NOW() - INTERVAL '5 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- Email Verifications for testing verification flow
INSERT INTO email_verifications (id, email, token, user_id, expires_at, verified_at, created_at, updated_at) VALUES
  -- Pending verification for pending user
  (gen_random_uuid(), 'next-saas-pending@mailinator.com', encode(gen_random_bytes(32), 'hex'), '10000000-0000-0000-0000-000000000006', NOW() + INTERVAL '24 hours', NULL, NOW() - INTERVAL '2 hours', NOW()),
  
  -- Expired verification for testing
  (gen_random_uuid(), 'next-saas-expired-verification@mailinator.com', encode(gen_random_bytes(32), 'hex'), NULL, NOW() - INTERVAL '1 hour', NULL, NOW() - INTERVAL '25 hours', NOW()),
  
  -- Successfully verified entries (for audit trail)
  (gen_random_uuid(), 'next-saas-admin@mailinator.com', encode(gen_random_bytes(32), 'hex'), '10000000-0000-0000-0000-000000000001', NOW() + INTERVAL '24 hours', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  (gen_random_uuid(), 'next-saas-user@mailinator.com', encode(gen_random_bytes(32), 'hex'), '10000000-0000-0000-0000-000000000003', NOW() + INTERVAL '24 hours', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days')
ON CONFLICT (id) DO NOTHING;

-- Password Resets for testing reset flow
INSERT INTO password_resets (id, email, token, user_id, expires_at, used_at, created_at, updated_at) VALUES
  -- Active password reset for testing
  (gen_random_uuid(), 'next-saas-user@mailinator.com', encode(gen_random_bytes(32), 'hex'), '10000000-0000-0000-0000-000000000003', NOW() + INTERVAL '1 hour', NULL, NOW() - INTERVAL '15 minutes', NOW()),
  
  -- Expired password reset
  (gen_random_uuid(), 'next-saas-admin@mailinator.com', encode(gen_random_bytes(32), 'hex'), '10000000-0000-0000-0000-000000000001', NOW() - INTERVAL '30 minutes', NULL, NOW() - INTERVAL '2 hours', NOW()),
  
  -- Used password reset (for audit trail)
  (gen_random_uuid(), 'next-saas-mobile@mailinator.com', encode(gen_random_bytes(32), 'hex'), '10000000-0000-0000-0000-000000000005', NOW() + INTERVAL '1 hour', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Auth Events for testing security monitoring
INSERT INTO auth_events (id, user_id, event_type, metadata, ip_address, user_agent, created_at) VALUES
  -- Recent login events
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', 'login_success', '{"method": "password", "location": "New York, NY"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000003', 'login_success', '{"method": "password", "location": "San Francisco, CA"}', '10.0.0.50', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', NOW() - INTERVAL '3 hours'),
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000005', 'login_success', '{"method": "password", "location": "Los Angeles, CA"}', '192.168.1.150', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15', NOW() - INTERVAL '1 hour'),
  
  -- Failed login attempts for security testing
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000003', 'login_failed', '{"reason": "invalid_password", "location": "Unknown"}', '203.0.113.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW() - INTERVAL '6 hours'),
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000003', 'login_failed', '{"reason": "invalid_password", "location": "Unknown"}', '203.0.113.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW() - INTERVAL '6 hours'),
  
  -- Password change events
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000005', 'password_changed', '{"method": "reset_link", "location": "Los Angeles, CA"}', '192.168.1.150', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15', NOW() - INTERVAL '1 day'),
  
  -- Email verification events
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', 'email_verified', '{"email": "next-saas-admin@mailinator.com", "location": "New York, NY"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW() - INTERVAL '30 days'),
  
  -- Profile update events
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', 'profile_updated', '{"fields": ["name", "avatar"], "location": "New York, NY"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW() - INTERVAL '2 hours'),
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000003', 'profile_updated', '{"fields": ["bio", "phone"], "location": "San Francisco, CA"}', '10.0.0.50', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;