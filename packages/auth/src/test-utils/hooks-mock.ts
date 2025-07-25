// Mock implementation of hooks for testing

export const useOrganization = jest.fn(() => ({
  currentOrganization: null,
  organizations: [],
  loading: false,
  error: null,
  switchOrganization: jest.fn(),
  refreshOrganizations: jest.fn(),
  currentMembership: null,
  hasPermission: jest.fn(() => false),
  isOwner: jest.fn(() => false),
  isAdmin: jest.fn(() => false),
  canInviteMembers: jest.fn(() => false)
}))

export const useCurrentMembership = jest.fn(() => ({
  membership: null,
  loading: false
}))

export const useAuth = jest.fn(() => ({
  user: {
    id: 'mock-user-id',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z'
  }
}))

export const useUser = jest.fn(() => ({
  id: 'mock-user-id',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z'
}))

export const useUserPreferences = jest.fn(() => ({
  preferences: null,
  loading: false,
  updatePreferences: jest.fn()
}))

export default {
  useOrganization,
  useCurrentMembership,
  useAuth,
  useUser,
  useUserPreferences
}