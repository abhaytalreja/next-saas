-- Account Deletion Management Tables
-- This migration creates the necessary tables and functions for GDPR-compliant account deletion
-- with 30-day grace period and comprehensive audit trails.

-- Account Deletions Table
CREATE TABLE IF NOT EXISTS account_deletions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    status text NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    reason text,
    confirmation_text text NOT NULL,
    requested_at timestamptz NOT NULL DEFAULT now(),
    scheduled_for timestamptz NOT NULL,
    started_at timestamptz,
    completed_at timestamptz,
    cancelled_at timestamptz,
    cancellation_reason text,
    error_message text,
    grace_period_days integer NOT NULL DEFAULT 30,
    can_cancel boolean NOT NULL DEFAULT true,
    cleanup_summary jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_account_deletions_user_id ON account_deletions(user_id);
CREATE INDEX IF NOT EXISTS idx_account_deletions_status ON account_deletions(status);
CREATE INDEX IF NOT EXISTS idx_account_deletions_scheduled ON account_deletions(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_account_deletions_created_at ON account_deletions(created_at);

-- Add foreign key constraint if users table exists
DO $$ 
BEGIN
    -- Check if users table exists before adding constraint
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE account_deletions ADD CONSTRAINT fk_account_deletions_user_id 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE account_deletions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for account_deletions
CREATE POLICY "Users can view own deletion requests" ON account_deletions
    FOR SELECT USING (
        auth.uid() = user_id
    );

CREATE POLICY "Users can insert own deletion requests" ON account_deletions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

CREATE POLICY "Users can update own deletion requests" ON account_deletions
    FOR UPDATE USING (
        auth.uid() = user_id
    );

-- Service role can access all deletion records for processing
CREATE POLICY "Service role full access" ON account_deletions
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'service_role'
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_account_deletions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
DROP TRIGGER IF EXISTS trigger_account_deletions_updated_at ON account_deletions;
CREATE TRIGGER trigger_account_deletions_updated_at
    BEFORE UPDATE ON account_deletions
    FOR EACH ROW
    EXECUTE FUNCTION update_account_deletions_updated_at();

-- Function to prevent modifications to completed/cancelled deletions
CREATE OR REPLACE FUNCTION prevent_deletion_modification()
RETURNS TRIGGER AS $$
BEGIN
    -- Allow updates to failed status for retry attempts
    IF OLD.status IN ('completed', 'cancelled') AND NEW.status NOT IN ('failed', 'completed', 'cancelled') THEN
        RAISE EXCEPTION 'Cannot modify completed or cancelled deletion requests';
    END IF;
    
    -- Prevent changing user_id
    IF OLD.user_id != NEW.user_id THEN
        RAISE EXCEPTION 'Cannot change user_id of deletion request';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent modifications
DROP TRIGGER IF EXISTS trigger_prevent_deletion_modification ON account_deletions;
CREATE TRIGGER trigger_prevent_deletion_modification
    BEFORE UPDATE ON account_deletions
    FOR EACH ROW
    EXECUTE FUNCTION prevent_deletion_modification();

-- Function to automatically set can_cancel based on status
CREATE OR REPLACE FUNCTION update_deletion_can_cancel()
RETURNS TRIGGER AS $$
BEGIN
    -- Automatically set can_cancel based on status
    CASE NEW.status
        WHEN 'pending' THEN
            NEW.can_cancel = true;
        WHEN 'processing', 'completed', 'failed', 'cancelled' THEN
            NEW.can_cancel = false;
    END CASE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update can_cancel
DROP TRIGGER IF EXISTS trigger_update_deletion_can_cancel ON account_deletions;
CREATE TRIGGER trigger_update_deletion_can_cancel
    BEFORE INSERT OR UPDATE ON account_deletions
    FOR EACH ROW
    EXECUTE FUNCTION update_deletion_can_cancel();

-- Add comments for documentation
COMMENT ON TABLE account_deletions IS 'GDPR-compliant account deletion requests with 30-day grace period';
COMMENT ON COLUMN account_deletions.user_id IS 'User who requested account deletion';
COMMENT ON COLUMN account_deletions.status IS 'Current status of the deletion request';
COMMENT ON COLUMN account_deletions.scheduled_for IS 'When the deletion is scheduled to be executed';
COMMENT ON COLUMN account_deletions.grace_period_days IS 'Number of days in grace period';
COMMENT ON COLUMN account_deletions.can_cancel IS 'Whether the deletion request can still be cancelled';
COMMENT ON COLUMN account_deletions.cleanup_summary IS 'JSON summary of data cleaned up during deletion';

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON account_deletions TO authenticated;
GRANT ALL ON account_deletions TO service_role;