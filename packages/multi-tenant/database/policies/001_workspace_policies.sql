-- Workspace RLS Policies

-- Workspaces: Members can view workspaces in their organization
DROP POLICY IF EXISTS "Members can view organization workspaces" ON workspaces;
CREATE POLICY "Members can view organization workspaces" ON workspaces
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
    AND (deleted_at IS NULL)
  );

-- Workspaces: Admins can create workspaces
DROP POLICY IF EXISTS "Admins can create workspaces" ON workspaces;
CREATE POLICY "Admins can create workspaces" ON workspaces
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = workspaces.organization_id 
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND status = 'active'
    )
  );

-- Workspaces: Workspace admins and org admins can update
DROP POLICY IF EXISTS "Workspace admins can update workspaces" ON workspaces;
CREATE POLICY "Workspace admins can update workspaces" ON workspaces
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = workspaces.organization_id 
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = workspaces.id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Workspaces: Only org owners can hard delete (soft delete via update)
DROP POLICY IF EXISTS "Owners can delete workspaces" ON workspaces;
CREATE POLICY "Owners can delete workspaces" ON workspaces
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = workspaces.organization_id 
      AND user_id = auth.uid()
      AND role = 'owner'
      AND status = 'active'
    )
  );

-- Workspace Members: Can view members of accessible workspaces
DROP POLICY IF EXISTS "Users can view workspace members" ON workspace_members;
CREATE POLICY "Users can view workspace members" ON workspace_members
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM workspaces
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
        AND status = 'active'
      )
    )
  );

-- Workspace Members: Workspace admins can manage members
DROP POLICY IF EXISTS "Workspace admins can insert members" ON workspace_members;
CREATE POLICY "Workspace admins can insert members" ON workspace_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces w
      JOIN organization_members om ON om.organization_id = w.organization_id
      WHERE w.id = workspace_members.workspace_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
      AND om.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Workspace admins can update members" ON workspace_members;
CREATE POLICY "Workspace admins can update members" ON workspace_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      JOIN organization_members om ON om.organization_id = w.organization_id
      WHERE w.id = workspace_members.workspace_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
      AND om.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Workspace admins can delete members" ON workspace_members;
CREATE POLICY "Workspace admins can delete members" ON workspace_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      JOIN organization_members om ON om.organization_id = w.organization_id
      WHERE w.id = workspace_members.workspace_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
      AND om.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role = 'admin'
    )
  );