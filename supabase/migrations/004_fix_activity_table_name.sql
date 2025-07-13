-- Fix create_activity function to handle table names correctly
-- Migration: 004_fix_activity_table_name
-- Date: 2025-01-12

CREATE OR REPLACE FUNCTION public.create_activity(
  p_action character varying, 
  p_entity_type character varying, 
  p_entity_id uuid, 
  p_entity_title character varying DEFAULT NULL::character varying, 
  p_description text DEFAULT NULL::text, 
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  activity_id UUID;
  org_id UUID;
  proj_id UUID;
  current_user_id UUID;
BEGIN
  -- Get current user ID to avoid ambiguous reference
  current_user_id := auth.uid();
  
  -- Determine organization and project based on entity type
  -- Handle both singular and plural forms since triggers pass table names (plural)
  IF p_entity_type IN ('organization', 'organizations') THEN
    org_id := p_entity_id;
  ELSIF p_entity_type IN ('project', 'projects') THEN
    -- Use explicit table alias to avoid ambiguous column reference
    SELECT proj.organization_id, proj.id INTO org_id, proj_id
    FROM projects proj WHERE proj.id = p_entity_id;
  ELSIF p_entity_type IN ('item', 'items') THEN
    SELECT item.organization_id, item.project_id INTO org_id, proj_id
    FROM items item WHERE item.id = p_entity_id;
  END IF;

  -- Insert activity with explicit user_id variable
  INSERT INTO activities (
    organization_id,
    project_id,
    user_id,
    action,
    entity_type,
    entity_id,
    entity_title,
    description,
    metadata
  ) VALUES (
    org_id,
    proj_id,
    current_user_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_entity_title,
    p_description,
    p_metadata
  ) RETURNING id INTO activity_id;

  RETURN activity_id;
END;
$function$;