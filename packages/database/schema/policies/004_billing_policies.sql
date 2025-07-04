-- Plans policies (public read for pricing pages)
CREATE POLICY "Anyone can view active plans" ON plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "System admins can manage plans" ON plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM system_settings
      WHERE category = 'admin_users'
      AND key = 'user_ids'
      AND value ? auth.uid()::text
    )
  );

-- Subscriptions policies
CREATE POLICY "Organization members can view their subscription" ON subscriptions
  FOR SELECT USING (
    auth.check_org_membership(organization_id, auth.uid())
  );

CREATE POLICY "Organization owners can manage subscriptions" ON subscriptions
  FOR ALL USING (
    auth.check_org_role(organization_id, auth.uid(), 'owner')
  );

-- Invoices policies
CREATE POLICY "Organization members can view invoices" ON invoices
  FOR SELECT USING (
    auth.check_org_membership(organization_id, auth.uid())
  );

CREATE POLICY "System can create invoices" ON invoices
  FOR INSERT WITH CHECK (true); -- Handled by service account

-- Payments policies
CREATE POLICY "Organization admins can view payments" ON payments
  FOR SELECT USING (
    auth.check_org_role(organization_id, auth.uid(), 'admin')
  );

CREATE POLICY "System can create payments" ON payments
  FOR INSERT WITH CHECK (true); -- Handled by service account

-- Usage tracking policies
CREATE POLICY "Organization members can view usage" ON usage_tracking
  FOR SELECT USING (
    auth.check_org_membership(organization_id, auth.uid())
  );

CREATE POLICY "System can manage usage tracking" ON usage_tracking
  FOR ALL USING (true); -- Handled by service account