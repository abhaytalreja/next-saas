-- Row Level Security Policies for User Profile Tables

-- Enable RLS on all user profile tables
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_avatars ENABLE ROW LEVEL SECURITY;

-- User Preferences Policies
-- Users can manage their own preferences
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own preferences"
  ON user_preferences FOR DELETE
  USING (user_id = auth.uid());

-- Admins can view all preferences for support
CREATE POLICY "Admins can view all user preferences"
  ON user_preferences FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND (u.metadata->>'role' = 'admin' OR u.metadata->>'role' = 'super_admin')
    )
  );

-- User Activity Policies
-- Users can view their own activity
CREATE POLICY "Users can view their own activity"
  ON user_activity FOR SELECT
  USING (user_id = auth.uid());

-- System can insert activity for any user (for activity tracking)
CREATE POLICY "System can insert user activity"
  ON user_activity FOR INSERT
  WITH CHECK (true); -- This will be controlled at the application level

-- Admins can view all activity for security/support
CREATE POLICY "Admins can view all user activity"
  ON user_activity FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND (u.metadata->>'role' = 'admin' OR u.metadata->>'role' = 'super_admin')
    )
  );

-- Organization admins can view activity within their organization
-- Check if status column exists and create appropriate policy
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'memberships' AND column_name = 'status'
  ) THEN
    EXECUTE 'CREATE POLICY "Organization admins can view organization activity"
      ON user_activity FOR SELECT
      USING (
        organization_id IN (
          SELECT m.organization_id 
          FROM memberships m
          WHERE m.user_id = auth.uid()
            AND m.role IN (''admin'', ''owner'')
            AND m.status = ''active''
        )
      )';
  ELSE
    EXECUTE 'CREATE POLICY "Organization admins can view organization activity"
      ON user_activity FOR SELECT
      USING (
        organization_id IN (
          SELECT m.organization_id 
          FROM memberships m
          WHERE m.user_id = auth.uid()
            AND m.role IN (''admin'', ''owner'')
        )
      )';
  END IF;
END $$;

-- User Sessions Policies  
-- Users can view their own sessions
CREATE POLICY "Users can view their own sessions"
  ON user_sessions FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own sessions (for device naming, trust status)
CREATE POLICY "Users can update their own sessions"
  ON user_sessions FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND user_id = auth.uid());

-- System can manage sessions (login/logout)
CREATE POLICY "System can manage user sessions"
  ON user_sessions FOR ALL
  USING (true); -- This will be controlled at the application level

-- Admins can view all sessions for security monitoring
CREATE POLICY "Admins can view all user sessions"
  ON user_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND (u.metadata->>'role' = 'admin' OR u.metadata->>'role' = 'super_admin')
    )
  );

-- User Avatars Policies
-- Users can view their own avatars
CREATE POLICY "Users can view their own avatars"
  ON user_avatars FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own avatars
CREATE POLICY "Users can upload their own avatars"
  ON user_avatars FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own avatars (activation, processing status)
CREATE POLICY "Users can update their own avatars"
  ON user_avatars FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own avatars
CREATE POLICY "Users can delete their own avatars"
  ON user_avatars FOR DELETE
  USING (user_id = auth.uid());

-- Public avatars are viewable by organization members
-- Check if status column exists and create appropriate policy
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'memberships' AND column_name = 'status'
  ) THEN
    EXECUTE 'CREATE POLICY "Organization members can view user avatars"
      ON user_avatars FOR SELECT
      USING (
        is_active = true 
        AND is_approved = true
        AND user_id IN (
          SELECT m1.user_id 
          FROM memberships m1
          JOIN memberships m2 ON m1.organization_id = m2.organization_id
          WHERE m2.user_id = auth.uid()
            AND m1.status = ''active''
            AND m2.status = ''active''
        )
      )';
  ELSE
    EXECUTE 'CREATE POLICY "Organization members can view user avatars"
      ON user_avatars FOR SELECT
      USING (
        is_active = true 
        AND is_approved = true
        AND user_id IN (
          SELECT m1.user_id 
          FROM memberships m1
          JOIN memberships m2 ON m1.organization_id = m2.organization_id
          WHERE m2.user_id = auth.uid()
        )
      )';
  END IF;
END $$;

-- Admins can view all avatars for moderation
CREATE POLICY "Admins can view all avatars"
  ON user_avatars FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND (u.metadata->>'role' = 'admin' OR u.metadata->>'role' = 'super_admin')
    )
  );

-- Admins can update avatars for moderation
CREATE POLICY "Admins can moderate avatars"
  ON user_avatars FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND (u.metadata->>'role' = 'admin' OR u.metadata->>'role' = 'super_admin')
    )
  );

-- Create functions for profile visibility checking
CREATE OR REPLACE FUNCTION check_profile_visibility(target_user_id UUID, requesting_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  visibility_setting VARCHAR(20);
  same_organization BOOLEAN := false;
  has_status_column BOOLEAN := false;
BEGIN
  -- Get the target user's profile visibility preference
  SELECT up.profile_visibility INTO visibility_setting
  FROM user_preferences up
  WHERE up.user_id = target_user_id;
  
  -- Default to 'organization' if no preference set
  IF visibility_setting IS NULL THEN
    visibility_setting := 'organization';
  END IF;
  
  -- Check if status column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'memberships' AND column_name = 'status'
  ) INTO has_status_column;
  
  -- Check if users are in the same organization
  IF has_status_column THEN
    SELECT EXISTS (
      SELECT 1 FROM memberships m1
      JOIN memberships m2 ON m1.organization_id = m2.organization_id
      WHERE m1.user_id = target_user_id
        AND m2.user_id = requesting_user_id
        AND m1.status = 'active'
        AND m2.status = 'active'
    ) INTO same_organization;
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM memberships m1
      JOIN memberships m2 ON m1.organization_id = m2.organization_id
      WHERE m1.user_id = target_user_id
        AND m2.user_id = requesting_user_id
    ) INTO same_organization;
  END IF;
  
  -- Apply visibility rules
  CASE visibility_setting
    WHEN 'public' THEN
      RETURN true;
    WHEN 'organization' THEN
      RETURN same_organization OR target_user_id = requesting_user_id;
    WHEN 'private' THEN
      RETURN target_user_id = requesting_user_id;
    ELSE
      RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_profile_visibility(UUID, UUID) TO authenticated;

-- Comments
COMMENT ON POLICY "Users can view their own preferences" ON user_preferences IS 'Users have full access to their preference settings';
COMMENT ON POLICY "Users can view their own activity" ON user_activity IS 'Users can view their own activity history';
COMMENT ON POLICY "Users can view their own sessions" ON user_sessions IS 'Users can view and manage their device sessions';
COMMENT ON POLICY "Users can view their own avatars" ON user_avatars IS 'Users can manage their avatar uploads';
COMMENT ON POLICY "Organization members can view user avatars" ON user_avatars IS 'Active approved avatars are visible to organization members';
COMMENT ON FUNCTION check_profile_visibility(UUID, UUID) IS 'Checks if a user can view another users profile based on privacy settings';