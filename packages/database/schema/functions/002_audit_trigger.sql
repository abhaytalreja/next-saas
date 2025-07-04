-- Function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  changed_fields TEXT[];
  old_data JSONB;
  new_data JSONB;
BEGIN
  -- Determine the action and set data accordingly
  IF TG_OP = 'INSERT' THEN
    old_data := NULL;
    new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
    
    -- Calculate changed fields
    SELECT array_agg(key) INTO changed_fields
    FROM jsonb_each(old_data) o
    FULL OUTER JOIN jsonb_each(new_data) n USING (key)
    WHERE o.value IS DISTINCT FROM n.value;
  ELSIF TG_OP = 'DELETE' THEN
    old_data := to_jsonb(OLD);
    new_data := NULL;
  END IF;

  -- Insert audit log entry
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    changed_fields,
    ip_address,
    user_agent,
    session_id,
    request_id
  ) VALUES (
    COALESCE(
      CASE 
        WHEN TG_TABLE_NAME IN ('organizations', 'memberships', 'projects', 'items', 'categories', 'attachments', 'custom_fields') THEN
          COALESCE((NEW.organization_id)::UUID, (OLD.organization_id)::UUID)
        ELSE NULL
      END,
      NULL
    ),
    auth.uid(),
    TG_TABLE_NAME,
    COALESCE((NEW.id)::UUID, (OLD.id)::UUID),
    TG_OP,
    old_data,
    new_data,
    changed_fields,
    current_setting('request.ip', true)::inet,
    current_setting('request.user_agent', true),
    current_setting('request.session_id', true)::uuid,
    current_setting('request.request_id', true)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for important tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_organizations AFTER INSERT OR UPDATE OR DELETE ON organizations
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_memberships AFTER INSERT OR UPDATE OR DELETE ON memberships
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_subscriptions AFTER INSERT OR UPDATE OR DELETE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_projects AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_items AFTER INSERT OR UPDATE OR DELETE ON items
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_custom_fields AFTER INSERT OR UPDATE OR DELETE ON custom_fields
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_api_keys AFTER INSERT OR UPDATE OR DELETE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();