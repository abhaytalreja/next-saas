-- Data Export Tables for GDPR Compliance
-- These tables manage user data export requests and files

-- Data export requests table
CREATE TABLE IF NOT EXISTS data_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Export configuration
    export_type TEXT NOT NULL CHECK (export_type IN ('full', 'profile', 'activity', 'preferences', 'avatars')),
    format TEXT NOT NULL CHECK (format IN ('json', 'csv')) DEFAULT 'json',
    
    -- Status tracking
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')) DEFAULT 'pending',
    
    -- File information
    filename TEXT,
    mime_type TEXT,
    file_size BIGINT,
    download_url TEXT,
    
    -- Timestamps
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Metadata
    export_options JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Data export file storage table (temporary storage for export content)
CREATE TABLE IF NOT EXISTS data_export_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    export_id UUID NOT NULL REFERENCES data_exports(id) ON DELETE CASCADE,
    
    -- File content (in production, this would reference external storage)
    content TEXT NOT NULL,
    content_hash TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_data_exports_user_id ON data_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_data_exports_status ON data_exports(status);
CREATE INDEX IF NOT EXISTS idx_data_exports_expires_at ON data_exports(expires_at);
CREATE INDEX IF NOT EXISTS idx_data_exports_created_at ON data_exports(created_at);
CREATE INDEX IF NOT EXISTS idx_data_export_files_export_id ON data_export_files(export_id);
CREATE INDEX IF NOT EXISTS idx_data_export_files_expires_at ON data_export_files(expires_at);

-- Triggers for updated_at
CREATE TRIGGER update_data_exports_updated_at
    BEFORE UPDATE ON data_exports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE data_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for data_exports
CREATE POLICY "Users can view their own data exports"
    ON data_exports FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own data exports"
    ON data_exports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data exports"
    ON data_exports FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for data_export_files
CREATE POLICY "Users can view their own export files"
    ON data_export_files FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM data_exports 
            WHERE data_exports.id = data_export_files.export_id 
            AND data_exports.user_id = auth.uid()
        )
    );

-- Service role policies for background processing
CREATE POLICY "Service role can manage all data exports"
    ON data_exports FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all export files"
    ON data_export_files FOR ALL
    USING (auth.role() = 'service_role');

-- Function to automatically clean up expired exports
CREATE OR REPLACE FUNCTION cleanup_expired_data_exports()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete expired export files first (foreign key constraint)
    DELETE FROM data_export_files 
    WHERE expires_at < NOW();
    
    -- Delete expired export records
    DELETE FROM data_exports 
    WHERE expires_at < NOW();
    
    -- Update expired but not deleted exports
    UPDATE data_exports 
    SET status = 'expired', updated_at = NOW()
    WHERE expires_at < NOW() AND status NOT IN ('expired', 'failed');
END;
$$;

-- Function to get user export statistics
CREATE OR REPLACE FUNCTION get_user_export_stats(p_user_id UUID)
RETURNS TABLE (
    total_exports BIGINT,
    pending_exports BIGINT,
    completed_exports BIGINT,
    failed_exports BIGINT,
    last_export_date TIMESTAMPTZ,
    total_export_size BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_exports,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_exports,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_exports,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_exports,
        MAX(created_at) as last_export_date,
        COALESCE(SUM(file_size), 0) as total_export_size
    FROM data_exports
    WHERE user_id = p_user_id;
END;
$$;

-- Function to validate export request limits (GDPR allows reasonable limits)
CREATE OR REPLACE FUNCTION check_export_rate_limit(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    recent_exports_count INTEGER;
BEGIN
    -- Check exports in the last 24 hours
    SELECT COUNT(*)
    INTO recent_exports_count
    FROM data_exports
    WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '24 hours'
    AND status IN ('pending', 'processing', 'completed');
    
    -- Allow maximum 2 exports per day (reasonable limitation)
    RETURN recent_exports_count < 2;
END;
$$;

-- Comments for documentation
COMMENT ON TABLE data_exports IS 'Tracks user data export requests for GDPR compliance';
COMMENT ON TABLE data_export_files IS 'Temporary storage for export file content';
COMMENT ON COLUMN data_exports.export_type IS 'Type of data export: full, profile, activity, preferences, or avatars';
COMMENT ON COLUMN data_exports.format IS 'Export format: json or csv';
COMMENT ON COLUMN data_exports.status IS 'Export processing status';
COMMENT ON COLUMN data_exports.expires_at IS 'When the export download link expires';
COMMENT ON FUNCTION cleanup_expired_data_exports() IS 'Removes expired data exports and files';
COMMENT ON FUNCTION get_user_export_stats(UUID) IS 'Returns export statistics for a user';
COMMENT ON FUNCTION check_export_rate_limit(UUID) IS 'Checks if user has exceeded export rate limits';