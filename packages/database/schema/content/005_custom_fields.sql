-- Dynamic Custom Fields
CREATE TABLE IF NOT EXISTS custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type VARCHAR(100) NOT NULL, -- items, projects, users, etc.
  field_name VARCHAR(100) NOT NULL,
  field_label VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) NOT NULL, -- text, number, date, select, multiselect, boolean, json
  field_options JSONB DEFAULT '{}', -- For select/multiselect options
  validation_rules JSONB DEFAULT '{}', -- Validation constraints
  default_value JSONB,
  is_required BOOLEAN DEFAULT false,
  is_searchable BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true,
  help_text TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, entity_type, field_name)
);

-- Create indexes
CREATE INDEX idx_custom_fields_organization_id ON custom_fields(organization_id);
CREATE INDEX idx_custom_fields_entity_type ON custom_fields(entity_type);
CREATE INDEX idx_custom_fields_sort_order ON custom_fields(sort_order);

-- Custom Field Values
CREATE TABLE IF NOT EXISTS custom_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_field_id UUID NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(custom_field_id, entity_id)
);

-- Create indexes
CREATE INDEX idx_custom_field_values_custom_field_id ON custom_field_values(custom_field_id);
CREATE INDEX idx_custom_field_values_entity_id ON custom_field_values(entity_id);
CREATE INDEX idx_custom_field_values_value ON custom_field_values USING GIN(value);

-- Add comments
COMMENT ON TABLE custom_fields IS 'Dynamic custom fields for extending entity schemas';
COMMENT ON COLUMN custom_fields.entity_type IS 'Type of entity this field applies to';
COMMENT ON COLUMN custom_fields.field_type IS 'Data type of the custom field';
COMMENT ON COLUMN custom_fields.field_options IS 'Options for select fields';
COMMENT ON COLUMN custom_fields.validation_rules IS 'JSON schema for field validation';
COMMENT ON TABLE custom_field_values IS 'Values for custom fields';