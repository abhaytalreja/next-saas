-- Fix missing columns in organization_invitations table
-- This adds the missing status and message columns

DO $$ 
BEGIN
  -- Add status column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'organization_invitations' AND column_name = 'status') THEN
    ALTER TABLE organization_invitations 
    ADD COLUMN status VARCHAR(50) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled'));
    
    COMMENT ON COLUMN organization_invitations.status IS 'Current status of invitation';
  END IF;

  -- Add message column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'organization_invitations' AND column_name = 'message') THEN
    ALTER TABLE organization_invitations 
    ADD COLUMN message TEXT;
    
    COMMENT ON COLUMN organization_invitations.message IS 'Optional personal message from inviter';
  END IF;
END $$;

-- Add index for status if not exists
CREATE INDEX IF NOT EXISTS idx_organization_invitations_status ON organization_invitations(status);

-- Verify the columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'organization_invitations' 
AND column_name IN ('status', 'message')
ORDER BY column_name;