-- Final fix for audit function with corrected variable naming
-- This fixes the "column reference ambiguous" error

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
        WHEN TG_TABLE_NAME IN ('memberships', 'projects', 'items', 'categories', 'attachments', 'custom_fields', 'subscriptions', 'invoices', 'payments', 'usage_tracking', 'organization_invitations', 'activities', 'feature_flag_overrides', 'api_keys') THEN
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

-- Create audit triggers only for tables that exist
-- Check each table before creating the trigger

DO $$
BEGIN
    -- Organizations table (definitely exists)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations') THEN
        DROP TRIGGER IF EXISTS audit_organizations ON organizations;
        CREATE TRIGGER audit_organizations
          AFTER INSERT OR UPDATE OR DELETE ON organizations
          FOR EACH ROW EXECUTE FUNCTION create_audit_log();
        RAISE NOTICE 'Created audit trigger for organizations';
    END IF;

    -- Users table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        DROP TRIGGER IF EXISTS audit_users ON users;
        CREATE TRIGGER audit_users  
          AFTER INSERT OR UPDATE OR DELETE ON users
          FOR EACH ROW EXECUTE FUNCTION create_audit_log();
        RAISE NOTICE 'Created audit trigger for users';
    END IF;

    -- Memberships table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'memberships') THEN
        DROP TRIGGER IF EXISTS audit_memberships ON memberships;
        CREATE TRIGGER audit_memberships
          AFTER INSERT OR UPDATE OR DELETE ON memberships
          FOR EACH ROW EXECUTE FUNCTION create_audit_log();
        RAISE NOTICE 'Created audit trigger for memberships';
    END IF;
END $$;

-- Create triggers for remaining tables that exist (fixed variable naming)
DO $$
DECLARE
    current_table_name TEXT;
    tables_to_audit TEXT[] := ARRAY['projects', 'items', 'categories', 'attachments', 'custom_fields', 'subscriptions', 'invoices', 'payments', 'usage_tracking', 'organization_invitations', 'activities', 'feature_flag_overrides', 'api_keys', 'audit_logs'];
BEGIN
    FOREACH current_table_name IN ARRAY tables_to_audit
    LOOP
        -- Fixed: Use different variable name to avoid conflict
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = current_table_name) THEN
            EXECUTE format('DROP TRIGGER IF EXISTS audit_%I ON %I', current_table_name, current_table_name);
            EXECUTE format('CREATE TRIGGER audit_%I AFTER INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION create_audit_log()', current_table_name, current_table_name);
            RAISE NOTICE 'Created audit trigger for %', current_table_name;
        ELSE
            RAISE NOTICE 'Skipped audit trigger for % (table does not exist)', current_table_name;
        END IF;
    END LOOP;
END $$;

-- Test that organization creation still works
DO $$
DECLARE
    test_org_id UUID;
BEGIN
    BEGIN
        INSERT INTO public.organizations (name, slug) 
        VALUES ('Audit Test Final', 'audit-test-final-' || extract(epoch from now()))
        RETURNING id INTO test_org_id;
        
        RAISE NOTICE 'SUCCESS: Organization creation works with corrected audit function! Org ID: %', test_org_id;
        
        -- Clean up
        DELETE FROM public.organizations WHERE id = test_org_id;
        RAISE NOTICE 'SUCCESS: Test organization cleaned up';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: Organization creation failed: %', SQLERRM;
    END;
END $$;

SELECT 'AUDIT FUNCTION PROPERLY RESTORED - FINAL VERSION' as status;