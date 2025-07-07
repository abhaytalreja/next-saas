-- Organization Management Functions

-- Function to create organization with owner membership
CREATE OR REPLACE FUNCTION create_organization_with_owner(
  p_name text,
  p_slug text,
  p_owner_id uuid,
  p_settings jsonb DEFAULT '{}',
  p_metadata jsonb DEFAULT '{}'
) RETURNS uuid AS $$
DECLARE
  v_org_id uuid;
  v_default_settings jsonb;
BEGIN
  -- Default organization settings
  v_default_settings := '{
    "allowMemberInvites": true,
    "requireEmailVerification": false,
    "requireTwoFactor": false,
    "sessionTimeout": 60,
    "ipWhitelist": [],
    "ssoEnabled": false,
    "brandingEnabled": false,
    "dataRetentionDays": 365,
    "auditLogRetentionDays": 90,
    "maxWorkspaces": 10,
    "maxMembers": 100,
    "maxProjects": 50,
    "features": {
      "workspaces": true,
      "projects": true,
      "customRoles": false,
      "sso": false,
      "auditLogs": true,
      "apiAccess": true,
      "advancedSecurity": false,
      "customBranding": false,
      "multipleOwners": false,
      "guestAccess": false
    }
  }'::jsonb;

  -- Merge provided settings with defaults
  v_default_settings := v_default_settings || p_settings;

  -- Create organization
  INSERT INTO organizations (name, slug, created_by, settings)
  VALUES (p_name, p_slug, p_owner_id, v_default_settings)
  RETURNING id INTO v_org_id;

  -- Create owner membership
  INSERT INTO organization_members (organization_id, user_id, role, status, permissions)
  VALUES (v_org_id, p_owner_id, 'owner', 'active', ARRAY['*']);

  -- Create default workspace
  INSERT INTO workspaces (organization_id, name, slug, is_default, created_by)
  VALUES (v_org_id, 'Default Workspace', 'default', true, p_owner_id);

  -- Log the creation
  INSERT INTO audit_logs (
    organization_id, 
    actor_id, 
    actor_type,
    action, 
    resource_type, 
    resource_id,
    resource_name,
    result
  )
  VALUES (
    v_org_id,
    p_owner_id,
    'user',
    'organization.created',
    'organization',
    v_org_id,
    p_name,
    'success'
  );

  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check user permissions
CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id uuid,
  p_organization_id uuid,
  p_permission text,
  p_workspace_id uuid DEFAULT NULL,
  p_project_id uuid DEFAULT NULL
) RETURNS boolean AS $$
DECLARE
  v_role text;
  v_permissions text[];
  v_has_permission boolean := false;
BEGIN
  -- Get user's role and permissions in the organization
  SELECT role, permissions INTO v_role, v_permissions
  FROM organization_members
  WHERE user_id = p_user_id 
  AND organization_id = p_organization_id
  AND status = 'active';

  -- Owner has all permissions
  IF v_role = 'owner' THEN
    RETURN true;
  END IF;

  -- Check if user has the specific permission or wildcard
  IF p_permission = ANY(v_permissions) OR '*' = ANY(v_permissions) THEN
    v_has_permission := true;
  END IF;

  -- Check workspace-level permissions if workspace_id provided
  IF p_workspace_id IS NOT NULL AND NOT v_has_permission THEN
    -- Check if user is workspace admin
    SELECT EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = p_workspace_id
      AND user_id = p_user_id
      AND role = 'admin'
    ) INTO v_has_permission;
  END IF;

  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's effective permissions
CREATE OR REPLACE FUNCTION get_user_permissions(
  p_user_id uuid,
  p_organization_id uuid
) RETURNS text[] AS $$
DECLARE
  v_role text;
  v_base_permissions text[];
  v_custom_permissions text[];
  v_all_permissions text[];
BEGIN
  -- Get base role and permissions
  SELECT role, permissions INTO v_role, v_base_permissions
  FROM organization_members
  WHERE user_id = p_user_id 
  AND organization_id = p_organization_id
  AND status = 'active';

  -- Owner gets all permissions
  IF v_role = 'owner' THEN
    RETURN ARRAY['*'];
  END IF;

  -- Get role-based permissions
  CASE v_role
    WHEN 'admin' THEN
      v_all_permissions := ARRAY[
        'organization:view',
        'organization:update',
        'organization:manage_members',
        'organization:manage_billing',
        'organization:view_audit_logs',
        'workspace:*',
        'project:*',
        'item:*',
        'api:*'
      ];
    WHEN 'member' THEN
      v_all_permissions := ARRAY[
        'organization:view',
        'workspace:view',
        'workspace:create',
        'project:*',
        'item:*',
        'api:access'
      ];
    WHEN 'viewer' THEN
      v_all_permissions := ARRAY[
        'organization:view',
        'workspace:view',
        'project:view',
        'item:view'
      ];
    ELSE
      v_all_permissions := ARRAY[]::text[];
  END CASE;

  -- Merge with custom permissions
  v_all_permissions := array_cat(v_all_permissions, v_base_permissions);

  -- Get permission overrides
  SELECT array_agg(permission) INTO v_custom_permissions
  FROM member_permissions mp
  JOIN organization_members om ON om.id = mp.membership_id
  WHERE om.user_id = p_user_id 
  AND om.organization_id = p_organization_id
  AND mp.granted = true
  AND (mp.expires_at IS NULL OR mp.expires_at > now());

  IF v_custom_permissions IS NOT NULL THEN
    v_all_permissions := array_cat(v_all_permissions, v_custom_permissions);
  END IF;

  -- Remove duplicates
  RETURN array(SELECT DISTINCT unnest(v_all_permissions));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to transfer organization ownership
CREATE OR REPLACE FUNCTION transfer_organization_ownership(
  p_organization_id uuid,
  p_current_owner_id uuid,
  p_new_owner_id uuid
) RETURNS boolean AS $$
BEGIN
  -- Verify current owner
  IF NOT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = p_organization_id
    AND user_id = p_current_owner_id
    AND role = 'owner'
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Current user is not the owner';
  END IF;

  -- Update roles in a transaction
  -- Demote current owner to admin
  UPDATE organization_members
  SET role = 'admin',
      updated_at = now()
  WHERE organization_id = p_organization_id
  AND user_id = p_current_owner_id;

  -- Promote new owner
  UPDATE organization_members
  SET role = 'owner',
      permissions = ARRAY['*'],
      updated_at = now()
  WHERE organization_id = p_organization_id
  AND user_id = p_new_owner_id;

  -- Update organization record
  UPDATE organizations
  SET created_by = p_new_owner_id,
      updated_at = now()
  WHERE id = p_organization_id;

  -- Log the transfer
  INSERT INTO audit_logs (
    organization_id, 
    actor_id, 
    action, 
    resource_type, 
    resource_id,
    changes,
    result
  )
  VALUES (
    p_organization_id,
    p_current_owner_id,
    'organization.ownership_transferred',
    'organization',
    p_organization_id,
    jsonb_build_object(
      'previous_owner_id', p_current_owner_id,
      'new_owner_id', p_new_owner_id
    ),
    'success'
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;