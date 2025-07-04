-- File Attachments
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL, -- item, project, user, etc.
  entity_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100),
  storage_provider VARCHAR(50) DEFAULT 'supabase', -- supabase, s3, etc.
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_attachments_organization_id ON attachments(organization_id);
CREATE INDEX idx_attachments_entity ON attachments(entity_type, entity_id);
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by);

-- Add comments
COMMENT ON TABLE attachments IS 'File attachments for various entities';
COMMENT ON COLUMN attachments.entity_type IS 'Type of entity this attachment belongs to';
COMMENT ON COLUMN attachments.entity_id IS 'ID of the entity this attachment belongs to';
COMMENT ON COLUMN attachments.file_size IS 'File size in bytes';
COMMENT ON COLUMN attachments.storage_provider IS 'Storage provider where file is stored';