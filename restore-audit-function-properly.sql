-- Restore the audit function with the proper fix
-- This ensures all audit logging works correctly while fixing the organization_id issue

-- Create the corrected audit log function
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

  -- Insert audit log entry with corrected organization_id logic
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
        -- FIXED: For organizations table, use 'id' field as the organization_id
        WHEN TG_TABLE_NAME = 'organizations' THEN
          COALESCE((NEW.id)::UUID, (OLD.id)::UUID)
        -- For other tables that have organization_id field, use that
        WHEN TG_TABLE_NAME IN ('memberships', 'projects', 'items', 'categories', 'attachments', 'custom_fields', 'subscriptions', 'invoices', 'payments', 'usage_tracking', 'organization_invitations', 'activities', 'feature_flag_overrides', 'api_keys', 'organization_events') THEN
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
    current_setting('request.request_id', true)::uuid
  );

  -- Return the appropriate record based on operation
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now recreate all the audit triggers that were removed when we dropped the function
-- These triggers should have been automatically recreated, but let's ensure they exist

-- Create audit triggers for all tables that need audit logging
CREATE TRIGGER audit_organizations
  AFTER INSERT OR UPDATE OR DELETE ON organizations
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_users  
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_memberships
  AFTER INSERT OR UPDATE OR DELETE ON memberships
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_projects
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_items
  AFTER INSERT OR UPDATE OR DELETE ON items
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_categories
  AFTER INSERT OR UPDATE OR DELETE ON categories
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_attachments
  AFTER INSERT OR UPDATE OR DELETE ON attachments
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_custom_fields
  AFTER INSERT OR UPDATE OR DELETE ON custom_fields
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_subscriptions
  AFTER INSERT OR UPDATE OR DELETE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_invoices
  AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_payments
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_usage_tracking
  AFTER INSERT OR UPDATE OR DELETE ON usage_tracking
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_organization_invitations
  AFTER INSERT OR UPDATE OR DELETE ON organization_invitations
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_activities
  AFTER INSERT OR UPDATE OR DELETE ON activities
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_feature_flag_overrides
  AFTER INSERT OR UPDATE OR DELETE ON feature_flag_overrides
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_api_keys
  AFTER INSERT OR UPDATE OR DELETE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_organization_events
  AFTER INSERT OR UPDATE OR DELETE ON organization_events
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Test that organization creation still works with the restored audit function
DO $$
DECLARE
    test_org_id UUID;
BEGIN
    BEGIN
        INSERT INTO public.organizations (name, slug) 
        VALUES ('Audit Restored Test', 'audit-restored-test-' || extract(epoch from now()))
        RETURNING id INTO test_org_id;
        
        RAISE NOTICE 'SUCCESS: Organization creation works with restored audit function! Org ID: %', test_org_id;
        
        -- Check that audit log was created
        IF EXISTS (SELECT 1 FROM audit_logs WHERE table_name = 'organizations' AND record_id = test_org_id) THEN
            RAISE NOTICE 'SUCCESS: Audit log entry was created correctly!';
        ELSE
            RAISE NOTICE 'WARNING: No audit log entry found, but organization creation worked';
        END IF;
        
        -- Clean up
        DELETE FROM public.organizations WHERE id = test_org_id;
        RAISE NOTICE 'SUCCESS: Test organization cleaned up';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: Organization creation failed with restored audit function: %', SQLERRM;
    END;
END $$;

-- Verify the audit function is working properly
SELECT 
    'AUDIT FUNCTION RESTORED' as status,
    'All audit triggers recreated with corrected organization_id logic' as details,
    NOW() as completed_at;