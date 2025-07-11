-- Find the specific function causing the organization_id error
-- This query will find any function that references organization_id

SELECT 
    'FUNCTIONS WITH organization_id REFERENCE' as section,
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%organization_id%'
ORDER BY n.nspname, p.proname;

-- Also search in a different way to catch all possible references
SELECT 
    'ROUTINES WITH organization_id REFERENCE' as section,
    routine_schema,
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_definition ILIKE '%organization_id%'
   OR routine_definition ILIKE '%NEW.organization_id%'
ORDER BY routine_schema, routine_name;