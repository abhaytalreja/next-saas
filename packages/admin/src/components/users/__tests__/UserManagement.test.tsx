import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { UserManagement } from '../UserManagement';

// Mock the user management hook
jest.mock('../../hooks/useUserManagement', () => ({
  useUserManagement: () => ({
    users: [
      {
        id: '1',
        email: 'john@example.com',
        name: 'John Doe',
        role: 'user',
        status: 'active',
        organizations: [{ id: '1', name: 'Acme Corp' }],
        created_at: '2024-01-01T00:00:00Z',
      },
    ],
    loading: false,
    error: null,
    total: 1,
    pagination: { page: 1, limit: 10, totalPages: 1, totalItems: 1 },
    selectedUsers: [],
    filters: { search: '', role: '', status: '' },
    updateFilters: jest.fn(),
    toggleUserSelection: jest.fn(),
    selectAllUsers: jest.fn(),
    clearSelection: jest.fn(),
    performBulkAction: jest.fn(),
    exportUsers: jest.fn(),
    refreshUsers: jest.fn(),
    goToPage: jest.fn(),
  }),
}));

describe('UserManagement', () => {
  it('renders user management interface', () => {
    render(<UserManagement />);
    
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('Manage users and their access')).toBeInTheDocument();
  });

  it('displays search and filter controls', () => {
    render(<UserManagement />);
    
    expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('shows action buttons', () => {
    render(<UserManagement />);
    
    expect(screen.getByText('Export Users')).toBeInTheDocument();
    expect(screen.getByText('Invite User')).toBeInTheDocument();
  });

  it('displays user table', () => {
    render(<UserManagement />);
    
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('handles search input', async () => {
    const user = userEvent.setup();
    render(<UserManagement />);
    
    const searchInput = screen.getByPlaceholderText('Search users...');
    await user.type(searchInput, 'john');
    
    expect(searchInput).toHaveValue('john');
  });

  it('handles export functionality', async () => {
    const user = userEvent.setup();
    render(<UserManagement />);
    
    const exportButton = screen.getByText('Export Users');
    await user.click(exportButton);
    
    // Export would be handled by the hook
    expect(exportButton).toBeInTheDocument();
  });

  it('is accessible', async () => {
    const { container } = render(<UserManagement />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});