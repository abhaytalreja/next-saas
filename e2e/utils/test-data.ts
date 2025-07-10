import { faker } from '@faker-js/faker'

export interface TestUser {
  firstName: string
  lastName: string
  email: string
  password: string
  fullName: string
  username: string
  organization?: string
  role?: 'admin' | 'member' | 'viewer'
}

export interface TestOrganization {
  name: string
  slug: string
  description: string
  website?: string
  industry?: string
}

/**
 * Generate a test user with realistic data
 */
export function generateTestUser(options: Partial<TestUser> = {}): TestUser {
  const firstName = options.firstName || faker.person.firstName()
  const lastName = options.lastName || faker.person.lastName()
  const timestamp = Date.now()
  const randomId = faker.string.alphanumeric(8)
  
  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    username: faker.internet.userName({ firstName, lastName }),
    email: options.email || `next-saas-e2e-${timestamp}-${randomId}@mailinator.com`,
    password: options.password || 'TestPassword123!@#',
    organization: options.organization,
    role: options.role || 'member',
    ...options
  }
}

/**
 * Generate multiple test users
 */
export function generateTestUsers(count: number): TestUser[] {
  return Array.from({ length: count }, () => generateTestUser())
}

/**
 * Generate a test organization
 */
export function generateTestOrganization(options: Partial<TestOrganization> = {}): TestOrganization {
  const name = options.name || faker.company.name()
  const slug = options.slug || faker.helpers.slugify(name).toLowerCase()
  
  return {
    name,
    slug,
    description: options.description || faker.company.catchPhrase(),
    website: options.website || faker.internet.url(),
    industry: options.industry || faker.commerce.department(),
    ...options
  }
}

/**
 * Generate a team invitation
 */
export function generateTeamInvitation(organization: TestOrganization, invitedBy: TestUser) {
  return {
    email: `next-saas-e2e-invite-${Date.now()}@mailinator.com`,
    role: faker.helpers.arrayElement(['admin', 'member', 'viewer']) as 'admin' | 'member' | 'viewer',
    organizationName: organization.name,
    organizationSlug: organization.slug,
    invitedBy: invitedBy.fullName,
    invitedByEmail: invitedBy.email
  }
}

/**
 * Generate test file upload data
 */
export function generateTestFile(type: 'image' | 'document' | 'csv' = 'image') {
  const extensions = {
    image: ['jpg', 'png', 'gif', 'webp'],
    document: ['pdf', 'doc', 'docx', 'txt'],
    csv: ['csv']
  }
  
  const extension = faker.helpers.arrayElement(extensions[type])
  const filename = `test-${faker.string.alphanumeric(8)}.${extension}`
  
  return {
    filename,
    size: faker.number.int({ min: 1024, max: 5 * 1024 * 1024 }), // 1KB to 5MB
    type: type === 'image' ? `image/${extension}` : 
          type === 'document' ? 'application/pdf' : 
          'text/csv',
    lastModified: Date.now()
  }
}

/**
 * Generate test preferences
 */
export function generateTestPreferences() {
  return {
    theme: faker.helpers.arrayElement(['light', 'dark', 'system']),
    language: faker.helpers.arrayElement(['en', 'es', 'fr', 'de', 'pt']),
    timezone: faker.location.timeZone(),
    emailNotifications: {
      marketing: faker.datatype.boolean(),
      security: true, // Always keep security notifications
      updates: faker.datatype.boolean(),
      digest: faker.helpers.arrayElement(['daily', 'weekly', 'monthly', 'never'])
    },
    privacy: {
      profileVisibility: faker.helpers.arrayElement(['public', 'private', 'organization']),
      activityTracking: faker.datatype.boolean(),
      dataSharing: faker.datatype.boolean()
    }
  }
}

/**
 * Generate test activity data
 */
export function generateTestActivity(user: TestUser) {
  const actions = [
    'login',
    'logout',
    'profile_update',
    'password_change',
    'email_change',
    'organization_join',
    'organization_leave',
    'invite_sent',
    'invite_accepted',
    'file_upload',
    'file_delete',
    'settings_update'
  ]
  
  return {
    action: faker.helpers.arrayElement(actions),
    description: faker.lorem.sentence(),
    ipAddress: faker.internet.ip(),
    userAgent: faker.internet.userAgent(),
    location: `${faker.location.city()}, ${faker.location.country()}`,
    timestamp: faker.date.recent({ days: 30 }),
    metadata: {
      source: faker.helpers.arrayElement(['web', 'mobile', 'api']),
      success: faker.datatype.boolean({ probability: 0.9 })
    }
  }
}

/**
 * Generate test GDPR export data
 */
export function generateGDPRExportData(user: TestUser) {
  return {
    requestedAt: new Date().toISOString(),
    userId: faker.string.uuid(),
    email: user.email,
    personalData: {
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: faker.date.past({ years: 1 }).toISOString()
      },
      preferences: generateTestPreferences(),
      activity: Array.from({ length: 50 }, () => generateTestActivity(user))
    },
    organizations: [
      {
        name: faker.company.name(),
        role: user.role,
        joinedAt: faker.date.past({ years: 1 }).toISOString()
      }
    ]
  }
}

/**
 * Get predefined test users from the database
 */
export function getPredefinedTestUsers() {
  return {
    admin: {
      email: 'admin-user@mailinator.com',
      password: 'AdminUser123!@#',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin' as const
    },
    regular: {
      email: 'regular-user@mailinator.com',
      password: 'RegularUser123!@#',
      firstName: 'Regular',
      lastName: 'User',
      role: 'member' as const
    },
    multiOrg: {
      email: 'multi-org-user@mailinator.com',
      password: 'MultiOrgUser123!@#',
      firstName: 'Multi',
      lastName: 'Org',
      role: 'member' as const
    },
    pending: {
      email: 'pending-user@mailinator.com',
      password: 'PendingUser123!@#',
      firstName: 'Pending',
      lastName: 'User',
      role: 'member' as const
    }
  }
}

/**
 * Create a test scenario with multiple users and organizations
 */
export function createTestScenario(name: string) {
  const scenarios = {
    'basic-registration': {
      description: 'Basic user registration and verification',
      users: [generateTestUser()],
      organizations: []
    },
    'team-collaboration': {
      description: 'Team with admin and members',
      users: [
        generateTestUser({ role: 'admin' }),
        generateTestUser({ role: 'member' }),
        generateTestUser({ role: 'member' })
      ],
      organizations: [generateTestOrganization()]
    },
    'multi-tenant': {
      description: 'User belongs to multiple organizations',
      users: [generateTestUser()],
      organizations: [
        generateTestOrganization(),
        generateTestOrganization()
      ]
    },
    'gdpr-compliance': {
      description: 'GDPR data export and deletion',
      users: [generateTestUser()],
      organizations: [generateTestOrganization()]
    }
  }
  
  return scenarios[name as keyof typeof scenarios] || scenarios['basic-registration']
}

export default {
  generateTestUser,
  generateTestUsers,
  generateTestOrganization,
  generateTeamInvitation,
  generateTestFile,
  generateTestPreferences,
  generateTestActivity,
  generateGDPRExportData,
  getPredefinedTestUsers,
  createTestScenario
}