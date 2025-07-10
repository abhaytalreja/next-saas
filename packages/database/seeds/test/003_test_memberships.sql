-- E2E Test Memberships
-- User-Organization relationships for comprehensive testing

-- Clear existing test memberships
DELETE FROM memberships WHERE organization_id IN (
  SELECT id FROM organizations WHERE metadata::text LIKE '%test_account%'
);

-- Test Memberships - Users in Organizations with different roles
INSERT INTO memberships (id, user_id, organization_id, role, permissions, status, invited_by, invited_at, accepted_at, created_at, updated_at) VALUES
  -- Admin user in Acme Corporation (Owner)
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'owner', '{"admin": true, "billing": true, "members": true, "settings": true}', 'active', NULL, NULL, NOW(), NOW(), NOW()),
  
  -- Org Admin user in Acme Corporation (Admin)
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'admin', '{"admin": true, "billing": false, "members": true, "settings": true}', 'active', '10000000-0000-0000-0000-000000000001', NOW() - INTERVAL '30 days', NOW() - INTERVAL '29 days', NOW() - INTERVAL '30 days', NOW()),
  
  -- Regular user in Acme Corporation (Member)
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'member', '{"admin": false, "billing": false, "members": false, "settings": false}', 'active', '10000000-0000-0000-0000-000000000002', NOW() - INTERVAL '20 days', NOW() - INTERVAL '19 days', NOW() - INTERVAL '20 days', NOW()),
  
  -- Multi-org user in Tech Startup Inc (Admin)
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 'admin', '{"admin": true, "billing": true, "members": true, "settings": true}', 'active', '10000000-0000-0000-0000-000000000002', NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days', NOW() - INTERVAL '15 days', NOW()),
  
  -- Multi-org user in Consulting Firm LLC (Member) 
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 'member', '{"admin": false, "billing": false, "members": false, "settings": false}', 'active', '10000000-0000-0000-0000-000000000001', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days', NOW() - INTERVAL '10 days', NOW()),
  
  -- Mobile user in Mobile First Co (Member)
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', 'member', '{"admin": false, "billing": false, "members": false, "settings": false}', 'active', '10000000-0000-0000-0000-000000000001', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '7 days', NOW()),
  
  -- Incomplete user in Startup Co (Member)
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000006', 'member', '{"admin": false, "billing": false, "members": false, "settings": false}', 'active', '10000000-0000-0000-0000-000000000001', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '5 days', NOW()),
  
  -- GDPR user in Enterprise Corp (Member)
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000003', 'member', '{"admin": false, "billing": false, "members": false, "settings": false}', 'active', '10000000-0000-0000-0000-000000000001', NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days', NOW() - INTERVAL '12 days', NOW()),
  
  -- Pending invitations for testing invitation flow
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000003', 'member', '{"admin": false, "billing": false, "members": false, "settings": false}', 'pending', '10000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 days', NULL, NOW() - INTERVAL '2 days', NOW()),
  
  -- Additional team members for testing team features
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'owner', '{"admin": true, "billing": true, "members": true, "settings": true}', 'active', NULL, NULL, NOW(), NOW(), NOW()),
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'owner', '{"admin": true, "billing": true, "members": true, "settings": true}', 'active', NULL, NULL, NOW(), NOW(), NOW()),
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 'admin', '{"admin": true, "billing": false, "members": true, "settings": true}', 'active', '10000000-0000-0000-0000-000000000001', NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '8 days', NOW()),
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000006', 'member', '{"admin": false, "billing": false, "members": false, "settings": false}', 'active', '10000000-0000-0000-0000-000000000007', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- Organization Invitations for testing invitation flows
INSERT INTO organization_invitations (id, organization_id, email, role, permissions, invited_by, token, expires_at, status, created_at, updated_at) VALUES
  -- Active invitation for testing
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000003', 'next-saas-invited@mailinator.com', 'member', '{"admin": false, "billing": false, "members": false, "settings": false}', '10000000-0000-0000-0000-000000000001', encode(gen_random_bytes(32), 'hex'), NOW() + INTERVAL '7 days', 'pending', NOW(), NOW()),
  
  -- Expired invitation for testing cleanup
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000001', 'next-saas-expired@mailinator.com', 'member', '{"admin": false, "billing": false, "members": false, "settings": false}', '10000000-0000-0000-0000-000000000002', encode(gen_random_bytes(32), 'hex'), NOW() - INTERVAL '1 day', 'expired', NOW() - INTERVAL '8 days', NOW()),
  
  -- Multiple role invitations for testing
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000002', 'next-saas-manager@mailinator.com', 'admin', '{"admin": true, "billing": false, "members": true, "settings": true}', '10000000-0000-0000-0000-000000000002', encode(gen_random_bytes(32), 'hex'), NOW() + INTERVAL '5 days', 'pending', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;