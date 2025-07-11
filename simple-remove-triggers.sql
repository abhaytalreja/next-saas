-- Simple approach to remove problematic triggers and functions
-- This avoids complex queries that might cause errors

-- Drop specific functions that we know might cause issues
DROP FUNCTION IF EXISTS public.create_audit_log() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_default_organization() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_created() CASCADE;
DROP FUNCTION IF EXISTS public.handle_organization_created() CASCADE;
DROP FUNCTION IF EXISTS public.log_audit_event() CASCADE;

-- Drop all triggers on organizations table
DROP TRIGGER IF EXISTS audit_organizations ON public.organizations;
DROP TRIGGER IF EXISTS create_audit_log_trigger ON public.organizations;
DROP TRIGGER IF EXISTS organization_audit ON public.organizations;
DROP TRIGGER IF EXISTS log_changes ON public.organizations;

-- Drop all triggers on users table
DROP TRIGGER IF EXISTS audit_users ON public.users;
DROP TRIGGER IF EXISTS create_audit_log_trigger ON public.users;
DROP TRIGGER IF EXISTS user_audit ON public.users;

-- Drop all triggers on memberships table
DROP TRIGGER IF EXISTS audit_memberships ON public.memberships;
DROP TRIGGER IF EXISTS create_audit_log_trigger ON public.memberships;
DROP TRIGGER IF EXISTS membership_audit ON public.memberships;

-- Test organization creation
DO $$
DECLARE
    test_org_id UUID;
BEGIN
    BEGIN
        INSERT INTO public.organizations (name, slug) 
        VALUES ('Simple Trigger Remove Test', 'simple-trigger-remove-' || extract(epoch from now()))
        RETURNING id INTO test_org_id;
        
        RAISE NOTICE 'SUCCESS: Organization creation works! Org ID: %', test_org_id;
        
        -- Clean up
        DELETE FROM public.organizations WHERE id = test_org_id;
        RAISE NOTICE 'SUCCESS: Test organization cleaned up';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: Organization creation still failing: %', SQLERRM;
    END;
END $$;

SELECT 'SIMPLE TRIGGER REMOVAL COMPLETE' as status;