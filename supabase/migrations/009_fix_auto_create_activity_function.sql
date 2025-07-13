-- Fix auto_create_activity function to use correct field names
-- Migration: 009_fix_auto_create_activity_function
-- Date: 2025-01-12

-- The function was trying to access NEW.title but projects table has 'name' field
CREATE OR REPLACE FUNCTION public.auto_create_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  action_type VARCHAR;
  entity_title VARCHAR;
BEGIN
  -- Determine action type
  action_type := CASE TG_OP
    WHEN 'INSERT' THEN 'created'
    WHEN 'UPDATE' THEN 'updated'
    WHEN 'DELETE' THEN 'deleted'
  END || '_' || TG_TABLE_NAME;

  -- Get entity title based on table and correct field names
  entity_title := CASE TG_TABLE_NAME
    WHEN 'projects' THEN COALESCE(NEW.name, OLD.name)  -- projects has 'name' not 'title'
    WHEN 'items' THEN COALESCE(NEW.title, OLD.title)   -- items has 'title'
    WHEN 'organizations' THEN COALESCE(NEW.name, OLD.name)  -- organizations has 'name'
    ELSE NULL
  END;

  -- Create activity
  PERFORM create_activity(
    action_type,
    TG_TABLE_NAME::text,
    COALESCE(NEW.id, OLD.id),
    entity_title
  );

  RETURN NEW;
END;
$function$;