-- Add missing columns to organization_invitations table
-- The original schema included these columns but they appear to be missing

ALTER TABLE organization_invitations 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled'));

ALTER TABLE organization_invitations 
ADD COLUMN IF NOT EXISTS message TEXT;

-- Update any existing records to have the default status
UPDATE organization_invitations 
SET status = 'pending' 
WHERE status IS NULL;