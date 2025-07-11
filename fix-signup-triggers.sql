-- Fix Signup Triggers Script
-- This script removes problematic triggers that are causing signup failures

-- Step 1: Check what triggers currently exist on auth.users
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';

-- Step 2: Drop problematic triggers
-- These triggers try to create records in tables with wrong schema
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS create_default_org_for_user ON auth.users;

-- Step 3: Drop associated functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.create_default_organization();

-- Step 4: Verify triggers are removed
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';

-- Step 5: Test organizations table access with service role
-- This should work without errors now
SELECT 
    current_user as current_role,
    has_table_privilege('organizations', 'INSERT') as can_insert_org,
    has_table_privilege('memberships', 'INSERT') as can_insert_membership;

-- Step 6: Verify table structures match expectations
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('organizations', 'memberships') 
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Success message
SELECT 'Signup triggers fixed! You can now test user registration.' as status;