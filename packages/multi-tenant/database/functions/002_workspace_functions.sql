-- Workspace Management Functions

-- Function to create workspace with default settings
CREATE OR REPLACE FUNCTION create_workspace(
  p_organization_id uuid,
  p_name text,
  p_slug text,
  p_created_by uuid,
  p_description text DEFAULT NULL,
  p_settings jsonb DEFAULT '{}'
) RETURNS uuid AS $$
DECLARE
  v_workspace_id uuid;
  v_default_settings jsonb;
  v_workspace_count integer;
  v_max_workspaces integer;
BEGIN
  -- Get organization's workspace limit
  SELECT (settings->'maxWorkspaces')::integer INTO v_max_workspaces
  FROM organizations
  WHERE id = p_organization_id;

  -- Count existing workspaces
  SELECT COUNT(*) INTO v_workspace_count
  FROM workspaces
  WHERE organization_id = p_organization_id
  AND deleted_at IS NULL;

  -- Check workspace limit
  IF v_workspace_count >= v_max_workspaces THEN
    RAISE EXCEPTION 'Workspace limit reached for organization';
  END IF;

  -- Default workspace settings
  v_default_settings := '{
    "visibility": "organization",
    "allowGuestAccess": false,
    "defaultProjectType": "general",
    "projectLimit": 50,
    "storageLimit": 5120,
    "apiRateLimit": 1000,
    "features": {
      "kanbanBoard": true,
      "calendar": true,
      "timeline": true,
      "forms": true,
      "automation": false,
      "reporting": true,
      "api": true,
      "webhooks": false
    },
    "integrations": {
      "slack": {"enabled": false},
      "github": {"enabled": false},
      "jira": {"enabled": false}
    }
  }'::jsonb;

  -- Merge provided settings with defaults
  v_default_settings := v_default_settings || p_settings;

  -- Create workspace
  INSERT INTO workspaces (
    organization_id, 
    name, 
    slug, 
    description,
    settings,
    created_by
  )
  VALUES (
    p_organization_id,
    p_name,
    p_slug,
    p_description,
    v_default_settings,
    p_created_by
  )
  RETURNING id INTO v_workspace_id;

  -- Add creator as workspace admin
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (v_workspace_id, p_created_by, 'admin');

  -- Log the creation
  INSERT INTO audit_logs (
    organization_id,
    workspace_id, 
    actor_id, 
    action, 
    resource_type, 
    resource_id,
    resource_name,
    result
  )
  VALUES (
    p_organization_id,
    v_workspace_id,
    p_created_by,
    'workspace.created',
    'workspace',
    v_workspace_id,
    p_name,
    'success'
  );

  RETURN v_workspace_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add workspace member
CREATE OR REPLACE FUNCTION add_workspace_member(
  p_workspace_id uuid,
  p_user_id uuid,
  p_role text,
  p_added_by uuid
) RETURNS boolean AS $$
DECLARE
  v_organization_id uuid;
BEGIN
  -- Get organization ID
  SELECT organization_id INTO v_organization_id
  FROM workspaces
  WHERE id = p_workspace_id;

  -- Check if user is organization member
  IF NOT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = v_organization_id
    AND user_id = p_user_id
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'User must be organization member first';
  END IF;

  -- Add to workspace
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (p_workspace_id, p_user_id, p_role)
  ON CONFLICT (workspace_id, user_id) 
  DO UPDATE SET role = p_role, last_accessed_at = now();

  -- Log the action
  INSERT INTO audit_logs (
    organization_id,
    workspace_id, 
    actor_id, 
    action, 
    resource_type, 
    resource_id,
    metadata,
    result
  )
  VALUES (
    v_organization_id,
    p_workspace_id,
    p_added_by,
    'workspace.member_added',
    'workspace_member',
    p_user_id,
    jsonb_build_object('role', p_role),
    'success'
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to archive/restore workspace
CREATE OR REPLACE FUNCTION toggle_workspace_archive(
  p_workspace_id uuid,
  p_user_id uuid,
  p_archive boolean
) RETURNS boolean AS $$
DECLARE
  v_organization_id uuid;
  v_workspace_name text;
BEGIN
  -- Get workspace info
  SELECT organization_id, name INTO v_organization_id, v_workspace_name
  FROM workspaces
  WHERE id = p_workspace_id;

  -- Update archive status
  UPDATE workspaces
  SET is_archived = p_archive,
      updated_at = now()
  WHERE id = p_workspace_id;

  -- Log the action
  INSERT INTO audit_logs (
    organization_id,
    workspace_id, 
    actor_id, 
    action, 
    resource_type, 
    resource_id,
    resource_name,
    result
  )
  VALUES (
    v_organization_id,
    p_workspace_id,
    p_user_id,
    CASE WHEN p_archive THEN 'workspace.archived' ELSE 'workspace.restored' END,
    'workspace',
    p_workspace_id,
    v_workspace_name,
    'success'
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get workspace member count and usage
CREATE OR REPLACE FUNCTION get_workspace_stats(p_workspace_id uuid)
RETURNS TABLE (
  member_count integer,
  project_count integer,
  item_count integer,
  storage_used_mb integer,
  last_activity timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::integer FROM workspace_members WHERE workspace_id = p_workspace_id),
    (SELECT COUNT(*)::integer FROM projects WHERE workspace_id = p_workspace_id AND deleted_at IS NULL),
    (SELECT COUNT(*)::integer FROM items i JOIN projects p ON i.project_id = p.id WHERE p.workspace_id = p_workspace_id),
    0::integer, -- Storage calculation would be implemented based on your storage system
    (SELECT MAX(GREATEST(
      COALESCE((SELECT MAX(updated_at) FROM projects WHERE workspace_id = p_workspace_id), '1970-01-01'),
      COALESCE((SELECT MAX(last_accessed_at) FROM workspace_members WHERE workspace_id = p_workspace_id), '1970-01-01')
    )));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;