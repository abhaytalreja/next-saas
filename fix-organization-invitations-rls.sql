-- Create RLS policies for organization_invitations table

-- Enable RLS on the table (if not already enabled)
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

-- Policy 1: Organization admins can create invitations
CREATE POLICY "Admins can create organization invitations" ON organization_invitations
FOR INSERT
TO authenticated
WITH CHECK (
  -- Check if user is admin/owner of the organization
  EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.organization_id = organization_invitations.organization_id
    AND m.user_id = auth.uid()
    AND m.role IN ('admin', 'owner')
    AND m.accepted_at IS NOT NULL
  )
);

-- Policy 2: Organization members can view invitations for their organization
CREATE POLICY "Members can view organization invitations" ON organization_invitations
FOR SELECT
TO authenticated
USING (
  -- Check if user is a member of the organization
  EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.organization_id = organization_invitations.organization_id
    AND m.user_id = auth.uid()
    AND m.accepted_at IS NOT NULL
  )
);

-- Policy 3: Organization admins can update invitations (e.g., cancel them)
CREATE POLICY "Admins can update organization invitations" ON organization_invitations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.organization_id = organization_invitations.organization_id
    AND m.user_id = auth.uid()
    AND m.role IN ('admin', 'owner')
    AND m.accepted_at IS NOT NULL
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.organization_id = organization_invitations.organization_id
    AND m.user_id = auth.uid()
    AND m.role IN ('admin', 'owner')
    AND m.accepted_at IS NOT NULL
  )
);

-- Policy 4: Organization admins can delete invitations
CREATE POLICY "Admins can delete organization invitations" ON organization_invitations
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.organization_id = organization_invitations.organization_id
    AND m.user_id = auth.uid()
    AND m.role IN ('admin', 'owner')
    AND m.accepted_at IS NOT NULL
  )
);

-- Policy 5: Allow invited users to view their own invitations (for acceptance)
CREATE POLICY "Users can view invitations sent to them" ON organization_invitations
FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Policy 6: Allow service role full access
CREATE POLICY "Service role has full access" ON organization_invitations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);