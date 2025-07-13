-- Step 1: Check what tables exist in your database
SELECT 
  'Table Check' as step,
  table_schema,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema IN ('public', 'auth')
  AND table_name IN ('organizations', 'memberships', 'users', 'profiles', 'organization_invitations')
ORDER BY table_schema, table_name;

-- Step 2: Check if organization_invitations table exists
SELECT 
  'Invitation Table Check' as step,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_invitations' AND table_schema = 'public') 
    THEN 'EXISTS - No need to create' 
    ELSE 'MISSING - Will create below' 
  END as organization_invitations_status;

-- Step 3: Create organization_invitations table if it doesn't exist
-- This will work with standard Supabase setup
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_invitations' AND table_schema = 'public') THEN
    
    CREATE TABLE organization_invitations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL, -- FK will be added later if organizations table exists
      email VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'member')),
      token VARCHAR(255) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
      message TEXT,
      status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
      invited_by UUID NOT NULL, -- FK will be added later if needed
      accepted_by UUID,
      expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
      accepted_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create indexes
    CREATE INDEX idx_organization_invitations_token ON organization_invitations(token);
    CREATE INDEX idx_organization_invitations_email ON organization_invitations(email);
    CREATE INDEX idx_organization_invitations_organization_id ON organization_invitations(organization_id);
    CREATE INDEX idx_organization_invitations_status ON organization_invitations(status);
    CREATE INDEX idx_organization_invitations_expires_at ON organization_invitations(expires_at);

    -- Enable RLS
    ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

    -- Create permissive RLS policy for authenticated users
    CREATE POLICY "organization_invitations_authenticated_access" ON organization_invitations
      FOR ALL USING (auth.uid() IS NOT NULL);

    -- Add comments
    COMMENT ON TABLE organization_invitations IS 'Pending invitations to join organizations';
    
    RAISE NOTICE 'organization_invitations table created successfully';
  ELSE
    RAISE NOTICE 'organization_invitations table already exists';
  END IF;
END $$;

-- Step 4: Add foreign key constraints if the referenced tables exist
DO $$
BEGIN
  -- Add FK to organizations if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations' AND table_schema = 'public') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'fk_organization_invitations_organization_id' 
      AND table_name = 'organization_invitations'
    ) THEN
      ALTER TABLE organization_invitations 
      ADD CONSTRAINT fk_organization_invitations_organization_id 
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
      RAISE NOTICE 'Added FK constraint to organizations table';
    END IF;
  ELSE
    RAISE NOTICE 'organizations table does not exist - FK constraint not added';
  END IF;

  -- Add FK to auth.users for invited_by if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'auth') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'fk_organization_invitations_invited_by' 
      AND table_name = 'organization_invitations'
    ) THEN
      ALTER TABLE organization_invitations 
      ADD CONSTRAINT fk_organization_invitations_invited_by 
      FOREIGN KEY (invited_by) REFERENCES auth.users(id);
      RAISE NOTICE 'Added FK constraint to auth.users for invited_by';
    END IF;
  ELSE
    RAISE NOTICE 'auth.users table does not exist - FK constraint for invited_by not added';
  END IF;

  -- Add FK to auth.users for accepted_by if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'auth') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'fk_organization_invitations_accepted_by' 
      AND table_name = 'organization_invitations'
    ) THEN
      ALTER TABLE organization_invitations 
      ADD CONSTRAINT fk_organization_invitations_accepted_by 
      FOREIGN KEY (accepted_by) REFERENCES auth.users(id);
      RAISE NOTICE 'Added FK constraint to auth.users for accepted_by';
    END IF;
  ELSE
    RAISE NOTICE 'auth.users table does not exist - FK constraint for accepted_by not added';
  END IF;
END $$;

-- Step 5: Final verification
SELECT 
  'Final Check' as step,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'organization_invitations' AND table_schema = 'public'
ORDER BY ordinal_position;