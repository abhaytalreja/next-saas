-- E2E Test Avatar and Data Export Data
-- Testing avatar uploads, GDPR exports, and account deletions

-- User Avatars for testing avatar upload functionality
INSERT INTO user_avatars (user_id, original_filename, file_size, mime_type, storage_path, thumbnail_path, metadata, created_at, updated_at) VALUES
  -- Admin user avatar
  ('10000000-0000-0000-0000-000000000001', 'admin-avatar.jpg', 245760, 'image/jpeg', 'avatars/10000000-0000-0000-0000-000000000001/avatar.jpg', 'avatars/10000000-0000-0000-0000-000000000001/thumbnail.jpg', '{"uploaded_via": "web", "dimensions": {"width": 512, "height": 512}, "test_data": true}', NOW() - INTERVAL '30 days', NOW() - INTERVAL '2 hours'),
  
  -- Regular user avatar
  ('10000000-0000-0000-0000-000000000003', 'user-photo.png', 187392, 'image/png', 'avatars/10000000-0000-0000-0000-000000000003/avatar.png', 'avatars/10000000-0000-0000-0000-000000000003/thumbnail.png', '{"uploaded_via": "web", "dimensions": {"width": 400, "height": 400}, "test_data": true}', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  
  -- Multi-org user avatar
  ('10000000-0000-0000-0000-000000000004', 'multi-user.jpg', 312840, 'image/jpeg', 'avatars/10000000-0000-0000-0000-000000000004/avatar.jpg', 'avatars/10000000-0000-0000-0000-000000000004/thumbnail.jpg', '{"uploaded_via": "web", "dimensions": {"width": 600, "height": 600}, "test_data": true}', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
  
  -- Mobile user avatar (uploaded via mobile)
  ('10000000-0000-0000-0000-000000000005', 'mobile-selfie.jpg', 156789, 'image/jpeg', 'avatars/10000000-0000-0000-0000-000000000005/avatar.jpg', 'avatars/10000000-0000-0000-0000-000000000005/thumbnail.jpg', '{"uploaded_via": "mobile", "device": "iPhone", "dimensions": {"width": 300, "height": 300}, "test_data": true}', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
  
  -- GDPR user avatar (for deletion testing)
  ('10000000-0000-0000-0000-000000000008', 'gdpr-user.png', 201543, 'image/png', 'avatars/10000000-0000-0000-0000-000000000008/avatar.png', 'avatars/10000000-0000-0000-0000-000000000008/thumbnail.png', '{"uploaded_via": "web", "dimensions": {"width": 450, "height": 450}, "test_data": true, "gdpr_test": true}', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days')
ON CONFLICT (user_id) DO UPDATE SET
  original_filename = EXCLUDED.original_filename,
  file_size = EXCLUDED.file_size,
  mime_type = EXCLUDED.mime_type,
  storage_path = EXCLUDED.storage_path,
  thumbnail_path = EXCLUDED.thumbnail_path,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- Data Exports for testing GDPR compliance
INSERT INTO data_exports (id, user_id, request_type, status, export_format, file_path, file_size, requested_at, completed_at, expires_at, metadata, created_at, updated_at) VALUES
  -- Completed export for GDPR user
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000008', 'gdpr_export', 'completed', 'json', 'exports/10000000-0000-0000-0000-000000000008/gdpr-export-' || extract(epoch from now()) || '.json', 45678, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', NOW() + INTERVAL '29 days', '{"includes": ["profile", "activity", "organizations", "preferences"], "test_export": true}', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
  
  -- Pending export for admin user
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', 'data_export', 'processing', 'json', NULL, NULL, NOW() - INTERVAL '1 hour', NULL, NULL, '{"includes": ["profile", "activity"], "test_export": true}', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
  
  -- Failed export for testing error handling
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000003', 'gdpr_export', 'failed', 'json', NULL, NULL, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NULL, '{"includes": ["profile", "activity"], "error": "storage_timeout", "test_export": true}', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  
  -- Expired export for cleanup testing
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000004', 'data_export', 'completed', 'json', 'exports/10000000-0000-0000-0000-000000000004/expired-export.json', 23456, NOW() - INTERVAL '35 days', NOW() - INTERVAL '34 days', NOW() - INTERVAL '5 days', '{"includes": ["profile"], "test_export": true, "expired": true}', NOW() - INTERVAL '35 days', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- Account Deletions for testing deletion workflow
INSERT INTO account_deletions (id, user_id, deletion_type, status, reason, scheduled_at, grace_period_ends, deleted_at, metadata, created_at, updated_at) VALUES
  -- Account scheduled for deletion (in grace period)
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000009', 'user_requested', 'scheduled', 'No longer needed', NOW() + INTERVAL '25 days', NOW() + INTERVAL '30 days', NULL, '{"backup_created": true, "notifications_sent": true, "test_deletion": true}', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  
  -- GDPR deletion request (faster processing)
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000008', 'gdpr_request', 'processing', 'GDPR Article 17 - Right to erasure', NOW() + INTERVAL '5 days', NOW() + INTERVAL '7 days', NULL, '{"gdpr_request": true, "data_exported": true, "legal_basis": "article_17", "test_deletion": true}', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
  
  -- Completed deletion (for audit trail)
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000999', 'user_requested', 'completed', 'Account closure requested', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day', '{"backup_created": true, "all_data_removed": true, "test_deletion": true, "completed_deletion": true}', NOW() - INTERVAL '35 days', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- User Sessions for testing session management
INSERT INTO user_sessions (id, user_id, session_token, device_info, ip_address, location, last_activity, expires_at, is_active, metadata, created_at, updated_at) VALUES
  -- Admin user sessions
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', encode(gen_random_bytes(32), 'hex'), '{"browser": "Chrome", "os": "Windows 10", "device": "Desktop"}', '192.168.1.100', '{"city": "New York", "country": "US", "timezone": "America/New_York"}', NOW() - INTERVAL '5 minutes', NOW() + INTERVAL '7 days', true, '{"test_session": true}', NOW() - INTERVAL '1 day', NOW() - INTERVAL '5 minutes'),
  
  -- Mobile user session
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000005', encode(gen_random_bytes(32), 'hex'), '{"browser": "Safari", "os": "iOS 15", "device": "iPhone 13"}', '192.168.1.150', '{"city": "Los Angeles", "country": "US", "timezone": "America/Los_Angeles"}', NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '7 days', true, '{"test_session": true, "mobile": true}', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '30 minutes'),
  
  -- Multi-org user multiple sessions
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000004', encode(gen_random_bytes(32), 'hex'), '{"browser": "Firefox", "os": "Windows 11", "device": "Desktop"}', '172.16.0.100', '{"city": "London", "country": "GB", "timezone": "Europe/London"}', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '7 days', true, '{"test_session": true}', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour'),
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000004', encode(gen_random_bytes(32), 'hex'), '{"browser": "Chrome Mobile", "os": "Android 12", "device": "Pixel 6"}', '172.16.0.101', '{"city": "London", "country": "GB", "timezone": "Europe/London"}', NOW() - INTERVAL '15 minutes', NOW() + INTERVAL '7 days', true, '{"test_session": true, "mobile": true}', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '15 minutes'),
  
  -- Expired session for cleanup testing
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000003', encode(gen_random_bytes(32), 'hex'), '{"browser": "Safari", "os": "macOS", "device": "MacBook Pro"}', '10.0.0.50', '{"city": "San Francisco", "country": "US", "timezone": "America/Los_Angeles"}', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', false, '{"test_session": true, "expired": true}', NOW() - INTERVAL '8 days', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;