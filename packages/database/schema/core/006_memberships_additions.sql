-- Additional columns for memberships table
-- These are added conditionally to avoid errors if they already exist

DO $$ 
BEGIN
  -- Add status column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'memberships' AND column_name = 'status') THEN
    ALTER TABLE memberships ADD COLUMN status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended'));
    COMMENT ON COLUMN memberships.status IS 'Membership status (active, invited, suspended)';
  END IF;

  -- Add joined_at column if not exists (rename accepted_at for clarity)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'memberships' AND column_name = 'joined_at') THEN
    ALTER TABLE memberships ADD COLUMN joined_at TIMESTAMP WITH TIME ZONE;
    COMMENT ON COLUMN memberships.joined_at IS 'When the user officially joined the organization';
  END IF;
END $$;

-- Add index for status
CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status);
CREATE INDEX IF NOT EXISTS idx_memberships_user_organization_status ON memberships(user_id, organization_id, status);