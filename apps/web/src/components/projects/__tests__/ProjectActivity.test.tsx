import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { ProjectActivity } from '../ProjectActivity'

// Mock the Supabase client
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
  })),
}

// Mock the getSupabaseBrowserClient function
jest.mock('@nextsaas/supabase', () => ({
  getSupabaseBrowserClient: () => mockSupabaseClient,
}))

// Mock UI components
jest.mock('@nextsaas/ui', () => ({
  LegacyCard: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  LegacyCardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
  LegacyCardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
  LegacyCardTitle: ({ children, ...props }: any) => <h2 data-testid="card-title" {...props}>{children}</h2>,
  Badge: ({ children, ...props }: any) => <span data-testid="badge" {...props}>{children}</span>,
  Avatar: ({ children, ...props }: any) => <div data-testid="avatar" {...props}>{children}</div>,
  AvatarFallback: ({ children, ...props }: any) => <div data-testid="avatar-fallback" {...props}>{children}</div>,
  AvatarImage: ({ children, ...props }: any) => <img data-testid="avatar-image" {...props} />,
}))

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  ClockIcon: () => <div data-testid="clock-icon">Clock</div>,
  UserCircleIcon: () => <div data-testid="user-circle-icon">UserCircle</div>,
  DocumentIcon: () => <div data-testid="document-icon">Document</div>,
  PlusIcon: () => <div data-testid="plus-icon">Plus</div>,
  PencilIcon: () => <div data-testid="pencil-icon">Pencil</div>,
  TrashIcon: () => <div data-testid="trash-icon">Trash</div>,
}))

const mockActivities = [
  {
    id: '1',
    action: 'project_created',
    entity_type: 'projects',
    entity_id: 'project-1',
    entity_title: 'Test Project',
    description: 'Created a new project',
    metadata: { type: 'web' },
    created_at: '2023-12-01T10:00:00Z',
    user_id: 'user-1',
    user: {
      id: 'user-1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      avatar_url: 'https://example.com/avatar.jpg',
    },
  },
  {
    id: '2',
    action: 'item_updated',
    entity_type: 'project_items',
    entity_id: 'item-1',
    entity_title: 'Test Item',
    description: null,
    metadata: {},
    created_at: '2023-12-01T11:00:00Z',
    user_id: 'user-2',
    user: {
      id: 'user-2',
      first_name: '',
      last_name: '',
      email: 'jane@example.com',
      avatar_url: null,
    },
  },
]

describe('ProjectActivity', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render loading state initially', () => {
    // Mock a pending promise
    const pendingPromise = new Promise(() => {})
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => pendingPromise),
          })),
        })),
      })),
    })

    render(<ProjectActivity projectId="test-project" />)

    expect(screen.getByText('Loading activities...')).toBeInTheDocument()
  })

  it('should render activities when loaded successfully', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ 
              data: mockActivities, 
              error: null 
            })),
          })),
        })),
      })),
    })

    render(<ProjectActivity projectId="test-project" />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    })

    // Check activity descriptions
    expect(screen.getByText(/created project/i)).toBeInTheDocument()
    expect(screen.getByText(/updated project item/i)).toBeInTheDocument()
  })

  it('should handle user name display correctly', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ 
              data: [
                {
                  ...mockActivities[0],
                  user: {
                    id: 'user-1',
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john@example.com',
                  },
                },
                {
                  ...mockActivities[1],
                  user: {
                    id: 'user-2',
                    first_name: '',
                    last_name: '',
                    email: 'jane@example.com',
                  },
                },
                {
                  ...mockActivities[1],
                  id: '3',
                  user: {
                    id: 'user-3',
                    first_name: null,
                    last_name: null,
                    email: 'unknown@example.com',
                  },
                },
              ], 
              error: null 
            })),
          })),
        })),
      })),
    })

    render(<ProjectActivity projectId="test-project" />)

    await waitFor(() => {
      // Should display full name when available
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      
      // Should display email when no name available
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
      expect(screen.getByText('unknown@example.com')).toBeInTheDocument()
    })
  })

  it('should render empty state when no activities', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    })

    render(<ProjectActivity projectId="test-project" />)

    await waitFor(() => {
      expect(screen.getByText('No activity yet')).toBeInTheDocument()
      expect(screen.getByText(/Activity will appear here/)).toBeInTheDocument()
    })
  })

  it('should handle errors gracefully', async () => {
    const mockError = new Error('Database connection failed')
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ 
              data: null, 
              error: mockError 
            })),
          })),
        })),
      })),
    })

    render(<ProjectActivity projectId="test-project" />)

    await waitFor(() => {
      expect(screen.getByText('Database connection failed')).toBeInTheDocument()
    })
  })

  it('should use correct database query structure', async () => {
    const mockFrom = jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    }))

    const mockSelect = jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    }))

    const mockEq = jest.fn(() => ({
      order: jest.fn(() => ({
        limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    }))

    const mockOrder = jest.fn(() => ({
      limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
    }))

    const mockLimit = jest.fn(() => Promise.resolve({ data: [], error: null }))

    mockSupabaseClient.from = mockFrom
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ order: mockOrder })
    mockOrder.mockReturnValue({ limit: mockLimit })

    render(<ProjectActivity projectId="test-project-id" />)

    await waitFor(() => {
      // Verify correct table name
      expect(mockFrom).toHaveBeenCalledWith('activities')
      
      // Verify correct select with user join using first_name and last_name
      expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('first_name, last_name'))
      expect(mockSelect).toHaveBeenCalledWith(expect.not.stringContaining('full_name'))
      
      // Verify correct project filter
      expect(mockEq).toHaveBeenCalledWith('project_id', 'test-project-id')
      
      // Verify correct ordering
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
      
      // Verify correct limit
      expect(mockLimit).toHaveBeenCalledWith(50)
    })
  })

  it('should format activity types correctly', async () => {
    const activitiesWithDifferentTypes = [
      {
        id: '1',
        action: 'project_created',
        entity_type: 'projects',
        entity_id: 'project-1',
        created_at: '2023-12-01T10:00:00Z',
        user_id: 'user-1',
        user: {
          id: 'user-1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
        },
      },
      {
        id: '2',
        action: 'item_updated',
        entity_type: 'project_items',
        entity_id: 'item-1',
        created_at: '2023-12-01T11:00:00Z',
        user_id: 'user-1',
        user: {
          id: 'user-1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
        },
      },
    ]

    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ 
              data: activitiesWithDifferentTypes, 
              error: null 
            })),
          })),
        })),
      })),
    })

    render(<ProjectActivity projectId="test-project" />)

    await waitFor(() => {
      // Should format entity types correctly
      expect(screen.getByText(/created project/i)).toBeInTheDocument()
      expect(screen.getByText(/updated project item/i)).toBeInTheDocument()
    })
  })

  it('should handle metadata display', async () => {
    const activityWithMetadata = {
      id: '1',
      action: 'project_created',
      entity_type: 'projects',
      entity_id: 'project-1',
      created_at: '2023-12-01T10:00:00Z',
      user_id: 'user-1',
      metadata: { type: 'web', priority: 'high' },
      user: {
        id: 'user-1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
      },
    }

    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ 
              data: [activityWithMetadata], 
              error: null 
            })),
          })),
        })),
      })),
    })

    render(<ProjectActivity projectId="test-project" />)

    await waitFor(() => {
      // Should show metadata details toggle
      expect(screen.getByText('View details')).toBeInTheDocument()
    })
  })

  it('should apply correct styling classes', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ 
              data: mockActivities, 
              error: null 
            })),
          })),
        })),
      })),
    })

    render(<ProjectActivity projectId="test-project" />)

    await waitFor(() => {
      const activityCards = screen.getAllByTestId('card')
      expect(activityCards).toHaveLength(1) // Card container
    })
  })
})