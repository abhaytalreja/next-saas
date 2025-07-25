// Mock implementation of Supabase auth helpers for testing
import { createClient } from './supabase-mock'

export const useUser = jest.fn(() => ({
  id: 'user-123',
  email: 'test@example.com',
  created_at: '2023-01-01T00:00:00Z'
}))

export const useSupabaseClient = jest.fn(() => createClient())

export const useSession = jest.fn(() => ({
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_at: Date.now() + 3600000,
  user: {
    id: 'user-123',
    email: 'test@example.com',
    created_at: '2023-01-01T00:00:00Z'
  }
}))

export const createClientComponentClient = jest.fn(() => createClient())
export const createServerClient = jest.fn(() => createClient())
export const createRouteHandlerClient = jest.fn(() => createClient())
export const createServerComponentClient = jest.fn(() => createClient())
export const createServerActionClient = jest.fn(() => createClient())

export default {
  useUser,
  useSupabaseClient,
  useSession,
  createClientComponentClient,
  createServerClient,
  createRouteHandlerClient,
  createServerComponentClient,
  createServerActionClient
}