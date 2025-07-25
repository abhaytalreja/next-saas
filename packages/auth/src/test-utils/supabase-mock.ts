// Mock implementation of @supabase/supabase-js for testing

// Default mock data
const mockData = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
    created_at: '2023-01-01T00:00:00Z'
  },
  avatar: {
    id: 'avatar-123',
    user_id: 'user-123',
    storage_path: 'user-123/avatar.webp',
    public_url: 'https://mock-storage.example.com/avatar.webp',
    file_size: 1024,
    mime_type: 'image/webp',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z'
  },
  activity: {
    id: 'activity-123',
    user_id: 'user-123',
    action: 'avatar_uploaded',
    resource: 'avatar',
    created_at: '2023-01-01T00:00:00Z'
  }
}

// Create a chainable mock that can handle various Supabase query patterns
const createMockChain = (defaultResult: any = { data: null, error: null }) => {
  const chain: any = {
    select: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    neq: jest.fn(() => chain),
    lt: jest.fn(() => chain),
    lte: jest.fn(() => chain),
    gt: jest.fn(() => chain),
    gte: jest.fn(() => chain),
    like: jest.fn(() => chain),
    ilike: jest.fn(() => chain),
    is: jest.fn(() => chain),
    in: jest.fn(() => chain),
    contains: jest.fn(() => chain),
    containedBy: jest.fn(() => chain),
    rangeGt: jest.fn(() => chain),
    rangeGte: jest.fn(() => chain),
    rangeLt: jest.fn(() => chain),
    rangeLte: jest.fn(() => chain),
    rangeAdjacent: jest.fn(() => chain),
    overlaps: jest.fn(() => chain),
    textSearch: jest.fn(() => chain),
    match: jest.fn(() => chain),
    not: jest.fn(() => chain),
    or: jest.fn(() => chain),
    order: jest.fn(() => chain),
    limit: jest.fn(() => chain),
    range: jest.fn(() => chain),
    single: jest.fn(() => Promise.resolve(defaultResult)),
    maybeSingle: jest.fn(() => Promise.resolve(defaultResult)),
    then: jest.fn((onResolve) => Promise.resolve(defaultResult).then(onResolve)),
    catch: jest.fn((onReject) => Promise.resolve(defaultResult).catch(onReject))
  }

  // Make the chain thenable so it can be awaited directly
  chain.then = jest.fn((onResolve) => Promise.resolve(defaultResult).then(onResolve))
  chain.catch = jest.fn((onReject) => Promise.resolve(defaultResult).catch(onReject))

  return chain
}

export const createClient = jest.fn(() => ({
  auth: {
    getUser: jest.fn(() => Promise.resolve({ 
      data: { user: mockData.user }, 
      error: null 
    })),
    signIn: jest.fn(() => Promise.resolve({ 
      data: { user: mockData.user, session: {} }, 
      error: null 
    })),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
    signUp: jest.fn(() => Promise.resolve({ 
      data: { user: mockData.user, session: {} }, 
      error: null 
    })),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    })),
    getSession: jest.fn(() => Promise.resolve({ 
      data: { session: { user: mockData.user } }, 
      error: null 
    }))
  },
  
  from: jest.fn((table: string) => {
    let mockResult = { data: [], error: null }
    
    // Customize mock data based on table
    switch (table) {
      case 'user_avatars':
        mockResult = { data: [mockData.avatar], error: null }
        break
      case 'user_activity':
        mockResult = { data: [mockData.activity], error: null }
        break
      case 'users':
        mockResult = { data: [mockData.user], error: null }
        break
      default:
        mockResult = { data: [], error: null }
    }
    
    const chain = createMockChain(mockResult)
    
    // Override specific methods for different operations
    chain.insert = jest.fn(() => createMockChain({ data: mockData.avatar, error: null }))
    chain.upsert = jest.fn(() => createMockChain({ data: mockData.avatar, error: null }))
    chain.update = jest.fn(() => createMockChain({ data: mockData.avatar, error: null }))
    chain.delete = jest.fn(() => createMockChain({ data: null, error: null }))
    
    return chain
  }),
  
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(() => Promise.resolve({
        data: {
          path: 'user-123/avatar.webp',
          id: 'file-123',
          fullPath: 'avatars/user-123/avatar.webp'
        },
        error: null
      })),
      download: jest.fn(() => Promise.resolve({
        data: new Blob(['mock file content'], { type: 'image/webp' }),
        error: null
      })),
      remove: jest.fn(() => Promise.resolve({
        data: null,
        error: null
      })),
      getPublicUrl: jest.fn(() => ({
        data: { publicUrl: 'https://mock-storage.example.com/avatar.webp' }
      })),
      createSignedUrl: jest.fn(() => Promise.resolve({
        data: { signedUrl: 'https://mock-storage.example.com/avatar.webp?token=123' },
        error: null
      }))
    }))
  },
  
  // Real-time subscriptions
  channel: jest.fn(() => ({
    on: jest.fn(() => ({ subscribe: jest.fn() })),
    subscribe: jest.fn()
  }))
}))

// Also export commonly used auth helpers
export const createClientComponentClient = createClient
export const createServerComponentClient = createClient
export const createServerActionClient = createClient

export default { 
  createClient, 
  createClientComponentClient,
  createServerComponentClient,
  createServerActionClient
}