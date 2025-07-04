-- Categories for Content Organization
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7), -- Hex color
  metadata JSONB DEFAULT '{}',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, parent_id, slug)
);

-- Create indexes
CREATE INDEX idx_categories_organization_id ON categories(organization_id);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

-- Item-Category relationship
CREATE TABLE IF NOT EXISTS item_categories (
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  PRIMARY KEY (item_id, category_id)
);

-- Create indexes
CREATE INDEX idx_item_categories_item_id ON item_categories(item_id);
CREATE INDEX idx_item_categories_category_id ON item_categories(category_id);

-- Add comments
COMMENT ON TABLE categories IS 'Hierarchical categories for organizing content';
COMMENT ON COLUMN categories.parent_id IS 'Parent category for nested structures';
COMMENT ON TABLE item_categories IS 'Many-to-many relationship between items and categories';