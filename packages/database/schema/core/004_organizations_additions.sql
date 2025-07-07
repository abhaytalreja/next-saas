-- Additional columns for organizations table
-- These are added conditionally to avoid errors if they already exist

DO $$ 
BEGIN
  -- Add website column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'organizations' AND column_name = 'website') THEN
    ALTER TABLE organizations ADD COLUMN website VARCHAR(255);
    COMMENT ON COLUMN organizations.website IS 'Organization website URL';
  END IF;

  -- Add description column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'organizations' AND column_name = 'description') THEN
    ALTER TABLE organizations ADD COLUMN description TEXT;
    COMMENT ON COLUMN organizations.description IS 'Organization description or about text';
  END IF;
END $$;