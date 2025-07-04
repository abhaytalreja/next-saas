-- Audit logs policies
CREATE POLICY "Organization members can view their org audit logs" ON audit_logs
  FOR SELECT USING (
    organization_id IS NOT NULL 
    AND auth.check_org_membership(organization_id, auth.uid())
  );

CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (
    user_id = auth.uid()
  );

CREATE POLICY "System can create audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true); -- Handled by triggers

-- Activities policies
CREATE POLICY "Organization members can view activities" ON activities
  FOR SELECT USING (
    auth.check_org_membership(organization_id, auth.uid())
    AND (is_public = true OR user_id = auth.uid())
  );

CREATE POLICY "System can create activities" ON activities
  FOR INSERT WITH CHECK (true); -- Handled by application

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (
    user_id = auth.uid()
  );

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (
    user_id = auth.uid()
  );

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true); -- Handled by application

-- Feature flags policies
CREATE POLICY "Anyone can view enabled feature flags" ON feature_flags
  FOR SELECT USING (
    enabled = true
  );

CREATE POLICY "System admins can manage feature flags" ON feature_flags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM system_settings
      WHERE category = 'admin_users'
      AND key = 'user_ids'
      AND value ? auth.uid()::text
    )
  );

-- Feature flag overrides policies
CREATE POLICY "Organization admins can view their feature overrides" ON feature_flag_overrides
  FOR SELECT USING (
    auth.check_org_role(organization_id, auth.uid(), 'admin')
  );

CREATE POLICY "System admins can manage feature flag overrides" ON feature_flag_overrides
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM system_settings
      WHERE category = 'admin_users'
      AND key = 'user_ids'
      AND value ? auth.uid()::text
    )
  );

-- System settings policies
CREATE POLICY "Anyone can view public system settings" ON system_settings
  FOR SELECT USING (
    is_public = true
  );

CREATE POLICY "System admins can view all system settings" ON system_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM system_settings ss
      WHERE ss.category = 'admin_users'
      AND ss.key = 'user_ids'
      AND ss.value ? auth.uid()::text
    )
  );

CREATE POLICY "System admins can manage system settings" ON system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM system_settings ss
      WHERE ss.category = 'admin_users'
      AND ss.key = 'user_ids'
      AND ss.value ? auth.uid()::text
    )
  );

-- API keys policies
CREATE POLICY "Organization admins can view API keys" ON api_keys
  FOR SELECT USING (
    auth.check_org_role(organization_id, auth.uid(), 'admin')
  );

CREATE POLICY "Organization admins can create API keys" ON api_keys
  FOR INSERT WITH CHECK (
    auth.check_org_role(organization_id, auth.uid(), 'admin')
    AND created_by = auth.uid()
  );

CREATE POLICY "API key creators can revoke their keys" ON api_keys
  FOR UPDATE USING (
    created_by = auth.uid()
    AND revoked_at IS NULL
  );