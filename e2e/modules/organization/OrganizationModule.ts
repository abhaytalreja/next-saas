import { BaseModule, ModuleDependency } from '../base/BaseModule'
import { TestOrganization, TestDataManager } from '../base/TestData'
import { AuthModule } from '../auth/AuthModule'

export interface OrganizationConfig {
  baseURL?: string
  createPath?: string
  settingsPath?: string
  switchPath?: string
  autoCreateOrganization?: boolean
}

export class OrganizationModule extends BaseModule {
  private testData: TestDataManager
  private currentOrganization: TestOrganization | null = null
  private authModule: AuthModule | null = null

  constructor(page, config: OrganizationConfig = {}) {
    super(page, {
      baseURL: 'http://localhost:3010',
      createPath: '/onboarding/organization',
      settingsPath: '/settings/organization',
      switchPath: '/organization/switch',
      autoCreateOrganization: true,
      ...config
    })
    this.testData = TestDataManager.getInstance()
  }

  protected getDependencies(): ModuleDependency[] {
    return [
      { name: 'auth', required: true }
    ]
  }

  protected async setup(): Promise<void> {
    this.authModule = this.getDependency<AuthModule>('auth')
    this.log('Initializing organization module')
  }

  /**
   * Create a new organization
   */
  async createOrganization(orgData?: Partial<TestOrganization>): Promise<TestOrganization> {
    const organization = this.testData.generateOrganization(orgData)
    this.log('Creating organization', organization.name)

    // Ensure user is authenticated
    if (!await this.authModule?.isAuthenticated()) {
      throw new Error('User must be authenticated to create organization')
    }

    await this.navigateTo(`${this.config.baseURL}${this.config.createPath}`)
    
    // Fill organization form
    await this.fillElement('[data-testid="org-name-input"]', organization.name)
    await this.fillElement('[data-testid="org-slug-input"]', organization.slug)
    
    if (organization.description) {
      await this.fillElement('[data-testid="org-description-input"]', organization.description)
    }
    
    if (organization.website) {
      await this.fillElement('[data-testid="org-website-input"]', organization.website)
    }
    
    // Submit organization creation
    await this.clickElement('[data-testid="create-org-button"]')
    
    // Wait for successful creation
    await this.page.waitForURL('/dashboard', { timeout: 15000 })
    
    this.currentOrganization = organization
    this.log('Organization created successfully', organization.name)
    return organization
  }

  /**
   * Switch to existing organization
   */
  async switchToOrganization(orgSlug: string): Promise<void> {
    this.log('Switching to organization', orgSlug)
    
    // Open organization switcher
    await this.clickElement('[data-testid="org-switcher-button"]')
    
    // Wait for organization list
    await this.waitForElement('[data-testid="org-switcher-menu"]')
    
    // Click on target organization
    await this.clickElement(`[data-testid="org-option-${orgSlug}"]`)
    
    // Wait for switch to complete
    await this.waitForNetworkIdle()
    
    // Update current organization
    const org = this.testData.getOrganization(orgSlug)
    if (org) {
      this.currentOrganization = org
    }
    
    this.log('Switched to organization successfully', orgSlug)
  }

  /**
   * Update organization settings
   */
  async updateOrganization(updates: Partial<TestOrganization>): Promise<void> {
    if (!this.currentOrganization) {
      throw new Error('No current organization to update')
    }

    this.log('Updating organization', this.currentOrganization.name)
    
    await this.navigateTo(`${this.config.baseURL}${this.config.settingsPath}`)
    
    // Update form fields
    if (updates.name) {
      await this.fillElement('[data-testid="org-name-input"]', updates.name)
    }
    
    if (updates.description) {
      await this.fillElement('[data-testid="org-description-input"]', updates.description)
    }
    
    if (updates.website) {
      await this.fillElement('[data-testid="org-website-input"]', updates.website)
    }
    
    // Save changes
    await this.clickElement('[data-testid="save-org-button"]')
    
    // Wait for success message
    await this.waitForElement('[data-testid="org-updated-message"]')
    
    // Update local data
    Object.assign(this.currentOrganization, updates)
    
    this.log('Organization updated successfully')
  }

  /**
   * Delete organization
   */
  async deleteOrganization(confirmationText?: string): Promise<void> {
    if (!this.currentOrganization) {
      throw new Error('No current organization to delete')
    }

    this.log('Deleting organization', this.currentOrganization.name)
    
    await this.navigateTo(`${this.config.baseURL}${this.config.settingsPath}`)
    
    // Navigate to danger zone
    await this.clickElement('[data-testid="org-danger-tab"]')
    
    // Click delete button
    await this.clickElement('[data-testid="delete-org-button"]')
    
    // Handle confirmation modal
    await this.waitForElement('[data-testid="delete-org-modal"]')
    
    const confirmText = confirmationText || this.currentOrganization.name
    await this.fillElement('[data-testid="delete-confirmation-input"]', confirmText)
    
    await this.clickElement('[data-testid="confirm-delete-button"]')
    
    // Wait for deletion to complete
    await this.page.waitForURL('/dashboard', { timeout: 15000 })
    
    this.currentOrganization = null
    this.log('Organization deleted successfully')
  }

  /**
   * Invite user to organization
   */
  async inviteUser(email: string, role: string = 'member'): Promise<void> {
    this.log('Inviting user to organization', { email, role })
    
    await this.navigateTo(`${this.config.baseURL}/settings/members`)
    
    // Click invite button
    await this.clickElement('[data-testid="invite-user-button"]')
    
    // Fill invite form
    await this.waitForElement('[data-testid="invite-modal"]')
    await this.fillElement('[data-testid="invite-email-input"]', email)
    
    // Select role
    await this.clickElement('[data-testid="role-select"]')
    await this.clickElement(`[data-testid="role-option-${role}"]`)
    
    // Send invitation
    await this.clickElement('[data-testid="send-invite-button"]')
    
    // Wait for success
    await this.waitForElement('[data-testid="invite-sent-message"]')
    
    this.log('User invited successfully', email)
  }

  /**
   * Accept organization invitation
   */
  async acceptInvitation(invitationToken: string): Promise<void> {
    this.log('Accepting organization invitation')
    
    await this.navigateTo(`${this.config.baseURL}/invite/accept?token=${invitationToken}`)
    
    // Click accept button
    await this.clickElement('[data-testid="accept-invite-button"]')
    
    // Wait for acceptance to complete
    await this.page.waitForURL('/dashboard', { timeout: 15000 })
    
    this.log('Invitation accepted successfully')
  }

  /**
   * Remove user from organization
   */
  async removeUser(userEmail: string): Promise<void> {
    this.log('Removing user from organization', userEmail)
    
    await this.navigateTo(`${this.config.baseURL}/settings/members`)
    
    // Find user in member list
    const userRow = `[data-testid="member-row-${userEmail}"]`
    await this.waitForElement(userRow)
    
    // Click remove button
    await this.clickElement(`${userRow} [data-testid="remove-member-button"]`)
    
    // Confirm removal
    await this.waitForElement('[data-testid="remove-member-modal"]')
    await this.clickElement('[data-testid="confirm-remove-button"]')
    
    // Wait for removal to complete
    await this.waitForElement('[data-testid="member-removed-message"]')
    
    this.log('User removed successfully', userEmail)
  }

  /**
   * Update user role in organization
   */
  async updateUserRole(userEmail: string, newRole: string): Promise<void> {
    this.log('Updating user role', { userEmail, newRole })
    
    await this.navigateTo(`${this.config.baseURL}/settings/members`)
    
    // Find user in member list
    const userRow = `[data-testid="member-row-${userEmail}"]`
    await this.waitForElement(userRow)
    
    // Click role dropdown
    await this.clickElement(`${userRow} [data-testid="role-select"]`)
    
    // Select new role
    await this.clickElement(`[data-testid="role-option-${newRole}"]`)
    
    // Wait for update to complete
    await this.waitForElement('[data-testid="role-updated-message"]')
    
    this.log('User role updated successfully')
  }

  /**
   * Get current organization
   */
  getCurrentOrganization(): TestOrganization | null {
    return this.currentOrganization
  }

  /**
   * List all organizations for current user
   */
  async listUserOrganizations(): Promise<string[]> {
    await this.clickElement('[data-testid="org-switcher-button"]')
    await this.waitForElement('[data-testid="org-switcher-menu"]')
    
    const orgElements = await this.page.locator('[data-testid^="org-option-"]').all()
    const orgSlugs = await Promise.all(
      orgElements.map(el => el.getAttribute('data-testid'))
    )
    
    // Extract slugs from data-testid attributes
    return orgSlugs
      .filter(testId => testId?.startsWith('org-option-'))
      .map(testId => testId!.replace('org-option-', ''))
  }

  /**
   * Verify organization is active
   */
  async verifyCurrentOrganization(expectedSlug: string): Promise<void> {
    // Check if organization name appears in header
    await this.assertVisible(`[data-testid="current-org-${expectedSlug}"]`)
    
    // Verify URL contains organization context if applicable
    const url = this.getCurrentURL()
    if (url.includes('/org/')) {
      expect(url).toContain(expectedSlug)
    }
  }

  /**
   * Setup organization for other modules
   */
  async setupOrganization(orgData?: Partial<TestOrganization>): Promise<TestOrganization> {
    if (this.currentOrganization) {
      return this.currentOrganization
    }
    
    return await this.createOrganization(orgData)
  }

  /**
   * Get organization members
   */
  async getOrganizationMembers(): Promise<Array<{email: string, role: string, status: string}>> {
    await this.navigateTo(`${this.config.baseURL}/settings/members`)
    
    const memberRows = await this.page.locator('[data-testid^="member-row-"]').all()
    const members = []
    
    for (const row of memberRows) {
      const email = await row.getAttribute('data-email') || ''
      const role = await row.locator('[data-testid="member-role"]').textContent() || ''
      const status = await row.locator('[data-testid="member-status"]').textContent() || ''
      
      members.push({ email, role, status })
    }
    
    return members
  }

  /**
   * Check organization permissions
   */
  async hasOrganizationPermission(permission: string): Promise<boolean> {
    try {
      const permissions = await this.executeScript(() => {
        // This would depend on your permission system
        return window.userPermissions || []
      })
      return permissions.includes(permission)
    } catch {
      return false
    }
  }

  /**
   * Verify organization isolation (multi-tenant testing)
   */
  async verifyOrganizationIsolation(): Promise<void> {
    if (!this.currentOrganization) {
      throw new Error('No current organization for isolation verification')
    }
    
    // Check that only current organization data is visible
    const orgId = this.currentOrganization.id
    
    // Verify API calls include organization context
    await this.page.route('**/api/**', route => {
      const request = route.request()
      const headers = request.headers()
      
      // Check for organization headers or parameters
      const hasOrgContext = 
        headers['x-organization-id'] === orgId ||
        request.url().includes(`org=${orgId}`) ||
        request.url().includes(`organization_id=${orgId}`)
      
      if (!hasOrgContext && !request.url().includes('/public/')) {
        console.warn('API request without organization context:', request.url())
      }
      
      route.continue()
    })
    
    this.log('Organization isolation verified')
  }

  protected async teardown(): Promise<void> {
    this.currentOrganization = null
  }

  /**
   * Health check for organization module
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Check if we can access organization features
      if (await this.authModule?.isAuthenticated()) {
        await this.navigateTo(`${this.config.baseURL}/dashboard`)
        return await this.elementExists('[data-testid="org-switcher-button"]')
      }
      return false
    } catch {
      return false
    }
  }
}