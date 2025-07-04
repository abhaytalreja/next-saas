-- Generic Projects/Workspaces
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100),
  description TEXT,
  type VARCHAR(100) DEFAULT 'general', -- real_estate, crypto, ecommerce, etc.
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_archived BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(organization_id, slug)
);

-- Create indexes
CREATE INDEX idx_projects_organization_id ON projects(organization_id);
CREATE INDEX idx_projects_type ON projects(type);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_is_archived ON projects(is_archived);
CREATE INDEX idx_projects_deleted_at ON projects(deleted_at) WHERE deleted_at IS NULL;

-- Add comments
COMMENT ON TABLE projects IS 'Generic projects/workspaces for organizing content';
COMMENT ON COLUMN projects.type IS 'Project type for industry-specific features';
COMMENT ON COLUMN projects.slug IS 'URL-friendly identifier within organization';
COMMENT ON COLUMN projects.settings IS 'Project-specific settings';
COMMENT ON COLUMN projects.is_archived IS 'Whether project is archived';