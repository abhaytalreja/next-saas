-- Flexible Content Items
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES items(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL, -- property, crypto_position, product, task, etc.
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  description TEXT,
  content TEXT, -- Rich text content
  data JSONB DEFAULT '{}', -- Flexible data storage
  metadata JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'active',
  priority INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0, -- For ordering
  tags TEXT[] DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(organization_id, project_id, slug)
);

-- Create indexes
CREATE INDEX idx_items_organization_id ON items(organization_id);
CREATE INDEX idx_items_project_id ON items(project_id);
CREATE INDEX idx_items_parent_id ON items(parent_id);
CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_created_by ON items(created_by);
CREATE INDEX idx_items_assigned_to ON items(assigned_to);
CREATE INDEX idx_items_tags ON items USING GIN(tags);
CREATE INDEX idx_items_deleted_at ON items(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_items_data ON items USING GIN(data);

-- Add comments
COMMENT ON TABLE items IS 'Flexible content items that can represent any entity type';
COMMENT ON COLUMN items.type IS 'Item type (property, product, task, etc.)';
COMMENT ON COLUMN items.parent_id IS 'Parent item for hierarchical structures';
COMMENT ON COLUMN items.data IS 'Flexible JSON data based on item type';
COMMENT ON COLUMN items.position IS 'Order position within parent or project';
COMMENT ON COLUMN items.tags IS 'Array of tags for categorization';