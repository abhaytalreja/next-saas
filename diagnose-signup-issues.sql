-- Comprehensive Database Diagnosis for Signup Issues
-- Run this in your Supabase SQL Editor to identify all potential blockers
-- Generated: 2025-07-10

-- =============================================
-- 1. CHECK FOR TRIGGERS ON CRITICAL TABLES
-- =============================================

SELECT 
    'TRIGGERS ON ORGANIZATIONS TABLE' as section,
    trigger_name,
    trigger_schema,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'public' 
AND event_object_table = 'organizations';

SELECT 
    'TRIGGERS ON MEMBERSHIPS TABLE' as section,
    trigger_name,
    trigger_schema,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'public' 
AND event_object_table = 'memberships';

SELECT 
    'TRIGGERS ON USERS TABLE' as section,
    trigger_name,
    trigger_schema,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'public' 
AND event_object_table = 'users';

-- Check for any triggers on auth.users
SELECT 
    'TRIGGERS ON AUTH.USERS TABLE' as section,
    trigger_name,
    trigger_schema,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
AND event_object_table = 'users';

-- =============================================
-- 2. CHECK FOR DATABASE FUNCTIONS
-- =============================================

SELECT 
    'DATABASE FUNCTIONS' as section,
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND (
    routine_name LIKE '%user%' 
    OR routine_name LIKE '%organization%' 
    OR routine_name LIKE '%member%'
    OR routine_name LIKE '%signup%'
    OR routine_name LIKE '%auth%'
);

-- =============================================
-- 3. CHECK RLS POLICIES ON CRITICAL TABLES
-- =============================================

-- Organizations RLS policies
SELECT 
    'ORGANIZATIONS RLS POLICIES' as section,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'organizations';

-- Memberships RLS policies  
SELECT 
    'MEMBERSHIPS RLS POLICIES' as section,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'memberships';

-- Users RLS policies
SELECT 
    'USERS RLS POLICIES' as section,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users';

-- =============================================
-- 4. CHECK AUTH HOOKS AND WEBHOOKS
-- =============================================

-- Check for any auth hooks in the auth schema
SELECT 
    'AUTH SCHEMA FUNCTIONS' as section,
    routine_name,
    routine_type,
    external_language
FROM information_schema.routines 
WHERE routine_schema = 'auth';

-- =============================================
-- 5. CHECK TABLE CONSTRAINTS
-- =============================================

-- Check organizations table constraints
SELECT 
    'ORGANIZATIONS CONSTRAINTS' as section,
    constraint_name,
    constraint_type,
    table_schema,
    table_name
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
AND table_name = 'organizations';

-- Check memberships table constraints
SELECT 
    'MEMBERSHIPS CONSTRAINTS' as section,
    constraint_name,
    constraint_type,
    table_schema,
    table_name
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
AND table_name = 'memberships';

-- Check users table constraints
SELECT 
    'USERS CONSTRAINTS' as section,
    constraint_name,
    constraint_type,
    table_schema,
    table_name
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- =============================================
-- 6. CHECK FOREIGN KEY CONSTRAINTS
-- =============================================

SELECT 
    'FOREIGN KEY CONSTRAINTS' as section,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
AND (tc.table_name = 'organizations' OR tc.table_name = 'memberships' OR tc.table_name = 'users');

-- =============================================
-- 7. TEST SAMPLE INSERTS TO IDENTIFY BLOCKERS
-- =============================================

-- Test 1: Try to insert into users table (should work with service role)
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    BEGIN
        INSERT INTO users (email, name, created_at, updated_at) 
        VALUES ('test-user-' || extract(epoch from now()) || '@example.com', 'Test User', NOW(), NOW())
        RETURNING id INTO test_user_id;
        
        RAISE NOTICE 'SUCCESS: Users table insert worked. User ID: %', test_user_id;
        
        -- Clean up
        DELETE FROM users WHERE id = test_user_id;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: Users table insert failed: %', SQLERRM;
    END;
END $$;

-- Test 2: Try to insert into organizations table
DO $$
DECLARE
    test_org_id UUID;
    test_user_id UUID;
BEGIN
    BEGIN
        -- First create a test user
        INSERT INTO users (email, name, created_at, updated_at) 
        VALUES ('test-org-user-' || extract(epoch from now()) || '@example.com', 'Test Org User', NOW(), NOW())
        RETURNING id INTO test_user_id;
        
        -- Then try to create organization
        INSERT INTO organizations (name, slug, created_by, created_at, updated_at) 
        VALUES ('Test Org ' || extract(epoch from now()), 'test-org-' || extract(epoch from now()), test_user_id, NOW(), NOW())
        RETURNING id INTO test_org_id;
        
        RAISE NOTICE 'SUCCESS: Organizations table insert worked. Org ID: %', test_org_id;
        
        -- Clean up
        DELETE FROM organizations WHERE id = test_org_id;
        DELETE FROM users WHERE id = test_user_id;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: Organizations table insert failed: %', SQLERRM;
        -- Clean up user if it was created
        IF test_user_id IS NOT NULL THEN
            DELETE FROM users WHERE id = test_user_id;
        END IF;
    END;
END $$;

-- Test 3: Try to insert into memberships table
DO $$
DECLARE
    test_user_id UUID;
    test_org_id UUID;
    test_membership_id UUID;
BEGIN
    BEGIN
        -- Create test user
        INSERT INTO users (email, name, created_at, updated_at) 
        VALUES ('test-member-user-' || extract(epoch from now()) || '@example.com', 'Test Member User', NOW(), NOW())
        RETURNING id INTO test_user_id;
        
        -- Create test organization
        INSERT INTO organizations (name, slug, created_by, created_at, updated_at) 
        VALUES ('Test Member Org ' || extract(epoch from now()), 'test-member-org-' || extract(epoch from now()), test_user_id, NOW(), NOW())
        RETURNING id INTO test_org_id;
        
        -- Try to create membership
        INSERT INTO memberships (user_id, organization_id, role, accepted_at, created_at, updated_at) 
        VALUES (test_user_id, test_org_id, 'owner', NOW(), NOW(), NOW())
        RETURNING id INTO test_membership_id;
        
        RAISE NOTICE 'SUCCESS: Memberships table insert worked. Membership ID: %', test_membership_id;
        
        -- Clean up
        DELETE FROM memberships WHERE id = test_membership_id;
        DELETE FROM organizations WHERE id = test_org_id;
        DELETE FROM users WHERE id = test_user_id;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: Memberships table insert failed: %', SQLERRM;
        -- Clean up
        IF test_membership_id IS NOT NULL THEN
            DELETE FROM memberships WHERE id = test_membership_id;
        END IF;
        IF test_org_id IS NOT NULL THEN
            DELETE FROM organizations WHERE id = test_org_id;
        END IF;
        IF test_user_id IS NOT NULL THEN
            DELETE FROM users WHERE id = test_user_id;
        END IF;
    END;
END $$;

-- =============================================
-- 8. CHECK FOR EXTENSION DEPENDENCIES
-- =============================================

SELECT 
    'INSTALLED EXTENSIONS' as section,
    extname,
    extversion
FROM pg_extension;

-- =============================================
-- 9. CHECK CURRENT USER PERMISSIONS
-- =============================================

SELECT 
    'CURRENT USER AND ROLE' as section,
    current_user as current_user,
    current_role as current_role,
    session_user as session_user;

-- Check what permissions current user has
SELECT 
    'USER PERMISSIONS' as section,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND table_name IN ('users', 'organizations', 'memberships')
AND grantee = current_user;

-- =============================================
-- 10. CHECK FOR ANY CUSTOM TYPES
-- =============================================

SELECT 
    'CUSTOM TYPES' as section,
    typname,
    typtype
FROM pg_type 
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND typtype = 'e'; -- enum types

-- =============================================
-- FINAL STATUS
-- =============================================

SELECT 'DATABASE DIAGNOSIS COMPLETE' as final_status, NOW() as completed_at;