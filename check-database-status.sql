-- Comprehensive Database Status Check
-- Run this in Supabase SQL Editor to diagnose remaining issues

-- 1. Check if auth.users table exists and is accessible
SELECT 
    'auth.users table check' as test,
    count(*) as user_count
FROM auth.users;

-- 2. Check for any remaining triggers on auth.users
SELECT 
    'Triggers on auth.users' as info,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
AND event_object_table = 'users';

-- 3. Check if profiles table exists and structure
SELECT 
    'profiles table structure' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. Check if organizations table exists and structure
SELECT 
    'organizations table structure' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'organizations'
ORDER BY ordinal_position;

-- 5. Check if organization_members table exists and structure
SELECT 
    'organization_members table structure' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'organization_members'
ORDER BY ordinal_position;

-- 6. Check RLS status
SELECT 
    'RLS status' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'organizations', 'organization_members');

-- 7. Try to insert a test user directly (this will show the exact error)
DO $$
BEGIN
    BEGIN
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_user_meta_data
        ) VALUES (
            gen_random_uuid(),
            'test-direct-insert@example.com',
            crypt('testpassword', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"test": true}'::jsonb
        );
        RAISE NOTICE 'SUCCESS: Direct user insert worked';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: Direct user insert failed: %', SQLERRM;
    END;
END $$;

-- 8. Check if there are any problematic functions still running
SELECT 
    'Functions that might cause issues' as info,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%user%' 
OR routine_name LIKE '%profile%'
OR routine_name LIKE '%organization%';

SELECT 'Database status check complete' as final_status; 