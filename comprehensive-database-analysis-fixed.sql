-- Comprehensive Database Analysis Script (Fixed)
-- This will examine all tables, triggers, functions, and policies to identify the root cause

-- ===================================================================
-- 1. EXAMINE ALL TRIGGERS IN THE DATABASE
-- ===================================================================

SELECT 
    '=== ALL DATABASE TRIGGERS ===' as section,
    event_object_schema as schema_name,
    event_object_table as table_name,
    trigger_name,
    event_manipulation as event_type,
    action_timing,
    action_orientation,
    action_statement
FROM information_schema.triggers 
ORDER BY event_object_schema, event_object_table, trigger_name;

-- ===================================================================
-- 2. EXAMINE ALL FUNCTIONS THAT MIGHT BE CALLED BY TRIGGERS
-- ===================================================================

SELECT 
    '=== ALL DATABASE FUNCTIONS ===' as section,
    routine_schema as schema_name,
    routine_name as function_name,
    routine_type,
    external_language,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema IN ('public', 'auth')
ORDER BY routine_schema, routine_name;

-- ===================================================================
-- 3. EXAMINE RLS POLICIES ON CRITICAL TABLES
-- ===================================================================

SELECT 
    '=== RLS POLICIES ===' as section,
    schemaname as schema_name,
    tablename as table_name,
    policyname as policy_name,
    permissive,
    roles,
    cmd as command_type,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'organizations', 'memberships')
ORDER BY tablename, policyname;

-- ===================================================================
-- 4. CHECK TABLE CONSTRAINTS AND FOREIGN KEYS
-- ===================================================================

SELECT 
    '=== TABLE CONSTRAINTS ===' as section,
    tc.table_schema as schema_name,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
LEFT JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
AND tc.table_name IN ('users', 'organizations', 'memberships')
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

-- ===================================================================
-- 5. EXAMINE TABLE STRUCTURES
-- ===================================================================

SELECT 
    '=== TABLE COLUMNS ===' as section,
    table_schema as schema_name,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'organizations', 'memberships')
ORDER BY table_name, ordinal_position;

-- ===================================================================
-- 6. CHECK FOR VIEWS THAT MIGHT BE INTERFERING
-- ===================================================================

SELECT 
    '=== VIEWS ===' as section,
    table_schema as schema_name,
    table_name as view_name,
    view_definition
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- ===================================================================
-- 7. CHECK EVENT TRIGGERS (DATABASE-LEVEL TRIGGERS)
-- ===================================================================

SELECT 
    '=== EVENT TRIGGERS ===' as section,
    evtname as trigger_name,
    evtevent as event_type,
    evtfoid::regproc as function_name,
    evtenabled as enabled
FROM pg_event_trigger 
ORDER BY evtname;

-- ===================================================================
-- 8. EXAMINE EXTENSIONS THAT MIGHT AFFECT TRIGGERS
-- ===================================================================

SELECT 
    '=== INSTALLED EXTENSIONS ===' as section,
    extname as extension_name,
    extversion as version,
    extrelocatable as relocatable
FROM pg_extension 
ORDER BY extname;

-- ===================================================================
-- 9. CHECK FOR CUSTOM DOMAINS (SIMPLIFIED)
-- ===================================================================

SELECT 
    '=== CUSTOM DOMAINS ===' as section,
    domain_schema as schema_name,
    domain_name,
    data_type,
    domain_default
FROM information_schema.domains 
WHERE domain_schema = 'public'
ORDER BY domain_name;

-- ===================================================================
-- 10. SPECIFIC DIAGNOSTIC FOR THE "organization_id" ERROR
-- ===================================================================

-- Look for any function that references "organization_id"
SELECT 
    '=== FUNCTIONS REFERENCING organization_id ===' as section,
    routine_schema as schema_name,
    routine_name as function_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_definition ILIKE '%organization_id%'
ORDER BY routine_schema, routine_name;

-- Look for any trigger that might be using "organization_id"
SELECT 
    '=== TRIGGERS REFERENCING organization_id ===' as section,
    event_object_schema as schema_name,
    event_object_table as table_name,
    trigger_name,
    action_statement
FROM information_schema.triggers 
WHERE action_statement ILIKE '%organization_id%'
ORDER BY event_object_schema, event_object_table;

-- ===================================================================
-- 11. CHECK FOR TRIGGERS ON ALL SCHEMAS (NOT JUST PUBLIC/AUTH)
-- ===================================================================

SELECT 
    '=== ALL TRIGGERS (ALL SCHEMAS) ===' as section,
    event_object_schema as schema_name,
    event_object_table as table_name,
    trigger_name,
    event_manipulation as event_type,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('users', 'organizations', 'memberships')
OR action_statement ILIKE '%organization_id%'
OR action_statement ILIKE '%handle_%'
ORDER BY event_object_schema, event_object_table, trigger_name;

-- ===================================================================
-- 12. FINAL STATUS CHECK
-- ===================================================================

SELECT 
    '=== DIAGNOSTIC COMPLETE ===' as section,
    'Check the results above to identify what is causing the organization_id field error' as next_steps,
    NOW() as completed_at;