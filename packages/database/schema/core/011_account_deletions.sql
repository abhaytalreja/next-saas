-- Account Deletion Management for GDPR Compliance
-- Handles account deletion requests with grace periods and proper data cleanup

-- Account deletion requests table
CREATE TABLE IF NOT EXISTS account_deletions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Deletion status and configuration
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
    reason TEXT,
    confirmation_text TEXT NOT NULL,
    
    -- Grace period management
    grace_period_days INTEGER NOT NULL DEFAULT 30,
    can_cancel BOOLEAN NOT NULL DEFAULT true,
    
    -- Timestamps
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    scheduled_for TIMESTAMPTZ NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    
    -- Cancellation tracking
    cancellation_reason TEXT,
    
    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Data cleanup summary
    cleanup_summary JSONB DEFAULT '{}',
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add soft delete support to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_account_deletions_user_id ON account_deletions(user_id);
CREATE INDEX IF NOT EXISTS idx_account_deletions_status ON account_deletions(status);
CREATE INDEX IF NOT EXISTS idx_account_deletions_scheduled_for ON account_deletions(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_account_deletions_can_cancel ON account_deletions(can_cancel) WHERE can_cancel = true;
CREATE INDEX IF NOT EXISTS idx_users_is_deleted ON users(is_deleted) WHERE is_deleted = true;

-- Trigger for updated_at
CREATE TRIGGER update_account_deletions_updated_at
    BEFORE UPDATE ON account_deletions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE account_deletions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for account_deletions
CREATE POLICY "Users can view their own deletion requests"
    ON account_deletions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deletion requests"
    ON account_deletions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deletion requests"
    ON account_deletions FOR UPDATE
    USING (auth.uid() = user_id);

-- Service role policies for automated processing
CREATE POLICY "Service role can manage all account deletions"
    ON account_deletions FOR ALL
    USING (auth.role() = 'service_role');

-- Function to get account deletion status for a user
CREATE OR REPLACE FUNCTION get_user_deletion_status(p_user_id UUID)
RETURNS TABLE (
    deletion_id UUID,
    status TEXT,
    scheduled_for TIMESTAMPTZ,
    can_cancel BOOLEAN,
    days_remaining INTEGER,
    reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ad.id as deletion_id,
        ad.status,
        ad.scheduled_for,
        ad.can_cancel,
        CASE 
            WHEN ad.status = 'pending' AND ad.scheduled_for > NOW() 
            THEN EXTRACT(DAYS FROM (ad.scheduled_for - NOW()))::INTEGER
            ELSE 0
        END as days_remaining,
        ad.reason
    FROM account_deletions ad
    WHERE ad.user_id = p_user_id
    ORDER BY ad.requested_at DESC
    LIMIT 1;
END;
$$;

-- Function to check if user can request deletion
CREATE OR REPLACE FUNCTION can_request_account_deletion(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    existing_pending_count INTEGER;
    recent_requests_count INTEGER;
BEGIN
    -- Check for existing pending/processing deletions
    SELECT COUNT(*)
    INTO existing_pending_count
    FROM account_deletions
    WHERE user_id = p_user_id
    AND status IN ('pending', 'processing');
    
    IF existing_pending_count > 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Check for recent deletion requests (prevent spam)
    SELECT COUNT(*)
    INTO recent_requests_count
    FROM account_deletions
    WHERE user_id = p_user_id
    AND requested_at > NOW() - INTERVAL '24 hours';
    
    -- Allow maximum 1 deletion request per day
    RETURN recent_requests_count < 1;
END;
$$;

-- Function to automatically process scheduled deletions
CREATE OR REPLACE FUNCTION process_scheduled_deletions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    processed_count INTEGER := 0;
    deletion_record RECORD;
BEGIN
    -- Get all deletions scheduled for processing
    FOR deletion_record IN 
        SELECT * FROM account_deletions 
        WHERE status = 'pending' 
        AND scheduled_for <= NOW()
        AND can_cancel = true
    LOOP
        -- Mark as processing
        UPDATE account_deletions 
        SET status = 'processing', started_at = NOW()
        WHERE id = deletion_record.id;
        
        processed_count := processed_count + 1;
        
        -- Note: Actual deletion logic should be handled by the application service
        -- This function just marks records as ready for processing
    END LOOP;
    
    RETURN processed_count;
END;
$$;

-- Function to calculate deletion statistics
CREATE OR REPLACE FUNCTION get_deletion_statistics(
    p_date_from TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    p_date_to TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    total_requests BIGINT,
    pending_deletions BIGINT,
    completed_deletions BIGINT,
    cancelled_deletions BIGINT,
    failed_deletions BIGINT,
    average_grace_period_usage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_deletions,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_deletions,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_deletions,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_deletions,
        AVG(
            CASE 
                WHEN status IN ('completed', 'cancelled') AND completed_at IS NOT NULL
                THEN EXTRACT(DAYS FROM (completed_at - requested_at))
                ELSE NULL
            END
        ) as average_grace_period_usage
    FROM account_deletions
    WHERE requested_at BETWEEN p_date_from AND p_date_to;
END;
$$;

-- Function to validate deletion request
CREATE OR REPLACE FUNCTION validate_deletion_request(
    p_user_id UUID,
    p_confirmation_text TEXT,
    p_password TEXT DEFAULT NULL
)
RETURNS TABLE (
    is_valid BOOLEAN,
    error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    can_request BOOLEAN;
BEGIN
    -- Check if user can request deletion
    SELECT can_request_account_deletion(p_user_id) INTO can_request;
    
    IF NOT can_request THEN
        RETURN QUERY SELECT FALSE, 'You already have a pending deletion request or have requested deletion recently';
        RETURN;
    END IF;
    
    -- Validate confirmation text
    IF p_confirmation_text != 'DELETE MY ACCOUNT' THEN
        RETURN QUERY SELECT FALSE, 'Invalid confirmation text. Please type "DELETE MY ACCOUNT" exactly.';
        RETURN;
    END IF;
    
    -- TODO: Add password validation if required
    -- This would require integration with auth system
    
    RETURN QUERY SELECT TRUE, NULL;
END;
$$;

-- Function to clean up old deletion records
CREATE OR REPLACE FUNCTION cleanup_old_deletion_records()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete completed/cancelled deletion records older than 1 year
    DELETE FROM account_deletions 
    WHERE status IN ('completed', 'cancelled', 'failed')
    AND completed_at < NOW() - INTERVAL '1 year';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$;

-- View for deletion dashboard (admin use)
-- Uses conditional column selection to handle cases where first_name/last_name may not exist
DO $$ 
BEGIN
    -- Check if first_name and last_name columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'first_name')
       AND EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'last_name') THEN
        -- Create view with first_name and last_name
        EXECUTE 'CREATE OR REPLACE VIEW deletion_dashboard AS
        SELECT 
            ad.id,
            ad.user_id,
            u.email,
            u.first_name,
            u.last_name,
            u.name as display_name,
            ad.status,
            ad.reason,
            ad.requested_at,
            ad.scheduled_for,
            ad.completed_at,
            ad.can_cancel,
            CASE 
                WHEN ad.status = ''pending'' AND ad.scheduled_for > NOW() 
                THEN EXTRACT(DAYS FROM (ad.scheduled_for - NOW()))
                ELSE 0
            END as days_remaining,
            ad.cleanup_summary
        FROM account_deletions ad
        LEFT JOIN users u ON ad.user_id = u.id
        ORDER BY ad.requested_at DESC';
    ELSE
        -- Create view without first_name and last_name (fallback)
        EXECUTE 'CREATE OR REPLACE VIEW deletion_dashboard AS
        SELECT 
            ad.id,
            ad.user_id,
            u.email,
            u.name as display_name,
            NULL::varchar as first_name,
            NULL::varchar as last_name,
            ad.status,
            ad.reason,
            ad.requested_at,
            ad.scheduled_for,
            ad.completed_at,
            ad.can_cancel,
            CASE 
                WHEN ad.status = ''pending'' AND ad.scheduled_for > NOW() 
                THEN EXTRACT(DAYS FROM (ad.scheduled_for - NOW()))
                ELSE 0
            END as days_remaining,
            ad.cleanup_summary
        FROM account_deletions ad
        LEFT JOIN users u ON ad.user_id = u.id
        ORDER BY ad.requested_at DESC';
    END IF;
END $$;

-- Comments for documentation
COMMENT ON TABLE account_deletions IS 'Tracks user account deletion requests with GDPR-compliant grace periods';
COMMENT ON COLUMN account_deletions.grace_period_days IS 'Number of days before deletion is executed (default 30 for GDPR compliance)';
COMMENT ON COLUMN account_deletions.can_cancel IS 'Whether the user can still cancel the deletion request';
COMMENT ON COLUMN account_deletions.cleanup_summary IS 'JSON summary of what data was cleaned up during deletion';
COMMENT ON FUNCTION get_user_deletion_status(UUID) IS 'Gets the current deletion status for a user';
COMMENT ON FUNCTION can_request_account_deletion(UUID) IS 'Checks if a user can request account deletion';
COMMENT ON FUNCTION process_scheduled_deletions() IS 'Processes deletions scheduled for execution';
COMMENT ON FUNCTION validate_deletion_request(UUID, TEXT, TEXT) IS 'Validates a deletion request before processing';
COMMENT ON VIEW deletion_dashboard IS 'Admin view for monitoring account deletion requests';