-- Activity Feed
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL, -- created_item, updated_project, invited_user, etc.
  entity_type VARCHAR(100),
  entity_id UUID,
  entity_title VARCHAR(255),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_activities_organization_id ON activities(organization_id);
CREATE INDEX idx_activities_project_id ON activities(project_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX idx_activities_action ON activities(action);

-- Add comments
COMMENT ON TABLE activities IS 'User activity feed for organization';
COMMENT ON COLUMN activities.action IS 'Type of action performed';
COMMENT ON COLUMN activities.entity_type IS 'Type of entity affected';
COMMENT ON COLUMN activities.entity_id IS 'ID of entity affected';
COMMENT ON COLUMN activities.is_public IS 'Whether activity is visible to all org members';