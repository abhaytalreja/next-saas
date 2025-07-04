-- Organizations (Tenant Isolation)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  domain VARCHAR(255),
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  subscription_status VARCHAR(50) DEFAULT 'trial',
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_domain ON organizations(domain) WHERE domain IS NOT NULL;
CREATE INDEX idx_organizations_created_by ON organizations(created_by);
CREATE INDEX idx_organizations_subscription_status ON organizations(subscription_status);
CREATE INDEX idx_organizations_deleted_at ON organizations(deleted_at) WHERE deleted_at IS NULL;

-- Add comments
COMMENT ON TABLE organizations IS 'Organizations provide multi-tenant isolation';
COMMENT ON COLUMN organizations.id IS 'Unique identifier for the organization';
COMMENT ON COLUMN organizations.name IS 'Display name of the organization';
COMMENT ON COLUMN organizations.slug IS 'URL-friendly unique identifier';
COMMENT ON COLUMN organizations.domain IS 'Custom domain for the organization';
COMMENT ON COLUMN organizations.logo_url IS 'URL to organization logo';
COMMENT ON COLUMN organizations.settings IS 'Organization-specific settings';
COMMENT ON COLUMN organizations.metadata IS 'Additional organization metadata';
COMMENT ON COLUMN organizations.subscription_status IS 'Current subscription status (trial, active, cancelled, etc.)';
COMMENT ON COLUMN organizations.trial_ends_at IS 'When the trial period ends';
COMMENT ON COLUMN organizations.created_by IS 'User who created the organization';