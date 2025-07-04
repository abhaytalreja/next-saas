-- Helper function to check organization membership
CREATE OR REPLACE FUNCTION auth.check_org_membership(org_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM memberships 
    WHERE organization_id = org_id 
    AND memberships.user_id = user_id
    AND accepted_at IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check organization role
CREATE OR REPLACE FUNCTION auth.check_org_role(org_id UUID, user_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM memberships
  WHERE organization_id = org_id 
  AND memberships.user_id = user_id
  AND accepted_at IS NOT NULL;
  
  -- Role hierarchy: owner > admin > member
  RETURN CASE
    WHEN required_role = 'member' THEN user_role IN ('member', 'admin', 'owner')
    WHEN required_role = 'admin' THEN user_role IN ('admin', 'owner')
    WHEN required_role = 'owner' THEN user_role = 'owner'
    ELSE FALSE
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users policies
CREATE POLICY "Users can read their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can read profiles of organization members" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships m1
      JOIN memberships m2 ON m1.organization_id = m2.organization_id
      WHERE m1.user_id = auth.uid()
      AND m2.user_id = users.id
      AND m1.accepted_at IS NOT NULL
      AND m2.accepted_at IS NOT NULL
    )
  );

-- Sessions policies
CREATE POLICY "Users can manage their own sessions" ON sessions
  FOR ALL USING (auth.uid() = user_id);

-- OAuth accounts policies
CREATE POLICY "Users can manage their own OAuth accounts" ON oauth_accounts
  FOR ALL USING (auth.uid() = user_id);

-- Password reset policies
CREATE POLICY "Users can request password resets for their account" ON password_resets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own password resets" ON password_resets
  FOR SELECT USING (auth.uid() = user_id);

-- Email verification policies
CREATE POLICY "Users can manage their own email verifications" ON email_verifications
  FOR ALL USING (auth.uid() = user_id);