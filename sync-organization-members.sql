-- Sync data from memberships to organization_members table
-- This needs to be run manually to fix the RLS policy mismatch

INSERT INTO organization_members (id, organization_id, user_id, role, joined_at)
SELECT 
  gen_random_uuid() as id,
  organization_id,
  user_id,
  role,
  COALESCE(accepted_at, created_at) as joined_at
FROM memberships
WHERE accepted_at IS NOT NULL  -- Only sync accepted memberships
ON CONFLICT DO NOTHING;

-- Verify the data was inserted
SELECT 
  om.organization_id,
  om.user_id,
  om.role,
  om.joined_at,
  u.email
FROM organization_members om
JOIN users u ON u.id = om.user_id
WHERE om.organization_id = '2086a5a4-aeaa-46f9-b870-c65ee912cc71';