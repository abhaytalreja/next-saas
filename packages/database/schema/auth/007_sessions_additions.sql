-- Additional columns for sessions table
-- These are added conditionally to avoid errors if they already exist

DO $$ 
BEGIN
  -- Add browser column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'sessions' AND column_name = 'browser') THEN
    ALTER TABLE sessions ADD COLUMN browser VARCHAR(255);
    COMMENT ON COLUMN sessions.browser IS 'Parsed browser name from user agent';
  END IF;

  -- Add os column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'sessions' AND column_name = 'os') THEN
    ALTER TABLE sessions ADD COLUMN os VARCHAR(255);
    COMMENT ON COLUMN sessions.os IS 'Parsed operating system from user agent';
  END IF;

  -- Add location column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'sessions' AND column_name = 'location') THEN
    ALTER TABLE sessions ADD COLUMN location VARCHAR(255);
    COMMENT ON COLUMN sessions.location IS 'Approximate location based on IP geolocation';
  END IF;

  -- Add status column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'sessions' AND column_name = 'status') THEN
    ALTER TABLE sessions ADD COLUMN status VARCHAR(50) DEFAULT 'active';
    COMMENT ON COLUMN sessions.status IS 'Session status (active, revoked, expired)';
  END IF;

  -- Add last_active_at column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'sessions' AND column_name = 'last_active_at') THEN
    ALTER TABLE sessions ADD COLUMN last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    COMMENT ON COLUMN sessions.last_active_at IS 'Last time this session was used';
  END IF;

  -- Add revoked_at column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'sessions' AND column_name = 'revoked_at') THEN
    ALTER TABLE sessions ADD COLUMN revoked_at TIMESTAMP WITH TIME ZONE;
    COMMENT ON COLUMN sessions.revoked_at IS 'When this session was manually revoked';
  END IF;
END $$;

-- Add additional indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_last_active_at ON sessions(last_active_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user_status ON sessions(user_id, status);