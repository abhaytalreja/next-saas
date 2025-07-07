-- Additional profile columns for users table
-- These are added conditionally to avoid errors if they already exist

DO $$ 
BEGIN
  -- Add first_name column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'first_name') THEN
    ALTER TABLE users ADD COLUMN first_name VARCHAR(255);
    COMMENT ON COLUMN users.first_name IS 'User first name';
  END IF;

  -- Add last_name column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'last_name') THEN
    ALTER TABLE users ADD COLUMN last_name VARCHAR(255);
    COMMENT ON COLUMN users.last_name IS 'User last name';
  END IF;

  -- Add bio column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'bio') THEN
    ALTER TABLE users ADD COLUMN bio TEXT;
    COMMENT ON COLUMN users.bio IS 'User biography or about text';
  END IF;

  -- Add phone column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'phone') THEN
    ALTER TABLE users ADD COLUMN phone VARCHAR(50);
    COMMENT ON COLUMN users.phone IS 'User phone number';
  END IF;

  -- Add website column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'website') THEN
    ALTER TABLE users ADD COLUMN website VARCHAR(255);
    COMMENT ON COLUMN users.website IS 'User personal website URL';
  END IF;

  -- Add current_organization_id column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'current_organization_id') THEN
    ALTER TABLE users ADD COLUMN current_organization_id UUID REFERENCES organizations(id);
    COMMENT ON COLUMN users.current_organization_id IS 'Currently selected organization for multi-tenant context';
  END IF;
END $$;

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_users_current_organization_id ON users(current_organization_id);
CREATE INDEX IF NOT EXISTS idx_users_first_name ON users(first_name);
CREATE INDEX IF NOT EXISTS idx_users_last_name ON users(last_name);