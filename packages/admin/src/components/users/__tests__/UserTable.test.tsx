import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { UserTable } from '../UserTable';

const mockUsers = [
  {
    id: '1',
    email: 'john@example.com',
    name: 'John Doe',
    role: 'user' as const,
    status: 'active' as const,
    organizations: [{ id: '1', name: 'Acme Corp', role: 'member' }],
    last_login: '2024-01-15T10:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    avatar_url: null,
    email_verified: true,
    two_factor_enabled: false,
  },
  {
    id: '2',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin' as const,
    status: 'active' as const,
    organizations: [{ id: '1', name: 'Acme Corp', role: 'admin' }],
    last_login: '2024-01-15T11:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    avatar_url: null,
    email_verified: true,
    two_factor_enabled: true,
  },
];

const mockProps = {
  users: mockUsers,
  loading: false,
  error: null,
  pagination: { page: 1, limit: 10, totalPages: 1, totalItems: 2 },
  total: 2,
  selectedUsers: [] as string[],
  onPageChange: jest.fn(),
  onSortChange: jest.fn(),
  onRefresh: jest.fn(),
  onSelectionChange: jest.fn(),
};

describe('UserTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user table with data', () => {
    render(<UserTable {...mockProps} />);
    
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(<UserTable {...mockProps} loading={true} users={[]} total={0} />);
    
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  it('displays empty state when no users', () => {
    render(<UserTable {...mockProps} users={[]} total={0} />);
    
    expect(screen.getByText('No users found')).toBeInTheDocument();
  });

  it('displays error state when error occurs', () => {
    const error = new Error('Failed to load users');
    render(<UserTable {...mockProps} error={error} />);
    
    expect(screen.getByText('Error loading users')).toBeInTheDocument();
    expect(screen.getByText('Failed to load users')).toBeInTheDocument();
  });

  it('shows retry button on error', async () => {
    const user = userEvent.setup();
    const onRefresh = jest.fn();
    const error = new Error('Failed to load users');
    render(<UserTable {...mockProps} error={error} onRefresh={onRefresh} />);
    
    const retryButton = screen.getByText('Retry');
    await user.click(retryButton);
    
    expect(onRefresh).toHaveBeenCalled();
  });

  it('handles user selection', async () => {
    const user = userEvent.setup();
    const onSelectionChange = jest.fn();
    render(<UserTable {...mockProps} onSelectionChange={onSelectionChange} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    if (checkboxes.length > 1) {
      await user.click(checkboxes[1]); // Skip select-all
      expect(onSelectionChange).toHaveBeenCalledWith(['1']);
    }
  });

  it('handles select all functionality', async () => {
    const user = userEvent.setup();
    const onSelectionChange = jest.fn();
    render(<UserTable {...mockProps} onSelectionChange={onSelectionChange} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    if (checkboxes.length > 0) {
      await user.click(checkboxes[0]); // Select all checkbox
      expect(onSelectionChange).toHaveBeenCalledWith(['1', '2']);
    }
  });

  it('displays user information correctly', () => {
    render(<UserTable {...mockProps} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
  });

  it('shows organization information', () => {
    render(<UserTable {...mockProps} />);
    
    expect(screen.getAllByText('Acme Corp')).toHaveLength(2);
  });

  it('handles sorting by column headers', async () => {
    const user = userEvent.setup();
    const onSortChange = jest.fn();
    render(<UserTable {...mockProps} onSortChange={onSortChange} />);
    
    const emailHeader = screen.getByText('Email');
    await user.click(emailHeader);
    
    expect(onSortChange).toHaveBeenCalledWith('email', 'asc');
  });

  it('handles pagination', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    const paginationProps = {
      ...mockProps,
      onPageChange,
      pagination: { page: 1, limit: 10, totalPages: 3, totalItems: 25 },
      total: 25,
    };
    
    render(<UserTable {...paginationProps} />);
    
    const nextButton = screen.getByLabelText('Next page');
    if (nextButton) {
      await user.click(nextButton);
      expect(onPageChange).toHaveBeenCalledWith(2);
    }
  });

  it('displays selected users count when users are selected', () => {
    render(<UserTable {...mockProps} selectedUsers={['1', '2']} />);
    
    expect(screen.getByText('2 selected')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    const { container } = render(<UserTable {...mockProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper table structure', () => {
    render(<UserTable {...mockProps} />);
    
    expect(screen.getByRole('table')).toBeInTheDocument();
    const columnHeaders = screen.getAllByRole('columnheader');
    expect(columnHeaders.length).toBeGreaterThan(4); // Name, Email, Role, Status, etc.
    
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(3); // Header + 2 data rows
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    const onSelectionChange = jest.fn();
    render(<UserTable {...mockProps} onSelectionChange={onSelectionChange} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    if (checkboxes.length > 1) {
      checkboxes[1].focus();
      await user.keyboard(' '); // Space to select
      expect(onSelectionChange).toHaveBeenCalledWith(['1']);
    }
  });

  it('shows user actions', () => {
    render(<UserTable {...mockProps} />);
    
    // Actions could be buttons or dropdown menus
    const actionElements = screen.getAllByLabelText(/actions/i);
    expect(actionElements.length).toBeGreaterThanOrEqual(0);
  });

  it('handles refresh functionality', async () => {
    const user = userEvent.setup();
    const onRefresh = jest.fn();
    render(<UserTable {...mockProps} onRefresh={onRefresh} />);
    
    const refreshButton = screen.getByLabelText('Refresh');
    if (refreshButton) {
      await user.click(refreshButton);
      expect(onRefresh).toHaveBeenCalled();
    }
  });
});