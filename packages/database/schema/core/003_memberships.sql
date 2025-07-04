-- User-Organization Memberships
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  permissions JSONB DEFAULT '[]',
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, organization_id)
);

-- Create indexes
CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_organization_id ON memberships(organization_id);
CREATE INDEX idx_memberships_role ON memberships(role);
CREATE INDEX idx_memberships_invited_by ON memberships(invited_by);

-- Add comments
COMMENT ON TABLE memberships IS 'Links users to organizations with roles and permissions';
COMMENT ON COLUMN memberships.id IS 'Unique identifier for the membership';
COMMENT ON COLUMN memberships.user_id IS 'User who is a member';
COMMENT ON COLUMN memberships.organization_id IS 'Organization the user belongs to';
COMMENT ON COLUMN memberships.role IS 'Role within the organization (owner, admin, member, etc.)';
COMMENT ON COLUMN memberships.permissions IS 'Additional custom permissions';
COMMENT ON COLUMN memberships.invited_by IS 'User who invited this member';
COMMENT ON COLUMN memberships.invited_at IS 'When the invitation was sent';
COMMENT ON COLUMN memberships.accepted_at IS 'When the invitation was accepted';