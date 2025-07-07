-- Audit Log RLS Policies

-- Audit Logs: Organization members can view their org's audit logs based on permissions
DROP POLICY IF EXISTS "Authorized users can view audit logs" ON audit_logs;
CREATE POLICY "Authorized users can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = audit_logs.organization_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
      AND (
        om.role IN ('owner', 'admin')
        OR 'organization:view_audit_logs' = ANY(om.permissions)
      )
    )
    -- Users can always see their own actions
    OR actor_id = auth.uid()
  );

-- Audit Logs: System can insert (no user insert allowed)
-- This would typically be done via a service role or trigger

-- Organization Billing: Members with billing permission can view
DROP POLICY IF EXISTS "Authorized users can view billing" ON organization_billing;
CREATE POLICY "Authorized users can view billing" ON organization_billing
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_billing.organization_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
      AND (
        om.role = 'owner'
        OR 'organization:manage_billing' = ANY(om.permissions)
      )
    )
  );

-- Organization Billing: Only owners can update billing
DROP POLICY IF EXISTS "Owners can update billing" ON organization_billing;
CREATE POLICY "Owners can update billing" ON organization_billing
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_billing.organization_id
      AND om.user_id = auth.uid()
      AND om.role = 'owner'
      AND om.status = 'active'
    )
  );

-- Usage Quotas: Members can view their org's quotas
DROP POLICY IF EXISTS "Members can view usage quotas" ON usage_quotas;
CREATE POLICY "Members can view usage quotas" ON usage_quotas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = usage_quotas.organization_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
    )
  );

-- Usage Quotas: System updates only (via triggers/functions)
-- No direct user manipulation allowed

-- API Keys: Users can view API keys they created or have permission to see
DROP POLICY IF EXISTS "Users can view API keys" ON api_keys;
CREATE POLICY "Users can view API keys" ON api_keys
  FOR SELECT USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = api_keys.organization_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
      AND (
        om.role IN ('owner', 'admin')
        OR 'api:manage_keys' = ANY(om.permissions)
      )
    )
  );

-- API Keys: Authorized users can create API keys
DROP POLICY IF EXISTS "Authorized users can create API keys" ON api_keys;
CREATE POLICY "Authorized users can create API keys" ON api_keys
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = api_keys.organization_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
      AND (
        om.role IN ('owner', 'admin')
        OR 'api:manage_keys' = ANY(om.permissions)
      )
    )
    AND created_by = auth.uid()
  );

-- API Keys: Users can revoke their own keys, admins can revoke any
DROP POLICY IF EXISTS "Users can revoke API keys" ON api_keys;
CREATE POLICY "Users can revoke API keys" ON api_keys
  FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = api_keys.organization_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
      AND om.role IN ('owner', 'admin')
    )
  );

-- API Keys: Only admins can hard delete
DROP POLICY IF EXISTS "Admins can delete API keys" ON api_keys;
CREATE POLICY "Admins can delete API keys" ON api_keys
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = api_keys.organization_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
      AND om.role IN ('owner', 'admin')
    )
  );