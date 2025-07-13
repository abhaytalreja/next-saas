-- Fix users table RLS policies and any remaining activity function issues

-- 1. Add service role access to users table
CREATE POLICY "Service role has full access to users" ON users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2. Allow organization admins to read user profiles when inviting
CREATE POLICY "Organization admins can read user profiles for invitations" ON users
FOR SELECT
TO authenticated
USING (
  -- Allow reading user profiles if the current user is admin/owner of any organization
  EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.user_id = auth.uid()
    AND m.role IN ('admin', 'owner')
    AND m.accepted_at IS NOT NULL
  )
);

-- 3. Ensure the create_activity function is using the latest version
-- (Re-create to ensure it's properly updated)
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
  IF p_entity_type = 'organization' THEN
    org_id := p_entity_id;
  ELSIF p_entity_type = 'projects' THEN
    -- Use explicit table alias to avoid ambiguous column reference
    SELECT proj.organization_id, proj.id INTO org_id, proj_id
    FROM projects proj WHERE proj.id = p_entity_id;
  ELSIF p_entity_type = 'items' THEN
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

-- 4. Check if there are any issues with the activities table RLS
-- Add service role access to activities table if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'activities' 
    AND policyname = 'Service role has full access to activities'
  ) THEN
    EXECUTE 'CREATE POLICY "Service role has full access to activities" ON activities
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true)';
  END IF;
END $$;

-- 5. Ensure organization_events table (used in invitation API) has proper RLS
DO $$
BEGIN
  -- Enable RLS if not already enabled
  ALTER TABLE organization_events ENABLE ROW LEVEL SECURITY;
  
  -- Add service role access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'organization_events' 
    AND policyname = 'Service role has full access to organization_events'
  ) THEN
    EXECUTE 'CREATE POLICY "Service role has full access to organization_events" ON organization_events
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true)';
  END IF;
  
  -- Allow organization members to create events
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'organization_events' 
    AND policyname = 'Organization members can create events'
  ) THEN
    EXECUTE 'CREATE POLICY "Organization members can create events" ON organization_events
    FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM memberships m
        WHERE m.organization_id = organization_events.organization_id
        AND m.user_id = auth.uid()
        AND m.accepted_at IS NOT NULL
      )
    )';
  END IF;
  
  -- Allow organization members to view events
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'organization_events' 
    AND policyname = 'Organization members can view events'
  ) THEN
    EXECUTE 'CREATE POLICY "Organization members can view events" ON organization_events
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM memberships m
        WHERE m.organization_id = organization_events.organization_id
        AND m.user_id = auth.uid()
        AND m.accepted_at IS NOT NULL
      )
    )';
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    -- Table doesn't exist, skip
    NULL;
END $$;