-- Function to create activity feed entries
CREATE OR REPLACE FUNCTION create_activity(
  p_action VARCHAR,
  p_entity_type VARCHAR,
  p_entity_id UUID,
  p_entity_title VARCHAR DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
  org_id UUID;
  proj_id UUID;
BEGIN
  -- Determine organization and project based on entity type
  IF p_entity_type = 'organization' THEN
    org_id := p_entity_id;
  ELSIF p_entity_type = 'project' THEN
    SELECT organization_id, id INTO org_id, proj_id
    FROM projects WHERE id = p_entity_id;
  ELSIF p_entity_type = 'item' THEN
    SELECT i.organization_id, i.project_id INTO org_id, proj_id
    FROM items i WHERE i.id = p_entity_id;
  END IF;

  -- Insert activity
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
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    p_entity_title,
    p_description,
    p_metadata
  ) RETURNING id INTO activity_id;

  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for automatic activity creation
CREATE OR REPLACE FUNCTION auto_create_activity()
RETURNS TRIGGER AS $$
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

  -- Get entity title based on table
  entity_title := CASE TG_TABLE_NAME
    WHEN 'projects' THEN COALESCE(NEW.name, OLD.name)
    WHEN 'items' THEN COALESCE(NEW.title, OLD.title)
    WHEN 'organizations' THEN COALESCE(NEW.name, OLD.name)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create activity triggers
CREATE TRIGGER activity_projects AFTER INSERT OR UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION auto_create_activity();

CREATE TRIGGER activity_items AFTER INSERT OR UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION auto_create_activity();