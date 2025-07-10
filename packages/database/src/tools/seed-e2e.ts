#!/usr/bin/env tsx
/**
 * E2E Test Database Seeding Tool
 * 
 * This tool provides utilities for seeding and managing test data
 * specifically for E2E testing scenarios.
 */

import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load test environment variables
config({ path: ['.env.test', '.env.local', '.env'] })

interface TestUser {
  id: string
  email: string
  password: string
  name: string
  role: string
  verified: boolean
  profile_complete: boolean
}

interface TestOrganization {
  id: string
  name: string
  domain: string
  type: string
  owner_id: string
}

class E2ESeedManager {
  private supabase: any
  private environment: string

  constructor() {
    const supabaseUrl = process.env.TEST_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.TEST_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration for E2E testing')
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    this.environment = process.env.NODE_ENV || 'test'
  }

  /**
   * Seed test users with proper authentication setup
   */
  async seedTestUsers(): Promise<TestUser[]> {
    console.log('👥 Seeding test users...')

    const testUsers: TestUser[] = [
      {
        id: '10000000-0000-0000-0000-000000000001',
        email: 'next-saas-admin@mailinator.com',
        password: 'AdminTest123!',
        name: 'Admin User',
        role: 'admin',
        verified: true,
        profile_complete: true
      },
      {
        id: '10000000-0000-0000-0000-000000000002',
        email: 'next-saas-org-admin@mailinator.com',
        password: 'OrgAdmin123!',
        name: 'Org Admin',
        role: 'org_admin',
        verified: true,
        profile_complete: true
      },
      {
        id: '10000000-0000-0000-0000-000000000003',
        email: 'next-saas-user@mailinator.com',
        password: 'UserTest123!',
        name: 'Test User',
        role: 'user',
        verified: true,
        profile_complete: true
      },
      {
        id: '10000000-0000-0000-0000-000000000004',
        email: 'next-saas-multi@mailinator.com',
        password: 'MultiTest123!',
        name: 'Multi Org User',
        role: 'user',
        verified: true,
        profile_complete: true
      },
      {
        id: '10000000-0000-0000-0000-000000000005',
        email: 'next-saas-mobile@mailinator.com',
        password: 'MobileTest123!',
        name: 'Mobile User',
        role: 'user',
        verified: true,
        profile_complete: true
      },
      {
        id: '10000000-0000-0000-0000-000000000006',
        email: 'next-saas-pending@mailinator.com',
        password: 'PendingTest123!',
        name: 'Pending User',
        role: 'user',
        verified: false,
        profile_complete: false
      },
      {
        id: '10000000-0000-0000-0000-000000000007',
        email: 'next-saas-incomplete@mailinator.com',
        password: 'IncompleteTest123!',
        name: 'Incomplete User',
        role: 'user',
        verified: true,
        profile_complete: false
      },
      {
        id: '10000000-0000-0000-0000-000000000008',
        email: 'next-saas-gdpr@mailinator.com',
        password: 'GdprTest123!',
        name: 'GDPR Test User',
        role: 'user',
        verified: true,
        profile_complete: true
      }
    ]

    // Create users using Supabase Auth API
    for (const user of testUsers) {
      try {
        console.log(`  Creating user: ${user.email}`)
        
        // Create auth user
        const { data: authUser, error: authError } = await this.supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: user.verified,
          user_metadata: {
            name: user.name,
            role: user.role,
            test_account: true,
            profile_complete: user.profile_complete
          }
        })

        if (authError) {
          console.warn(`    Warning: Could not create auth user ${user.email}:`, authError.message)
          continue
        }

        // Update user in our users table
        const { error: userError } = await this.supabase
          .from('users')
          .upsert({
            id: authUser.user.id,
            email: user.email,
            name: user.name,
            email_verified_at: user.verified ? new Date().toISOString() : null,
            metadata: {
              role: user.role,
              test_account: true,
              profile_complete: user.profile_complete
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (userError) {
          console.warn(`    Warning: Could not update user record for ${user.email}:`, userError.message)
        } else {
          console.log(`    ✅ User created: ${user.email}`)
        }

      } catch (error) {
        console.warn(`    Warning: Failed to create user ${user.email}:`, error)
      }
    }

    console.log('✅ Test users seeding completed')
    return testUsers
  }

  /**
   * Seed test organizations
   */
  async seedTestOrganizations(): Promise<TestOrganization[]> {
    console.log('🏢 Seeding test organizations...')

    const testOrgs: TestOrganization[] = [
      {
        id: '20000000-0000-0000-0000-000000000001',
        name: 'Acme Corporation',
        domain: 'acme-test.com',
        type: 'business',
        owner_id: '10000000-0000-0000-0000-000000000001'
      },
      {
        id: '20000000-0000-0000-0000-000000000002',
        name: 'Tech Startup Inc',
        domain: 'techstartup-test.io',
        type: 'startup',
        owner_id: '10000000-0000-0000-0000-000000000002'
      },
      {
        id: '20000000-0000-0000-0000-000000000003',
        name: 'Enterprise Corp',
        domain: 'enterprise-test.com',
        type: 'enterprise',
        owner_id: '10000000-0000-0000-0000-000000000001'
      },
      {
        id: '20000000-0000-0000-0000-000000000004',
        name: 'Consulting Firm LLC',
        domain: 'consulting-test.biz',
        type: 'consulting',
        owner_id: '10000000-0000-0000-0000-000000000004'
      },
      {
        id: '20000000-0000-0000-0000-000000000005',
        name: 'Mobile First Co',
        domain: 'mobile-test.app',
        type: 'mobile_app',
        owner_id: '10000000-0000-0000-0000-000000000005'
      }
    ]

    for (const org of testOrgs) {
      try {
        console.log(`  Creating organization: ${org.name}`)

        const { error } = await this.supabase
          .from('organizations')
          .upsert({
            id: org.id,
            name: org.name,
            domain: org.domain,
            metadata: {
              type: org.type,
              test_account: true
            },
            settings: {
              features: {
                billing: true,
                advanced_analytics: org.type === 'enterprise',
                custom_branding: org.type !== 'startup'
              }
            },
            created_by: org.owner_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (error) {
          console.warn(`    Warning: Could not create organization ${org.name}:`, error.message)
        } else {
          console.log(`    ✅ Organization created: ${org.name}`)
        }

      } catch (error) {
        console.warn(`    Warning: Failed to create organization ${org.name}:`, error)
      }
    }

    console.log('✅ Test organizations seeding completed')
    return testOrgs
  }

  /**
   * Seed test memberships
   */
  async seedTestMemberships(): Promise<void> {
    console.log('👥 Seeding test memberships...')

    const memberships = [
      // Admin user in Acme Corporation (Owner)
      {
        user_id: '10000000-0000-0000-0000-000000000001',
        organization_id: '20000000-0000-0000-0000-000000000001',
        role: 'owner',
        status: 'active'
      },
      // Regular user in Acme Corporation (Member)
      {
        user_id: '10000000-0000-0000-0000-000000000003',
        organization_id: '20000000-0000-0000-0000-000000000001',
        role: 'member',
        status: 'active'
      },
      // Multi-org user in Tech Startup (Admin)
      {
        user_id: '10000000-0000-0000-0000-000000000004',
        organization_id: '20000000-0000-0000-0000-000000000002',
        role: 'admin',
        status: 'active'
      },
      // Multi-org user in Consulting Firm (Member)
      {
        user_id: '10000000-0000-0000-0000-000000000004',
        organization_id: '20000000-0000-0000-0000-000000000004',
        role: 'member',
        status: 'active'
      },
      // Mobile user in Mobile First Co (Member)
      {
        user_id: '10000000-0000-0000-0000-000000000005',
        organization_id: '20000000-0000-0000-0000-000000000005',
        role: 'member',
        status: 'active'
      }
    ]

    for (const membership of memberships) {
      try {
        const { error } = await this.supabase
          .from('memberships')
          .upsert({
            ...membership,
            permissions: this.getRolePermissions(membership.role),
            invited_at: new Date().toISOString(),
            accepted_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (error) {
          console.warn(`    Warning: Could not create membership:`, error.message)
        }

      } catch (error) {
        console.warn(`    Warning: Failed to create membership:`, error)
      }
    }

    console.log('✅ Test memberships seeding completed')
  }

  /**
   * Get role permissions
   */
  private getRolePermissions(role: string): object {
    const permissions = {
      owner: { admin: true, billing: true, members: true, settings: true },
      admin: { admin: true, billing: false, members: true, settings: true },
      member: { admin: false, billing: false, members: false, settings: false }
    }
    return permissions[role as keyof typeof permissions] || permissions.member
  }

  /**
   * Clean up dynamic test data
   */
  async cleanupDynamicData(): Promise<void> {
    console.log('🧹 Cleaning up dynamic test data...')

    const tables = [
      'user_activity',
      'sessions', 
      'email_verifications',
      'password_resets'
    ]

    for (const table of tables) {
      try {
        // Clean up data created in the last hour (test run data)
        const { error } = await this.supabase
          .from(table)
          .delete()
          .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())

        if (error) {
          console.warn(`    Warning: Could not clean up ${table}:`, error.message)
        } else {
          console.log(`    ✅ Cleaned up recent data from ${table}`)
        }
      } catch (error) {
        console.warn(`    Warning: Failed to clean up ${table}:`, error)
      }
    }

    console.log('✅ Dynamic data cleanup completed')
  }

  /**
   * Verify test data integrity
   */
  async verifyTestData(): Promise<boolean> {
    console.log('🔍 Verifying test data integrity...')

    try {
      // Check test users
      const { data: users, error: usersError } = await this.supabase
        .from('users')
        .select('email')
        .like('email', '%@mailinator.com')

      if (usersError) {
        console.error('❌ Failed to verify users:', usersError.message)
        return false
      }

      // Check test organizations
      const { data: orgs, error: orgsError } = await this.supabase
        .from('organizations')
        .select('name')
        .eq('metadata->>test_account', 'true')

      if (orgsError) {
        console.error('❌ Failed to verify organizations:', orgsError.message)
        return false
      }

      console.log(`✅ Found ${users?.length || 0} test users`)
      console.log(`✅ Found ${orgs?.length || 0} test organizations`)

      return (users?.length || 0) > 0 && (orgs?.length || 0) > 0

    } catch (error) {
      console.error('❌ Data integrity verification failed:', error)
      return false
    }
  }

  /**
   * Full E2E database setup
   */
  async setupE2EDatabase(): Promise<void> {
    console.log('🎯 Setting up E2E test database...\n')

    try {
      // Clean up any existing dynamic data
      await this.cleanupDynamicData()

      // Seed core test data
      await this.seedTestUsers()
      await this.seedTestOrganizations()
      await this.seedTestMemberships()

      // Verify everything is set up correctly
      const isValid = await this.verifyTestData()
      
      if (!isValid) {
        throw new Error('Test data verification failed')
      }

      console.log('\n🎉 E2E database setup completed successfully!')

    } catch (error) {
      console.error('\n💥 E2E database setup failed:', error)
      throw error
    }
  }
}

// CLI usage
if (require.main === module) {
  const command = process.argv[2]
  const seedManager = new E2ESeedManager()

  async function main() {
    try {
      switch (command) {
        case 'setup':
          await seedManager.setupE2EDatabase()
          break
        case 'users':
          await seedManager.seedTestUsers()
          break
        case 'organizations':
          await seedManager.seedTestOrganizations()
          break
        case 'memberships':
          await seedManager.seedTestMemberships()
          break
        case 'cleanup':
          await seedManager.cleanupDynamicData()
          break
        case 'verify':
          const isValid = await seedManager.verifyTestData()
          console.log(isValid ? '✅ Test data is valid' : '❌ Test data is invalid')
          process.exit(isValid ? 0 : 1)
        default:
          console.log(`
E2E Database Seeding Tool

Usage:
  npx tsx src/tools/seed-e2e.ts <command>

Commands:
  setup         Full E2E database setup
  users         Seed test users only
  organizations Seed test organizations only
  memberships   Seed test memberships only
  cleanup       Clean up dynamic test data
  verify        Verify test data integrity

Examples:
  npx tsx src/tools/seed-e2e.ts setup      # Full setup
  npx tsx src/tools/seed-e2e.ts verify     # Verify data
  npx tsx src/tools/seed-e2e.ts cleanup    # Clean up
          `)
      }
    } catch (error) {
      console.error('❌ Command failed:', error)
      process.exit(1)
    }
  }

  main()
}

export default E2ESeedManager