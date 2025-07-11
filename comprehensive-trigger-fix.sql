-- Comprehensive Database Trigger Fix Script
-- Run this in your Supabase SQL Editor to remove ALL problematic triggers

-- ===================================================================
-- STEP 1: DIAGNOSTIC - Find all triggers that might be problematic
-- ===================================================================

-- Check triggers on auth.users
SELECT 
    'auth.users triggers' as table_name,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';

-- Check triggers on public.users
SELECT 
    'public.users triggers' as table_name,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'public';

-- Check triggers on public.organizations
SELECT 
    'public.organizations triggers' as table_name,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'organizations' 
AND event_object_schema = 'public';

-- Check triggers on public.memberships
SELECT 
    'public.memberships triggers' as table_name,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'memberships' 
AND event_object_schema = 'public';

-- ===================================================================
-- STEP 2: REMOVE ALL PROBLEMATIC TRIGGERS
-- ===================================================================

-- Drop triggers on auth.users (common names)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS create_default_org_for_user ON auth.users CASCADE;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users CASCADE;
DROP TRIGGER IF EXISTS user_created_trigger ON auth.users CASCADE;
DROP TRIGGER IF EXISTS create_user_profile ON auth.users CASCADE;

-- Drop triggers on public.users
DROP TRIGGER IF EXISTS on_user_created ON public.users CASCADE;
DROP TRIGGER IF EXISTS create_user_organization ON public.users CASCADE;
DROP TRIGGER IF EXISTS user_insert_trigger ON public.users CASCADE;
DROP TRIGGER IF EXISTS handle_user_insert ON public.users CASCADE;

-- Drop triggers on public.organizations  
DROP TRIGGER IF EXISTS on_organization_created ON public.organizations CASCADE;
DROP TRIGGER IF EXISTS organization_insert_trigger ON public.organizations CASCADE;
DROP TRIGGER IF EXISTS handle_organization_insert ON public.organizations CASCADE;

-- Drop triggers on public.memberships
DROP TRIGGER IF EXISTS on_membership_created ON public.memberships CASCADE;
DROP TRIGGER IF EXISTS membership_insert_trigger ON public.memberships CASCADE;

-- ===================================================================
-- STEP 3: REMOVE PROBLEMATIC FUNCTIONS
-- ===================================================================

-- Drop functions that are commonly problematic
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_default_organization() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_created() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile() CASCADE;
DROP FUNCTION IF EXISTS public.handle_organization_created() CASCADE;
DROP FUNCTION IF EXISTS public.create_organization_membership() CASCADE;

-- ===================================================================
-- STEP 4: VERIFY CLEANUP
-- ===================================================================

-- Check remaining triggers on critical tables
SELECT 
    'REMAINING TRIGGERS' as status,
    event_object_schema || '.' || event_object_table as table_name,
    trigger_name,
    event_manipulation
FROM information_schema.triggers 
WHERE event_object_table IN ('users', 'organizations', 'memberships')
AND event_object_schema IN ('auth', 'public')
ORDER BY event_object_schema, event_object_table, trigger_name;

-- ===================================================================
-- STEP 5: TEST BASIC OPERATIONS
-- ===================================================================

-- Test 1: Try to create an organization (should work now)
DO $$
DECLARE
    test_org_id UUID;
BEGIN
    BEGIN
        INSERT INTO public.organizations (name, slug) 
        VALUES ('Test Org ' || extract(epoch from now()), 'test-org-' || extract(epoch from now()))
        RETURNING id INTO test_org_id;
        
        RAISE NOTICE 'SUCCESS: Organization creation works! Org ID: %', test_org_id;
        
        -- Clean up
        DELETE FROM public.organizations WHERE id = test_org_id;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: Organization creation still failing: %', SQLERRM;
    END;
END $$;

-- Test 2: Try to create a user record (should work now)
DO $$
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    BEGIN
        INSERT INTO public.users (id, email, name) 
        VALUES (test_user_id, 'test-' || extract(epoch from now()) || '@example.com', 'Test User');
        
        RAISE NOTICE 'SUCCESS: User creation works!';
        
        -- Clean up
        DELETE FROM public.users WHERE id = test_user_id;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: User creation still failing: %', SQLERRM;
    END;
END $$;

-- ===================================================================
-- FINAL STATUS
-- ===================================================================

SELECT 'DATABASE TRIGGER CLEANUP COMPLETE' as status, NOW() as completed_at;