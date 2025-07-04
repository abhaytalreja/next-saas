-- Projects policies
CREATE POLICY "Organization members can view projects" ON projects
  FOR SELECT USING (
    auth.check_org_membership(organization_id, auth.uid())
    AND deleted_at IS NULL
  );

CREATE POLICY "Organization members can create projects" ON projects
  FOR INSERT WITH CHECK (
    auth.check_org_membership(organization_id, auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "Project creators and admins can update projects" ON projects
  FOR UPDATE USING (
    auth.check_org_membership(organization_id, auth.uid())
    AND (created_by = auth.uid() OR auth.check_org_role(organization_id, auth.uid(), 'admin'))
    AND deleted_at IS NULL
  );

CREATE POLICY "Project creators and admins can delete projects" ON projects
  FOR UPDATE USING (
    auth.check_org_membership(organization_id, auth.uid())
    AND (created_by = auth.uid() OR auth.check_org_role(organization_id, auth.uid(), 'admin'))
    AND deleted_at IS NULL
  );

-- Items policies
CREATE POLICY "Organization members can view items" ON items
  FOR SELECT USING (
    auth.check_org_membership(organization_id, auth.uid())
    AND deleted_at IS NULL
  );

CREATE POLICY "Organization members can create items" ON items
  FOR INSERT WITH CHECK (
    auth.check_org_membership(organization_id, auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "Item creators and assignees can update items" ON items
  FOR UPDATE USING (
    auth.check_org_membership(organization_id, auth.uid())
    AND (created_by = auth.uid() OR assigned_to = auth.uid() OR auth.check_org_role(organization_id, auth.uid(), 'admin'))
    AND deleted_at IS NULL
  );

CREATE POLICY "Item creators and admins can delete items" ON items
  FOR UPDATE USING (
    auth.check_org_membership(organization_id, auth.uid())
    AND (created_by = auth.uid() OR auth.check_org_role(organization_id, auth.uid(), 'admin'))
    AND deleted_at IS NULL
  );

-- Categories policies
CREATE POLICY "Organization members can view categories" ON categories
  FOR SELECT USING (
    auth.check_org_membership(organization_id, auth.uid())
  );

CREATE POLICY "Organization admins can manage categories" ON categories
  FOR ALL USING (
    auth.check_org_role(organization_id, auth.uid(), 'admin')
  );

-- Item categories policies
CREATE POLICY "Organization members can view item categories" ON item_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = item_id
      AND auth.check_org_membership(items.organization_id, auth.uid())
    )
  );

CREATE POLICY "Item creators can manage item categories" ON item_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = item_id
      AND auth.check_org_membership(items.organization_id, auth.uid())
      AND (items.created_by = auth.uid() OR auth.check_org_role(items.organization_id, auth.uid(), 'admin'))
    )
  );

-- Attachments policies
CREATE POLICY "Organization members can view attachments" ON attachments
  FOR SELECT USING (
    auth.check_org_membership(organization_id, auth.uid())
  );

CREATE POLICY "Organization members can create attachments" ON attachments
  FOR INSERT WITH CHECK (
    auth.check_org_membership(organization_id, auth.uid())
    AND uploaded_by = auth.uid()
  );

CREATE POLICY "Attachment uploaders can delete their attachments" ON attachments
  FOR DELETE USING (
    uploaded_by = auth.uid()
  );

-- Custom fields policies
CREATE POLICY "Organization members can view custom fields" ON custom_fields
  FOR SELECT USING (
    auth.check_org_membership(organization_id, auth.uid())
  );

CREATE POLICY "Organization admins can manage custom fields" ON custom_fields
  FOR ALL USING (
    auth.check_org_role(organization_id, auth.uid(), 'admin')
  );

-- Custom field values policies
CREATE POLICY "Organization members can view custom field values" ON custom_field_values
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM custom_fields
      WHERE custom_fields.id = custom_field_id
      AND auth.check_org_membership(custom_fields.organization_id, auth.uid())
    )
  );

CREATE POLICY "Users with entity access can manage custom field values" ON custom_field_values
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM custom_fields
      WHERE custom_fields.id = custom_field_id
      AND auth.check_org_membership(custom_fields.organization_id, auth.uid())
    )
  );