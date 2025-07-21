-- Create a function that gets project data with access check
-- This bypasses RLS by running as SECURITY DEFINER

CREATE OR REPLACE FUNCTION get_project_with_access_check(
  project_id_param UUID,
  user_id_param UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_data JSON;
  user_membership RECORD;
BEGIN
  -- First check if project exists
  SELECT to_json(p.*) INTO project_data
  FROM projects p
  WHERE p.id = project_id_param
    AND p.deleted_at IS NULL;
  
  -- If no project found, return null
  IF project_data IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Check if user has access to the project's organization
  SELECT * INTO user_membership
  FROM memberships m
  WHERE m.organization_id = (project_data->>'organization_id')::UUID
    AND m.user_id = user_id_param
    AND m.accepted_at IS NOT NULL;
  
  -- If no membership, return null (don't reveal project exists)
  IF user_membership IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Return the project data
  RETURN project_data;
END;
$$;

-- Test the function with your specific data
SELECT get_project_with_access_check(
  '9402c130-99e8-4f2a-8c11-2951efb61e42'::UUID,
  'c840ec50-4aeb-4c30-8f28-e6cd79f259cf'::UUID
);