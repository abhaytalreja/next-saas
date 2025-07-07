-- Organization Invitations
CREATE TABLE IF NOT EXISTS organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'member')),
  token VARCHAR(255) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  invited_by UUID NOT NULL REFERENCES users(id),
  accepted_by UUID REFERENCES users(id),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_organization_invitations_token ON organization_invitations(token);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_email ON organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_organization_id ON organization_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_status ON organization_invitations(status);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_expires_at ON organization_invitations(expires_at);

-- Add comments
COMMENT ON TABLE organization_invitations IS 'Pending invitations to join organizations';
COMMENT ON COLUMN organization_invitations.id IS 'Unique invitation identifier';
COMMENT ON COLUMN organization_invitations.organization_id IS 'Organization being invited to';
COMMENT ON COLUMN organization_invitations.email IS 'Email address of invitee';
COMMENT ON COLUMN organization_invitations.role IS 'Role to be assigned upon acceptance';
COMMENT ON COLUMN organization_invitations.token IS 'Unique token for accepting invitation';
COMMENT ON COLUMN organization_invitations.message IS 'Optional personal message from inviter';
COMMENT ON COLUMN organization_invitations.status IS 'Current status of invitation';
COMMENT ON COLUMN organization_invitations.invited_by IS 'User who sent the invitation';
COMMENT ON COLUMN organization_invitations.accepted_by IS 'User who accepted the invitation';
COMMENT ON COLUMN organization_invitations.expires_at IS 'When this invitation expires';
COMMENT ON COLUMN organization_invitations.accepted_at IS 'When this invitation was accepted';