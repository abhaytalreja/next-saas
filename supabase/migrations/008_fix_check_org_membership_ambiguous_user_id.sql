-- Fix the ambiguous user_id reference in check_org_membership function
-- Migration: 008_fix_check_org_membership_ambiguous_user_id
-- Date: 2025-01-12

-- The issue is that the function parameter 'user_id' conflicts with the table column 'user_id'
-- We need to qualify them properly

CREATE OR REPLACE FUNCTION public.check_org_membership(org_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.organization_id = org_id 
    AND m.user_id = check_org_membership.user_id  -- Explicitly qualify the function parameter
    AND m.accepted_at IS NOT NULL
  );
END;
$function$;