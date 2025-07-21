import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function setupDatabase() {
  try {
    // Clean up any existing test data
    await cleanupDatabase()
    
    // Set up test database state
    console.log('Setting up test database...')
    
    // Create test schema if needed
    await supabase.rpc('setup_test_environment')
    
    console.log('Test database setup complete')
  } catch (error) {
    console.error('Failed to setup test database:', error)
    throw error
  }
}

export async function cleanupDatabase() {
  try {
    console.log('Cleaning up test database...')
    
    // Delete test data in proper order (respecting foreign key constraints)
    const tables = [
      'audit_logs',
      'security_events',
      'api_keys',
      'invitations',
      'project_members',
      'projects',
      'workspace_members', 
      'workspaces',
      'organization_members',
      'organizations',
      'user_profiles'
    ]
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .like('email', '%@example.com') // Only delete test data
      
      if (error && !error.message.includes('does not exist')) {
        console.warn(`Warning cleaning ${table}:`, error.message)
      }
    }
    
    // Clean up auth users that were created for testing
    const { data: users } = await supabase.auth.admin.listUsers()
    
    if (users?.users) {
      for (const user of users.users) {
        if (user.email?.includes('@example.com')) {
          await supabase.auth.admin.deleteUser(user.id)
        }
      }
    }
    
    console.log('Test database cleanup complete')
  } catch (error) {
    console.error('Failed to cleanup test database:', error)
  }
}

export async function seedTestData() {
  try {
    console.log('Seeding test data...')
    
    // Insert test permissions
    const permissions = [
      { name: 'organization:view', description: 'View organization', category: 'organization' },
      { name: 'organization:manage', description: 'Manage organization', category: 'organization' },
      { name: 'workspace:view', description: 'View workspaces', category: 'workspace' },
      { name: 'workspace:create', description: 'Create workspaces', category: 'workspace' },
      { name: 'workspace:update', description: 'Update workspaces', category: 'workspace' },
      { name: 'workspace:delete', description: 'Delete workspaces', category: 'workspace' },
      { name: 'project:view', description: 'View projects', category: 'project' },
      { name: 'project:create', description: 'Create projects', category: 'project' },
      { name: 'project:update', description: 'Update projects', category: 'project' },
      { name: 'project:delete', description: 'Delete projects', category: 'project' }
    ]
    
    await supabase.from('permissions').upsert(permissions)
    
    // Insert test roles with permissions
    const roles = [
      {
        name: 'owner',
        display_name: 'Owner',
        type: 'system',
        permissions: ['*'] // All permissions
      },
      {
        name: 'admin', 
        display_name: 'Administrator',
        type: 'system',
        permissions: [
          'organization:view',
          'organization:manage',
          'workspace:view',
          'workspace:create', 
          'workspace:update',
          'workspace:delete',
          'project:view',
          'project:create',
          'project:update'
        ]
      },
      {
        name: 'member',
        display_name: 'Member', 
        type: 'system',
        permissions: [
          'organization:view',
          'workspace:view',
          'project:view'
        ]
      }
    ]
    
    await supabase.from('roles').upsert(roles)
    
    console.log('Test data seeded successfully')
  } catch (error) {
    console.error('Failed to seed test data:', error)
    throw error
  }
}

export async function createTestDatabase() {
  await setupDatabase()
  await seedTestData()
}

export async function resetTestDatabase() {
  await cleanupDatabase()
  await seedTestData()
}