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
  return React.createElement(React.Fragment, null, children)
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
export { default as userEvent } from '@testing-library/user-event'

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