import { renderHook, waitFor } from '@testing-library/react';
import { useUserManagement } from '../useUserManagement';

// Mock the API calls
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const mockUsers = [
  {
    id: '1',
    email: 'john@example.com',
    name: 'John Doe',
    role: 'user',
    status: 'active',
    organizations: [{ id: '1', name: 'Acme Corp' }],
  },
  {
    id: '2',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    status: 'active',
    organizations: [{ id: '1', name: 'Acme Corp' }],
  },
];

describe('useUserManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  it('fetches users successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: mockUsers,
        pagination: { page: 1, totalPages: 1, totalItems: 2 },
      }),
    } as Response);

    const { result } = renderHook(() => useUserManagement());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toEqual(mockUsers);
    expect(result.current.pagination).toEqual({
      page: 1,
      totalPages: 1,
      totalItems: 2,
    });
    expect(result.current.error).toBeNull();
  });

  it('handles API errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useUserManagement());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch users');
    expect(result.current.users).toEqual([]);
  });

  it('updates filters and refetches data', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockUsers, pagination: {} }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockUsers[0]], pagination: {} }),
      } as Response);

    const { result } = renderHook(() => useUserManagement());

    await waitFor(() => {
      expect(result.current.users).toEqual(mockUsers);
    });

    // Update filters
    result.current.updateFilters({ search: 'john', role: '', status: '' });

    expect(result.current.filters.search).toBe('john');

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  it('handles pagination changes', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockUsers, pagination: { page: 1 } }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockUsers[1]], pagination: { page: 2 } }),
      } as Response);

    const { result } = renderHook(() => useUserManagement());

    await waitFor(() => {
      expect(result.current.users).toEqual(mockUsers);
    });

    // Change page
    result.current.goToPage(2);

    await waitFor(() => {
      expect(result.current.pagination.page).toBe(2);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  it('handles user selection', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockUsers, pagination: {} }),
    } as Response);

    const { result } = renderHook(() => useUserManagement());

    await waitFor(() => {
      expect(result.current.users).toEqual(mockUsers);
    });

    // Select user
    result.current.toggleUserSelection('1');
    expect(result.current.selectedUsers).toContain('1');

    // Deselect user
    result.current.toggleUserSelection('1');
    expect(result.current.selectedUsers).not.toContain('1');
  });

  it('handles select all functionality', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockUsers, pagination: {} }),
    } as Response);

    const { result } = renderHook(() => useUserManagement());

    await waitFor(() => {
      expect(result.current.users).toEqual(mockUsers);
    });

    // Select all users
    result.current.selectAllUsers();
    expect(result.current.selectedUsers).toEqual(['1', '2']);

    // Clear selection
    result.current.clearSelection();
    expect(result.current.selectedUsers).toEqual([]);
  });

  it('performs bulk actions on selected users', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockUsers, pagination: {} }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockUsers, pagination: {} }),
      } as Response);

    const { result } = renderHook(() => useUserManagement());

    await waitFor(() => {
      expect(result.current.users).toEqual(mockUsers);
    });

    // Select users and perform bulk action
    result.current.toggleUserSelection('1');
    result.current.toggleUserSelection('2');

    await result.current.performBulkAction('suspend');

    expect(mockFetch).toHaveBeenCalledWith('/api/admin/users/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'suspend',
        userIds: ['1', '2'],
      }),
    });

    // Should refetch data after bulk action
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  it('exports selected users', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockUsers, pagination: {} }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(['csv data'], { type: 'text/csv' }),
      } as Response);

    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => 'mocked-url');
    global.URL.revokeObjectURL = jest.fn();

    // Mock document.createElement and click
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn(),
    };
    jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    jest.spyOn(document.body, 'appendChild').mockImplementation();
    jest.spyOn(document.body, 'removeChild').mockImplementation();

    const { result } = renderHook(() => useUserManagement());

    await waitFor(() => {
      expect(result.current.users).toEqual(mockUsers);
    });

    // Select users and export
    result.current.toggleUserSelection('1');
    await result.current.exportUsers();

    expect(mockFetch).toHaveBeenCalledWith('/api/admin/users/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds: ['1'] }),
    });

    expect(mockLink.click).toHaveBeenCalled();
  });

  it('refreshes user data', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockUsers, pagination: {} }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockUsers, pagination: {} }),
      } as Response);

    const { result } = renderHook(() => useUserManagement());

    await waitFor(() => {
      expect(result.current.users).toEqual(mockUsers);
    });

    // Refresh data
    await result.current.refreshUsers();

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('handles network errors during bulk actions', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockUsers, pagination: {} }),
      } as Response)
      .mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useUserManagement());

    await waitFor(() => {
      expect(result.current.users).toEqual(mockUsers);
    });

    result.current.toggleUserSelection('1');
    
    try {
      await result.current.performBulkAction('suspend');
    } catch (error) {
      expect(error).toBeDefined();
    }

    expect(result.current.error).toBe('Failed to perform bulk action');
  });
});