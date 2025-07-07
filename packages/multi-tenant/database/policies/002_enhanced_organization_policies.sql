-- Enhanced Organization RLS Policies with more granular control

-- Organization Invitations: Only invited user or org members can view
DROP POLICY IF EXISTS "Users can view their invitations or org invitations" ON organization_invitations;
CREATE POLICY "Users can view their invitations or org invitations" ON organization_invitations
  FOR SELECT USING (
    email = auth.jwt()->>'email'
    OR EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = organization_invitations.organization_id 
      AND user_id = auth.uid()
      AND status = 'active'
    )
  );

-- Organization Invitations: Admins can create invitations
DROP POLICY IF EXISTS "Admins can create invitations" ON organization_invitations;
CREATE POLICY "Admins can create invitations" ON organization_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = organization_invitations.organization_id 
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND status = 'active'
    )
    OR (
      -- Members can invite if organization allows it
      EXISTS (
        SELECT 1 FROM organization_members om
        JOIN organizations o ON o.id = om.organization_id
        WHERE om.organization_id = organization_invitations.organization_id 
        AND om.user_id = auth.uid()
        AND om.status = 'active'
        AND (o.settings->>'allowMemberInvites')::boolean = true
      )
    )
  );

-- Organization Invitations: Admins can delete invitations
DROP POLICY IF EXISTS "Admins can delete invitations" ON organization_invitations;
CREATE POLICY "Admins can delete invitations" ON organization_invitations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = organization_invitations.organization_id 
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND status = 'active'
    )
  );

-- Custom Roles: Members can view their organization's roles
DROP POLICY IF EXISTS "Members can view organization roles" ON custom_roles;
CREATE POLICY "Members can view organization roles" ON custom_roles
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Custom Roles: Only admins can manage roles
DROP POLICY IF EXISTS "Admins can create custom roles" ON custom_roles;
CREATE POLICY "Admins can create custom roles" ON custom_roles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = custom_roles.organization_id 
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Admins can update custom roles" ON custom_roles;
CREATE POLICY "Admins can update custom roles" ON custom_roles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = custom_roles.organization_id 
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Admins can delete custom roles" ON custom_roles;
CREATE POLICY "Admins can delete custom roles" ON custom_roles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = custom_roles.organization_id 
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND status = 'active'
    )
  );

-- Member Permissions: Members can view their own permissions
DROP POLICY IF EXISTS "Members can view permissions" ON member_permissions;
CREATE POLICY "Members can view permissions" ON member_permissions
  FOR SELECT USING (
    membership_id IN (
      SELECT id FROM organization_members
      WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM organization_members om1
      JOIN organization_members om2 ON om1.organization_id = om2.organization_id
      WHERE om1.user_id = auth.uid()
      AND om2.id = member_permissions.membership_id
      AND om1.role IN ('owner', 'admin')
      AND om1.status = 'active'
    )
  );

-- Member Permissions: Only admins can manage permissions
DROP POLICY IF EXISTS "Admins can manage member permissions" ON member_permissions;
CREATE POLICY "Admins can manage member permissions" ON member_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM organization_members om1
      JOIN organization_members om2 ON om1.organization_id = om2.organization_id
      WHERE om1.user_id = auth.uid()
      AND om2.id = member_permissions.membership_id
      AND om1.role IN ('owner', 'admin')
      AND om1.status = 'active'
    )
  );