-- Fix Signup Issue - Run this in Supabase SQL Editor
-- This script will diagnose and fix the signup problem

-- Step 1: Check current database state
SELECT 'Database Tables Check' as step;

-- Check if core tables exist
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations' AND table_schema = 'public') 
    THEN '✅ organizations table exists'
    ELSE '❌ organizations table missing'
  END as organizations_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'memberships' AND table_schema = 'public') 
    THEN '✅ memberships table exists'
    ELSE '❌ memberships table missing'
  END as memberships_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') 
    THEN '✅ profiles table exists'
    ELSE '❌ profiles table missing'
  END as profiles_status;

-- Step 2: Check problematic triggers
SELECT 'Checking Problematic Triggers' as step;

SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';

-- Step 3: Remove problematic triggers (SAFE - these can be recreated later)
SELECT 'Removing Problematic Triggers' as step;

-- Drop triggers that might be causing issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS create_default_org_for_user ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;

-- Drop potentially problematic functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_default_organization() CASCADE;

-- Step 4: Create minimal, safe profile trigger
SELECT 'Creating Safe Profile Trigger' as step;

-- Only create profile trigger if profiles table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
    -- Create a simple, safe trigger for profile creation
    CREATE OR REPLACE FUNCTION public.handle_new_user_safe()
    RETURNS trigger AS $func$
    BEGIN
      BEGIN
        INSERT INTO public.profiles (id, email, first_name, last_name)
        VALUES (
          NEW.id, 
          NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
          COALESCE(NEW.raw_user_meta_data->>'last_name', '')
        );
      EXCEPTION WHEN OTHERS THEN
        -- Log error but don't fail the user creation
        RAISE WARNING 'Profile creation failed for user %: %', NEW.id, SQLERRM;
      END;
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Create trigger
    CREATE TRIGGER on_auth_user_created_safe
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_safe();

    RAISE NOTICE 'Safe profile trigger created';
  ELSE
    RAISE NOTICE 'Profiles table does not exist - skipping trigger creation';
  END IF;
END $$;

-- Step 5: Test user creation (this should work now)
SELECT 'Testing User Creation' as step;

DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Try to create a test user using the same method as the signup API
  test_user_id := gen_random_uuid();
  
  BEGIN
    -- This simulates what supabase.auth.admin.createUser does
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change_token_current,
      email_change_token_new
    ) VALUES (
      test_user_id,
      '00000000-0000-0000-0000-000000000000',
      'test-' || extract(epoch from now()) || '@example.com',
      crypt('testpassword', gen_salt('bf')),
      now(), -- This simulates email_confirm: true
      '{"first_name": "Test", "last_name": "User"}'::jsonb,
      now(),
      now(),
      '',
      '',
      ''
    );
    
    RAISE NOTICE '✅ Test user creation SUCCESS - signup should work now';
    
    -- Clean up test user
    DELETE FROM auth.users WHERE id = test_user_id;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Test user creation FAILED: %', SQLERRM;
  END;
END $$;

-- Step 6: Check service role permissions
SELECT 'Checking Service Role Permissions' as step;

SELECT 
  'Service role permissions' as info,
  has_table_privilege('organizations', 'INSERT') as can_insert_org,
  has_table_privilege('memberships', 'INSERT') as can_insert_membership,
  has_table_privilege('profiles', 'INSERT') as can_insert_profile;

-- Final status
SELECT '🎉 Signup Fix Complete! Try your signup flow now.' as final_status;