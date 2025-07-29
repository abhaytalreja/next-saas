require('@testing-library/jest-dom')

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/admin',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Supabase
jest.mock('@nextsaas/supabase', () => ({
  getSupabaseServerClient: jest.fn(),
  getSupabaseBrowserClient: jest.fn(),
  createClient: jest.fn(),
}))

// Mock React Query
try {
  jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
    useMutation: jest.fn(),
    useQueryClient: jest.fn(),
    QueryClient: jest.fn(),
    QueryClientProvider: ({ children }) => children,
  }))
} catch (e) {
  // Module might not be available in test environment
}

// Global test utilities
global.fetch = jest.fn()
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

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