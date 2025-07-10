-- User Avatar Management Table
-- Manages avatar uploads, versions, and metadata

CREATE TABLE IF NOT EXISTS user_avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Storage Information
  storage_path VARCHAR(500) NOT NULL, -- Path in Supabase Storage
  storage_bucket VARCHAR(100) DEFAULT 'avatars',
  public_url TEXT, -- CDN/public URL for the avatar
  
  -- File Information
  original_filename VARCHAR(255),
  file_size INTEGER NOT NULL, -- Size in bytes
  mime_type VARCHAR(100) NOT NULL,
  width INTEGER,
  height INTEGER,
  
  -- Image Processing
  is_processed BOOLEAN DEFAULT false,
  processing_status VARCHAR(20) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processing_error TEXT,
  
  -- Variants/Sizes
  variants JSONB DEFAULT '{}', -- Different sizes: {"small": "path", "medium": "path", "large": "path"}
  
  -- Status & Moderation
  is_active BOOLEAN DEFAULT false, -- Currently used avatar
  is_approved BOOLEAN DEFAULT true, -- Content moderation status
  moderation_notes TEXT,
  
  -- Security & Validation
  file_hash VARCHAR(64), -- SHA-256 hash for deduplication
  virus_scan_status VARCHAR(20) DEFAULT 'pending' CHECK (virus_scan_status IN ('pending', 'clean', 'infected', 'failed')),
  virus_scan_result TEXT,
  
  -- Metadata
  uploaded_via VARCHAR(50) DEFAULT 'web', -- 'web', 'mobile', 'api'
  upload_session_id VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- For temporary uploads
  
  -- Ensure unique active avatar per user
  UNIQUE(user_id, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Create indexes for avatar management
CREATE INDEX idx_user_avatars_user_id ON user_avatars(user_id);
CREATE INDEX idx_user_avatars_user_active ON user_avatars(user_id) WHERE is_active = true;
CREATE INDEX idx_user_avatars_storage_path ON user_avatars(storage_path);
CREATE INDEX idx_user_avatars_file_hash ON user_avatars(file_hash) WHERE file_hash IS NOT NULL;
CREATE INDEX idx_user_avatars_processing ON user_avatars(processing_status, created_at);
CREATE INDEX idx_user_avatars_expires_at ON user_avatars(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_user_avatars_moderation ON user_avatars(is_approved, moderation_notes) WHERE is_approved = false;

-- Add trigger for updated_at
CREATE TRIGGER trigger_user_avatars_updated_at
  BEFORE UPDATE ON user_avatars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to set new avatar as active (ensures only one active avatar per user)
CREATE OR REPLACE FUNCTION set_active_avatar()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting this avatar as active, deactivate all others for this user
  IF NEW.is_active = true THEN
    UPDATE user_avatars 
    SET is_active = false, updated_at = NOW()
    WHERE user_id = NEW.user_id 
      AND id != NEW.id 
      AND is_active = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce single active avatar
CREATE TRIGGER trigger_set_active_avatar
  BEFORE INSERT OR UPDATE OF is_active ON user_avatars
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION set_active_avatar();

-- Function to cleanup expired avatar uploads
CREATE OR REPLACE FUNCTION cleanup_expired_avatars()
RETURNS void AS $$
BEGIN
  -- Mark expired temporary uploads for deletion
  UPDATE user_avatars 
  SET processing_status = 'failed', 
      processing_error = 'Upload expired',
      updated_at = NOW()
  WHERE expires_at < NOW() 
    AND processing_status = 'pending';
END;
$$ LANGUAGE plpgsql;

-- Function to get user's current avatar
CREATE OR REPLACE FUNCTION get_user_avatar(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  public_url TEXT,
  storage_path VARCHAR,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  variants JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ua.id,
    ua.public_url,
    ua.storage_path,
    ua.width,
    ua.height,
    ua.file_size,
    ua.variants,
    ua.created_at
  FROM user_avatars ua
  WHERE ua.user_id = p_user_id 
    AND ua.is_active = true 
    AND ua.is_approved = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Avatar upload statistics view
CREATE VIEW avatar_stats AS
SELECT 
  DATE_TRUNC('day', created_at) as upload_date,
  COUNT(*) as total_uploads,
  COUNT(*) FILTER (WHERE processing_status = 'completed') as successful_uploads,
  COUNT(*) FILTER (WHERE processing_status = 'failed') as failed_uploads,
  COUNT(*) FILTER (WHERE is_active = true) as active_avatars,
  AVG(file_size) as avg_file_size,
  SUM(file_size) as total_storage_used
FROM user_avatars
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY upload_date DESC;

-- Add comments
COMMENT ON TABLE user_avatars IS 'User avatar management with processing, moderation, and versioning';
COMMENT ON COLUMN user_avatars.storage_path IS 'Path to the avatar file in storage bucket';
COMMENT ON COLUMN user_avatars.variants IS 'JSON object containing different avatar sizes and their paths';
COMMENT ON COLUMN user_avatars.file_hash IS 'SHA-256 hash for deduplication and integrity checking';
COMMENT ON COLUMN user_avatars.is_active IS 'Whether this is the currently displayed avatar for the user';
COMMENT ON COLUMN user_avatars.processing_status IS 'Status of image processing (resizing, optimization)';
COMMENT ON COLUMN user_avatars.virus_scan_status IS 'Result of virus/malware scanning';
COMMENT ON FUNCTION set_active_avatar() IS 'Ensures only one active avatar per user';
COMMENT ON FUNCTION cleanup_expired_avatars() IS 'Cleans up expired temporary avatar uploads';
COMMENT ON FUNCTION get_user_avatar(UUID) IS 'Returns the current active avatar for a user';
COMMENT ON VIEW avatar_stats IS 'Daily statistics for avatar uploads and storage usage';