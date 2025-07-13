-- Fix and re-enable the activity trigger
-- Migration: 011_fix_and_reenable_activity_trigger  
-- Date: 2025-01-12

-- Create a more robust auto_create_activity function
CREATE OR REPLACE FUNCTION public.auto_create_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  action_type VARCHAR;
  entity_title VARCHAR;
  table_name TEXT;
BEGIN
  -- Get the actual table name
  table_name := TG_TABLE_NAME;
  
  -- Determine action type
  action_type := CASE TG_OP
    WHEN 'INSERT' THEN 'created'
    WHEN 'UPDATE' THEN 'updated'
    WHEN 'DELETE' THEN 'deleted'
  END || '_' || table_name;

  -- Get entity title based on table and handle NULL cases safely
  BEGIN
    entity_title := CASE table_name
      WHEN 'projects' THEN 
        CASE WHEN TG_OP = 'DELETE' THEN OLD.name ELSE NEW.name END
      WHEN 'items' THEN 
        CASE WHEN TG_OP = 'DELETE' THEN OLD.title ELSE NEW.title END
      WHEN 'organizations' THEN 
        CASE WHEN TG_OP = 'DELETE' THEN OLD.name ELSE NEW.name END
      ELSE 'Unknown'
    END;
  EXCEPTION
    WHEN OTHERS THEN
      entity_title := 'Unknown';
  END;

  -- Create activity safely
  BEGIN
    PERFORM create_activity(
      action_type,
      table_name,
      CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
      entity_title
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't fail the main operation
      RAISE WARNING 'Failed to create activity log: %', SQLERRM;
  END;

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$function$;

-- Re-enable the trigger
CREATE TRIGGER activity_projects 
  AFTER INSERT OR UPDATE OR DELETE ON public.projects 
  FOR EACH ROW 
  EXECUTE FUNCTION auto_create_activity();