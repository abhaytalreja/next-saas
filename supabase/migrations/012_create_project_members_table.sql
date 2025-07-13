-- Create project_members table for project-level member management
-- Migration: 012_create_project_members_table
-- Date: 2025-01-12

-- Create project_members table
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  permissions TEXT[] DEFAULT '{}',
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by UUID REFERENCES users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique membership per project
  UNIQUE(project_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_project_members_role ON project_members(role);

-- Enable RLS
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_members
CREATE POLICY "Users can view project members if they're org members" ON project_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_id
    AND m.user_id = auth.uid()
    AND m.accepted_at IS NOT NULL
  )
);

CREATE POLICY "Project admins can manage project members" ON project_members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_id
    AND m.user_id = auth.uid()
    AND m.role IN ('owner', 'admin')
    AND m.accepted_at IS NOT NULL
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_id
    AND m.user_id = auth.uid()
    AND m.role IN ('owner', 'admin')
    AND m.accepted_at IS NOT NULL
  )
);

-- Service role access
CREATE POLICY "Service role has full access to project_members" ON project_members
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add updated_at trigger
CREATE TRIGGER update_project_members_updated_at
  BEFORE UPDATE ON project_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add activity trigger for project member changes
CREATE TRIGGER activity_project_members
  AFTER INSERT OR UPDATE OR DELETE ON project_members
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_activity();