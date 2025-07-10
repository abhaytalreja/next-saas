import React from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

// Add jest-axe matchers
expect.extend(toHaveNoViolations)

// Mock providers for testing
interface TestProvidersProps {
  children: React.ReactNode
}

const TestProviders: React.FC<TestProvidersProps> = ({ children }) => {
  return <>{children}</>
}

// Custom render function that includes providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult => {
  return render(ui, { wrapper: TestProviders, ...options })
}

// Accessibility testing helper
export const testAccessibility = async (ui: React.ReactElement) => {
  const { container } = customRender(ui)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react'
export { userEvent } from '@testing-library/user-event'

// Override render with our custom version
export { customRender as render }

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  created_at: '2023-01-01T00:00:00Z',
  last_sign_in_at: '2023-01-01T10:00:00Z',
  email_confirmed_at: '2023-01-01T00:00:00Z',
  ...overrides
})

export const createMockProfile = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  display_name: 'johndoe',
  bio: 'Software engineer',
  avatar_url: null,
  phone_number: '+1234567890',
  company: 'Acme Corp',
  job_title: 'Developer',
  location: 'San Francisco',
  timezone: 'America/Los_Angeles',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  ...overrides
})

export const createMockPreferences = (overrides = {}) => ({
  id: 'pref-123',
  user_id: 'user-123',
  theme: 'system',
  language: 'en',
  date_format: 'MM/dd/yyyy',
  time_format: '12h',
  email_notifications_enabled: true,
  email_frequency: 'immediate',
  email_digest: true,
  notify_security_alerts: true,
  notify_account_updates: true,
  notify_organization_updates: true,
  notify_project_updates: true,
  notify_mentions: true,
  notify_comments: true,
  notify_invitations: true,
  notify_billing_alerts: true,
  notify_feature_announcements: false,
  browser_notifications_enabled: false,
  desktop_notifications_enabled: false,
  mobile_notifications_enabled: false,
  marketing_emails: false,
  product_updates: true,
  newsletters: false,
  surveys: false,
  profile_visibility: 'organization',
  email_visibility: 'organization',
  activity_visibility: 'organization',
  hide_last_seen: false,
  hide_activity_status: false,
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00',
  timezone_aware: true,
  reduce_motion: false,
  high_contrast: false,
  screen_reader_optimized: false,
  data_retention_period: 365,
  auto_delete_inactive: false,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  ...overrides
})

export const createMockActivity = (overrides = {}) => ({
  id: 'activity-123',
  user_id: 'user-123',
  action: 'login',
  description: 'User logged in',
  status: 'success',
  ip_address: '192.168.1.1',
  user_agent: 'Mozilla/5.0...',
  device_type: 'desktop',
  browser: 'Chrome',
  os: 'macOS',
  location_city: 'San Francisco',
  location_country: 'US',
  metadata: {},
  created_at: '2023-01-01T10:00:00Z',
  ...overrides
})

export const createMockSession = (overrides = {}) => ({
  id: 'session-123',
  user_id: 'user-123',
  session_token: 'token-123',
  device_type: 'desktop',
  browser: 'Chrome',
  os: 'macOS',
  device_name: 'MacBook Pro',
  device_fingerprint: 'fingerprint-123',
  ip_address: '192.168.1.1',
  location_city: 'San Francisco',
  location_country: 'US',
  location_region: 'CA',
  is_current: false,
  is_trusted: false,
  expires_at: '2023-01-02T10:00:00Z',
  last_activity_at: '2023-01-01T10:00:00Z',
  revoked_at: null,
  revoked_reason: null,
  revoked_by_user_id: null,
  created_at: '2023-01-01T10:00:00Z',
  updated_at: '2023-01-01T10:00:00Z',
  ...overrides
})

export const createMockAvatar = (overrides = {}) => ({
  id: 'avatar-123',
  user_id: 'user-123',
  file_path: 'avatars/user-123/avatar-123.jpg',
  file_size: 1024 * 1024,
  mime_type: 'image/jpeg',
  original_name: 'avatar.jpg',
  status: 'approved',
  variants: {
    thumbnail: {
      url: 'https://example.com/thumb.jpg',
      width: 64,
      height: 64,
      file_size: 5000
    },
    small: {
      url: 'https://example.com/small.jpg',
      width: 128,
      height: 128,
      file_size: 10000
    },
    medium: {
      url: 'https://example.com/medium.jpg',
      width: 256,
      height: 256,
      file_size: 20000
    },
    large: {
      url: 'https://example.com/large.jpg',
      width: 512,
      height: 512,
      file_size: 40000
    }
  },
  is_current: true,
  created_at: '2023-01-01T10:00:00Z',
  updated_at: '2023-01-01T10:00:00Z',
  ...overrides
})

// Mock file helper
export const createMockFile = (
  name: string,
  size: number,
  type: string,
  content: string = 'mock content'
): File => {
  const file = new File([content], name, { type })
  Object.defineProperty(file, 'size', { value: size, writable: false })
  return file
}

// Async testing helper
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

// Mock timers helper
export const advanceTimers = (ms: number) => {
  if (jest.isMockFunction(setTimeout)) {
    jest.advanceTimersByTime(ms)
  }
}

// Mock console methods to avoid noise in tests
export const mockConsole = () => {
  const originalError = console.error
  const originalWarn = console.warn
  
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })
  
  afterEach(() => {
    console.error = originalError
    console.warn = originalWarn
  })
}

// Environment setup for tests
export const setupTestEnvironment = () => {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })

  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }))

  // Mock ResizeObserver
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }))

  // Mock URL.createObjectURL
  global.URL.createObjectURL = jest.fn().mockReturnValue('mock-url')
  global.URL.revokeObjectURL = jest.fn()

  // Mock fetch
  global.fetch = jest.fn()
}