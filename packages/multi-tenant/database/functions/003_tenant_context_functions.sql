-- Enhanced tenant context functions for RLS and security

-- Function to set current tenant context for RLS policies
CREATE OR REPLACE FUNCTION set_current_tenant_context(
  p_user_id uuid,
  p_organization_id uuid,
  p_role text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Set session variables for RLS policies
  PERFORM set_config('app.current_user_id', p_user_id::text, true);
  PERFORM set_config('app.current_organization_id', p_organization_id::text, true);
  PERFORM set_config('app.current_user_role', COALESCE(p_role, ''), true);
  
  -- Set timestamp for audit purposes
  PERFORM set_config('app.context_set_at', extract(epoch from now())::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current tenant context
CREATE OR REPLACE FUNCTION get_current_tenant_context()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'user_id', current_setting('app.current_user_id', true),
    'organization_id', current_setting('app.current_organization_id', true),
    'role', current_setting('app.current_user_role', true),
    'set_at', current_setting('app.context_set_at', true)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear tenant context
CREATE OR REPLACE FUNCTION clear_tenant_context()
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_id', '', true);
  PERFORM set_config('app.current_organization_id', '', true);
  PERFORM set_config('app.current_user_role', '', true);
  PERFORM set_config('app.context_set_at', '', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced function to get user permissions with caching
CREATE OR REPLACE FUNCTION get_user_permissions(
  p_user_id uuid,
  p_organization_id uuid
)
RETURNS text[] AS $$
DECLARE
  user_role text;
  role_permissions text[];
  custom_permissions text[];
  final_permissions text[];
BEGIN
  -- Get user's role in the organization
  SELECT role INTO user_role
  FROM organization_members
  WHERE user_id = p_user_id 
    AND organization_id = p_organization_id 
    AND status = 'active';

  -- If user is not a member, return empty array
  IF user_role IS NULL THEN
    RETURN ARRAY[]::text[];
  END IF;

  -- Get base role permissions
  CASE user_role
    WHEN 'owner' THEN
      role_permissions := ARRAY['*'];
    WHEN 'admin' THEN
      role_permissions := ARRAY[
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
      role_permissions := ARRAY[
        'organization:view',
        'workspace:view',
        'workspace:create',
        'project:*',
        'item:*',
        'api:access'
      ];
    WHEN 'viewer' THEN
      role_permissions := ARRAY[
        'organization:view',
        'workspace:view',
        'project:view',
        'item:view'
      ];
    ELSE
      role_permissions := ARRAY['organization:view'];
  END CASE;

  -- Get custom permissions from member_permissions table
  SELECT ARRAY_AGG(permission) INTO custom_permissions
  FROM member_permissions mp
  JOIN organization_members om ON om.id = mp.membership_id
  WHERE om.user_id = p_user_id 
    AND om.organization_id = p_organization_id
    AND mp.granted = true
    AND (mp.expires_at IS NULL OR mp.expires_at > now());

  -- Combine role and custom permissions
  final_permissions := role_permissions;
  
  IF custom_permissions IS NOT NULL THEN
    final_permissions := final_permissions || custom_permissions;
  END IF;

  -- Remove duplicates
  SELECT ARRAY_AGG(DISTINCT permission) INTO final_permissions
  FROM unnest(final_permissions) AS permission;

  RETURN final_permissions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id uuid,
  p_organization_id uuid,
  p_permission text
)
RETURNS boolean AS $$
DECLARE
  user_permissions text[];
  permission_parts text[];
  required_resource text;
  required_action text;
BEGIN
  -- Get user permissions
  user_permissions := get_user_permissions(p_user_id, p_organization_id);
  
  -- Owner has all permissions
  IF '*' = ANY(user_permissions) THEN
    RETURN true;
  END IF;
  
  -- Check exact match
  IF p_permission = ANY(user_permissions) THEN
    RETURN true;
  END IF;
  
  -- Parse permission into resource:action
  permission_parts := string_to_array(p_permission, ':');
  IF array_length(permission_parts, 1) = 2 THEN
    required_resource := permission_parts[1];
    required_action := permission_parts[2];
    
    -- Check resource wildcard (e.g., workspace:* matches workspace:create)
    IF (required_resource || ':*') = ANY(user_permissions) THEN
      RETURN true;
    END IF;
    
    -- Check action wildcard (e.g., *:view matches workspace:view)
    IF ('*:' || required_action) = ANY(user_permissions) THEN
      RETURN true;
    END IF;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's role in organization
CREATE OR REPLACE FUNCTION get_user_role(
  p_user_id uuid,
  p_organization_id uuid
)
RETURNS text AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM organization_members
  WHERE user_id = p_user_id 
    AND organization_id = p_organization_id 
    AND status = 'active';
    
  RETURN COALESCE(user_role, 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate tenant context
CREATE OR REPLACE FUNCTION validate_tenant_context(
  p_user_id uuid,
  p_organization_id uuid
)
RETURNS boolean AS $$
DECLARE
  is_member boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM organization_members
    WHERE user_id = p_user_id 
      AND organization_id = p_organization_id 
      AND status = 'active'
  ) INTO is_member;
  
  RETURN is_member;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_organization_id uuid,
  p_user_id uuid,
  p_event_type text,
  p_description text,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO audit_logs (
    organization_id,
    actor_id,
    actor_type,
    action,
    resource_type,
    result,
    metadata,
    created_at
  ) VALUES (
    p_organization_id,
    p_user_id,
    'user',
    p_event_type,
    'security',
    'success',
    COALESCE(p_metadata, '{}'::jsonb) || jsonb_build_object('description', p_description),
    now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION set_current_tenant_context(uuid, uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_current_tenant_context() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION clear_tenant_context() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_user_permissions(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION user_has_permission(uuid, uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_user_role(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION validate_tenant_context(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION log_security_event(uuid, uuid, text, text, jsonb) TO authenticated, service_role;