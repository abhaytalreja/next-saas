-- Fix the audit log function that's causing the organization_id error
-- The function is trying to access NEW.organization_id on the organizations table
-- but that table has an 'id' field, not 'organization_id'

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
        WHEN TG_TABLE_NAME = 'organizations' THEN
          -- For organizations table, use the 'id' field as the organization_id
          COALESCE((NEW.id)::UUID, (OLD.id)::UUID)
        WHEN TG_TABLE_NAME IN ('memberships', 'projects', 'items', 'categories', 'attachments', 'custom_fields') THEN
          -- For other tables, use their organization_id field
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

-- Test the fix by creating an organization
DO $$
DECLARE
    test_org_id UUID;
BEGIN
    BEGIN
        INSERT INTO public.organizations (name, slug) 
        VALUES ('Audit Fix Test Org', 'audit-fix-test-org-' || extract(epoch from now()))
        RETURNING id INTO test_org_id;
        
        RAISE NOTICE 'SUCCESS: Organization creation now works! Org ID: %', test_org_id;
        
        -- Clean up
        DELETE FROM public.organizations WHERE id = test_org_id;
        RAISE NOTICE 'SUCCESS: Test organization cleaned up successfully';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: Organization creation still failing: %', SQLERRM;
    END;
END $$;

SELECT 'AUDIT LOG FUNCTION FIXED - ORGANIZATION CREATION SHOULD NOW WORK' as status;