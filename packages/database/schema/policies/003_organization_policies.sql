-- Organizations policies
CREATE POLICY "Users can read organizations they belong to" ON organizations
  FOR SELECT USING (
    auth.check_org_membership(id, auth.uid())
  );

CREATE POLICY "Organization owners can update their organization" ON organizations
  FOR UPDATE USING (
    auth.check_org_role(id, auth.uid(), 'owner')
  );

CREATE POLICY "Users can create organizations" ON organizations
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
  );

CREATE POLICY "Organization owners can soft delete their organization" ON organizations
  FOR UPDATE USING (
    auth.check_org_role(id, auth.uid(), 'owner')
    AND deleted_at IS NULL
  );

-- Memberships policies
CREATE POLICY "Users can view memberships in their organizations" ON memberships
  FOR SELECT USING (
    auth.check_org_membership(organization_id, auth.uid())
    OR user_id = auth.uid()
  );

CREATE POLICY "Organization admins can create memberships" ON memberships
  FOR INSERT WITH CHECK (
    auth.check_org_role(organization_id, auth.uid(), 'admin')
  );

CREATE POLICY "Organization admins can update memberships" ON memberships
  FOR UPDATE USING (
    auth.check_org_role(organization_id, auth.uid(), 'admin')
    OR (user_id = auth.uid() AND accepted_at IS NULL) -- Users can accept their own invitations
  );

CREATE POLICY "Organization owners can delete memberships" ON memberships
  FOR DELETE USING (
    auth.check_org_role(organization_id, auth.uid(), 'owner')
    OR (user_id = auth.uid() AND role != 'owner') -- Users can remove themselves unless they're the owner
  );