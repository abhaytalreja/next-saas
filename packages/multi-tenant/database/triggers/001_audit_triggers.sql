-- Audit Logging Triggers

-- Generic audit logging function
CREATE OR REPLACE FUNCTION log_audit_event() RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
  v_action text;
  v_resource_type text;
  v_resource_name text;
  v_organization_id uuid;
  v_changes jsonb;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Determine the action
  CASE TG_OP
    WHEN 'INSERT' THEN 
      v_action := lower(TG_TABLE_NAME) || '.created';
      v_changes := to_jsonb(NEW);
    WHEN 'UPDATE' THEN 
      v_action := lower(TG_TABLE_NAME) || '.updated';
      -- Only log actual changes
      SELECT jsonb_object_agg(key, value) INTO v_changes
      FROM (
        SELECT key, value 
        FROM jsonb_each(to_jsonb(NEW))
        WHERE value IS DISTINCT FROM (to_jsonb(OLD) -> key)
      ) changes;
    WHEN 'DELETE' THEN 
      v_action := lower(TG_TABLE_NAME) || '.deleted';
      v_changes := to_jsonb(OLD);
  END CASE;

  -- Get resource type from table name
  v_resource_type := regexp_replace(TG_TABLE_NAME, 's$', '');

  -- Get organization_id based on table
  CASE TG_TABLE_NAME
    WHEN 'organizations' THEN
      v_organization_id := COALESCE(NEW.id, OLD.id);
      v_resource_name := COALESCE(NEW.name, OLD.name);
    WHEN 'workspaces' THEN
      v_organization_id := COALESCE(NEW.organization_id, OLD.organization_id);
      v_resource_name := COALESCE(NEW.name, OLD.name);
    WHEN 'projects' THEN
      v_organization_id := COALESCE(NEW.organization_id, OLD.organization_id);
      v_resource_name := COALESCE(NEW.name, OLD.name);
    WHEN 'organization_members' THEN
      v_organization_id := COALESCE(NEW.organization_id, OLD.organization_id);
      v_resource_type := 'member';
    ELSE
      -- For other tables, try to get org_id from organization_id column
      v_organization_id := COALESCE(
        (NEW.organization_id)::uuid,
        (OLD.organization_id)::uuid
      );
  END CASE;

  -- Only log if we have an organization context
  IF v_organization_id IS NOT NULL AND v_user_id IS NOT NULL THEN
    INSERT INTO audit_logs (
      organization_id,
      actor_id,
      actor_type,
      action,
      resource_type,
      resource_id,
      resource_name,
      changes,
      result
    ) VALUES (
      v_organization_id,
      v_user_id,
      'user',
      v_action,
      v_resource_type,
      COALESCE(NEW.id, OLD.id)::text,
      v_resource_name,
      v_changes,
      'success'
    );
  END IF;

  -- Return appropriate value
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for important tables
DROP TRIGGER IF EXISTS audit_organizations ON organizations;
CREATE TRIGGER audit_organizations
  AFTER INSERT OR UPDATE OR DELETE ON organizations
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_workspaces ON workspaces;
CREATE TRIGGER audit_workspaces
  AFTER INSERT OR UPDATE OR DELETE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_projects ON projects;
CREATE TRIGGER audit_projects
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_organization_members ON organization_members;
CREATE TRIGGER audit_organization_members
  AFTER INSERT OR UPDATE OR DELETE ON organization_members
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_workspace_members ON workspace_members;
CREATE TRIGGER audit_workspace_members
  AFTER INSERT OR UPDATE OR DELETE ON workspace_members
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Specific trigger for login events (would be called from auth flow)
CREATE OR REPLACE FUNCTION log_auth_event(
  p_user_id uuid,
  p_action text,
  p_success boolean,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
) RETURNS void AS $$
DECLARE
  v_organization_ids uuid[];
BEGIN
  -- Get all organizations the user belongs to
  SELECT array_agg(organization_id) INTO v_organization_ids
  FROM organization_members
  WHERE user_id = p_user_id
  AND status = 'active';

  -- Log auth event for each organization
  IF v_organization_ids IS NOT NULL THEN
    INSERT INTO audit_logs (
      organization_id,
      actor_id,
      actor_type,
      action,
      resource_type,
      resource_id,
      result,
      ip_address,
      user_agent,
      metadata
    )
    SELECT 
      unnest(v_organization_ids),
      p_user_id,
      'user',
      p_action,
      'auth',
      p_user_id::text,
      CASE WHEN p_success THEN 'success' ELSE 'failure' END,
      p_ip_address,
      p_user_agent,
      p_metadata;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for cleaning old audit logs
CREATE OR REPLACE FUNCTION clean_old_audit_logs() RETURNS void AS $$
DECLARE
  v_org record;
  v_retention_days integer;
BEGIN
  -- For each organization, clean based on their retention settings
  FOR v_org IN SELECT id, (settings->'auditLogRetentionDays')::integer as retention_days FROM organizations
  LOOP
    v_retention_days := COALESCE(v_org.retention_days, 90);
    
    DELETE FROM audit_logs
    WHERE organization_id = v_org.id
    AND created_at < now() - (v_retention_days || ' days')::interval;
  END LOOP;
END;
$$ LANGUAGE plpgsql;