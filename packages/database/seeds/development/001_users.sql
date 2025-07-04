-- Development seed data for users
INSERT INTO users (id, email, email_verified_at, name, avatar_url, timezone, locale, metadata) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@nextsaas.com', NOW(), 'Admin User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 'UTC', 'en', '{"role": "admin"}'),
  ('00000000-0000-0000-0000-000000000002', 'john@example.com', NOW(), 'John Doe', 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', 'America/New_York', 'en', '{}'),
  ('00000000-0000-0000-0000-000000000003', 'jane@example.com', NOW(), 'Jane Smith', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane', 'Europe/London', 'en', '{}'),
  ('00000000-0000-0000-0000-000000000004', 'bob@example.com', NULL, 'Bob Wilson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob', 'America/Los_Angeles', 'en', '{}'),
  ('00000000-0000-0000-0000-000000000005', 'alice@example.com', NOW(), 'Alice Johnson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice', 'Asia/Tokyo', 'ja', '{}')
ON CONFLICT (id) DO NOTHING;