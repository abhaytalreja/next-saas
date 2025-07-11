-- Temporarily disable ALL triggers on organizations table to test if it works

-- First, let's see what triggers exist on organizations
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'organizations' 
AND event_object_schema = 'public';

-- Disable ALL triggers on organizations table temporarily
ALTER TABLE public.organizations DISABLE TRIGGER ALL;

-- Test organization creation
DO $$
DECLARE
    test_org_id UUID;
BEGIN
    BEGIN
        INSERT INTO public.organizations (name, slug) 
        VALUES ('Trigger Disabled Test', 'trigger-disabled-test-' || extract(epoch from now()))
        RETURNING id INTO test_org_id;
        
        RAISE NOTICE 'SUCCESS: Organization creation works with all triggers disabled! Org ID: %', test_org_id;
        
        -- Clean up
        DELETE FROM public.organizations WHERE id = test_org_id;
        RAISE NOTICE 'SUCCESS: Test organization cleaned up';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: Organization creation still failing even with triggers disabled: %', SQLERRM;
    END;
END $$;

-- Re-enable triggers
ALTER TABLE public.organizations ENABLE TRIGGER ALL;

SELECT 'TRIGGER TEST COMPLETE' as status;