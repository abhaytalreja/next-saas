-- Additional tables for the authentication system
-- Run this AFTER the main supabase-setup.sql

-- Organization invitations table (if not exists)
CREATE TABLE IF NOT EXISTS organization_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  invited_by UUID NOT NULL REFERENCES users(id),
  accepted_by UUID REFERENCES users(id),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auth events table for security tracking (if not exists)
CREATE TABLE IF NOT EXISTS auth_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization events table (if not exists)
CREATE TABLE IF NOT EXISTS organization_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to users table if they don't exist
DO $$ 
BEGIN
  -- Add first_name if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'first_name') THEN
    ALTER TABLE users ADD COLUMN first_name TEXT;
  END IF;

  -- Add last_name if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'last_name') THEN
    ALTER TABLE users ADD COLUMN last_name TEXT;
  END IF;

  -- Add bio if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'bio') THEN
    ALTER TABLE users ADD COLUMN bio TEXT;
  END IF;

  -- Add phone if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'phone') THEN
    ALTER TABLE users ADD COLUMN phone TEXT;
  END IF;

  -- Add website if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'website') THEN
    ALTER TABLE users ADD COLUMN website TEXT;
  END IF;

  -- Add current_organization_id if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'current_organization_id') THEN
    ALTER TABLE users ADD COLUMN current_organization_id UUID REFERENCES organizations(id);
  END IF;
END $$;

-- Add missing columns to organizations table if they don't exist
DO $$ 
BEGIN
  -- Add website if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'organizations' AND column_name = 'website') THEN
    ALTER TABLE organizations ADD COLUMN website TEXT;
  END IF;

  -- Add description if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'organizations' AND column_name = 'description') THEN
    ALTER TABLE organizations ADD COLUMN description TEXT;
  END IF;
END $$;

-- Add missing columns to memberships table if they don't exist
DO $$ 
BEGIN
  -- Add status if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'memberships' AND column_name = 'status') THEN
    ALTER TABLE memberships ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended'));
  END IF;

  -- Add joined_at if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'memberships' AND column_name = 'joined_at') THEN
    ALTER TABLE memberships ADD COLUMN joined_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add missing columns to sessions table if they don't exist
DO $$ 
BEGIN
  -- Add browser if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'sessions' AND column_name = 'browser') THEN
    ALTER TABLE sessions ADD COLUMN browser TEXT;
  END IF;

  -- Add os if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'sessions' AND column_name = 'os') THEN
    ALTER TABLE sessions ADD COLUMN os TEXT;
  END IF;

  -- Add location if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'sessions' AND column_name = 'location') THEN
    ALTER TABLE sessions ADD COLUMN location TEXT;
  END IF;

  -- Add status if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'sessions' AND column_name = 'status') THEN
    ALTER TABLE sessions ADD COLUMN status TEXT DEFAULT 'active';
  END IF;

  -- Add last_active_at if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'sessions' AND column_name = 'last_active_at') THEN
    ALTER TABLE sessions ADD COLUMN last_active_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Add revoked_at if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'sessions' AND column_name = 'revoked_at') THEN
    ALTER TABLE sessions ADD COLUMN revoked_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create indexes for the new tables
CREATE INDEX IF NOT EXISTS idx_organization_invitations_token ON organization_invitations(token);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_email ON organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_organization_id ON organization_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_auth_events_user_id ON auth_events(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_events_created_at ON auth_events(created_at);
CREATE INDEX IF NOT EXISTS idx_organization_events_organization_id ON organization_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_events_created_at ON organization_events(created_at);

-- Enable RLS on new tables
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_invitations
CREATE POLICY "Organization admins can view invitations" ON organization_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.organization_id = organization_invitations.organization_id
      AND memberships.user_id = auth.uid()
      AND memberships.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Organization admins can create invitations" ON organization_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.organization_id = organization_invitations.organization_id
      AND memberships.user_id = auth.uid()
      AND memberships.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Anyone with token can view invitation" ON organization_invitations
  FOR SELECT USING (true); -- Token validation happens in application

-- RLS Policies for auth_events
CREATE POLICY "Users can view own auth events" ON auth_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert auth events" ON auth_events
  FOR INSERT WITH CHECK (true); -- Controlled by application

-- RLS Policies for organization_events
CREATE POLICY "Organization members can view events" ON organization_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.organization_id = organization_events.organization_id
      AND memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert organization events" ON organization_events
  FOR INSERT WITH CHECK (true); -- Controlled by application