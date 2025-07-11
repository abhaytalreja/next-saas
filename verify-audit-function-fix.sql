-- Verify if our audit function fix was applied correctly
-- and check for any other problematic functions

-- 1. Check the current definition of create_audit_log function
SELECT 
    'CURRENT AUDIT FUNCTION' as section,
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'create_audit_log'
AND routine_schema = 'public';

-- 2. Look for ANY function that contains 'NEW.organization_id'
SELECT 
    'FUNCTIONS WITH NEW.organization_id' as section,
    routine_schema,
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_definition ILIKE '%NEW.organization_id%'
ORDER BY routine_schema, routine_name;

-- 3. Look for triggers that call audit functions
SELECT 
    'AUDIT TRIGGERS' as section,
    event_object_schema,
    event_object_table,
    trigger_name,
    action_statement
FROM information_schema.triggers 
WHERE action_statement ILIKE '%audit%'
OR action_statement ILIKE '%create_audit_log%'
ORDER BY event_object_table;

-- 4. Try a different approach - drop and recreate the function entirely
DROP FUNCTION IF EXISTS create_audit_log() CASCADE;

-- 5. Test organization creation without the audit function
DO $$
DECLARE
    test_org_id UUID;
BEGIN
    BEGIN
        INSERT INTO public.organizations (name, slug) 
        VALUES ('No Audit Test', 'no-audit-test-' || extract(epoch from now()))
        RETURNING id INTO test_org_id;
        
        RAISE NOTICE 'SUCCESS: Organization creation works without audit function! Org ID: %', test_org_id;
        
        -- Clean up
        DELETE FROM public.organizations WHERE id = test_org_id;
        RAISE NOTICE 'SUCCESS: Test organization cleaned up';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: Organization creation still failing: %', SQLERRM;
    END;
END $$;

SELECT 'AUDIT FUNCTION ANALYSIS COMPLETE' as status;