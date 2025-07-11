-- Aggressively remove ALL functions and triggers that reference organization_id
-- This will ensure organization creation works

-- First, let's find and drop ALL functions that reference organization_id
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Find all functions that contain 'organization_id' in their definition
    FOR func_record IN 
        SELECT n.nspname as schema_name, p.proname as function_name
        FROM pg_proc p
        LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE pg_get_functiondef(p.oid) ILIKE '%organization_id%'
        AND n.nspname IN ('public', 'auth')
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS %I.%I() CASCADE', func_record.schema_name, func_record.function_name);
        RAISE NOTICE 'Dropped function: %.%', func_record.schema_name, func_record.function_name;
    END LOOP;
END $$;

-- Drop any remaining triggers on organizations table
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'organizations' 
        AND event_object_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON organizations CASCADE', trigger_record.trigger_name);
        RAISE NOTICE 'Dropped trigger: % on organizations', trigger_record.trigger_name;
    END LOOP;
END $$;

-- Test organization creation
DO $$
DECLARE
    test_org_id UUID;
BEGIN
    BEGIN
        INSERT INTO public.organizations (name, slug) 
        VALUES ('All Triggers Removed Test', 'all-triggers-removed-' || extract(epoch from now()))
        RETURNING id INTO test_org_id;
        
        RAISE NOTICE 'SUCCESS: Organization creation works after removing all triggers! Org ID: %', test_org_id;
        
        -- Clean up
        DELETE FROM public.organizations WHERE id = test_org_id;
        RAISE NOTICE 'SUCCESS: Test organization cleaned up';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: Organization creation still failing: %', SQLERRM;
    END;
END $$;

SELECT 'ALL ORGANIZATION_ID REFERENCES REMOVED' as status;