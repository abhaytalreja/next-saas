import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { UserDetails } from '../UserDetails';

const mockUser = {
  id: '1',
  email: 'john@example.com',
  name: 'John Doe',
  role: 'user' as const,
  status: 'active' as const,
  avatar_url: null,
  organizations: [{ id: '1', name: 'Acme Corp', role: 'member' }],
  last_login: '2024-01-15T10:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  email_verified: true,
  two_factor_enabled: false,
  login_count: 42,
  last_ip: '192.168.1.1',
};

const mockProps = {
  user: mockUser,
  loading: false,
  error: null,
  onStatusChange: jest.fn(),
  onRoleChange: jest.fn(),
  onDelete: jest.fn(),
  onClose: jest.fn(),
};

describe('UserDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user details correctly', () => {
    render(<UserDetails {...mockProps} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('displays user statistics', () => {
    render(<UserDetails {...mockProps} />);
    
    expect(screen.getByText('42')).toBeInTheDocument(); // Login count
    expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument(); // Created date
    expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument(); // Last login
  });

  it('shows organization memberships', () => {
    render(<UserDetails {...mockProps} />);
    
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('member')).toBeInTheDocument();
  });

  it('displays security information', () => {
    render(<UserDetails {...mockProps} />);
    
    expect(screen.getByText('Email Verified')).toBeInTheDocument();
    expect(screen.getByText('2FA Disabled')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<UserDetails {...mockProps} loading={true} user={null} />);
    
    expect(screen.getByText('Loading user details...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    const error = new Error('Failed to load user');
    render(<UserDetails {...mockProps} error={error} user={null} />);
    
    expect(screen.getByText('Error loading user')).toBeInTheDocument();
    expect(screen.getByText('Failed to load user')).toBeInTheDocument();
  });

  it('handles status change', async () => {
    const user = userEvent.setup();
    const onStatusChange = jest.fn();
    render(<UserDetails {...mockProps} onStatusChange={onStatusChange} />);
    
    const statusButton = screen.getByText('Change Status');
    await user.click(statusButton);
    
    const suspendOption = screen.getByText('Suspend');
    await user.click(suspendOption);
    
    expect(onStatusChange).toHaveBeenCalledWith('1', 'suspended');
  });

  it('handles role change', async () => {
    const user = userEvent.setup();
    const onRoleChange = jest.fn();
    render(<UserDetails {...mockProps} onRoleChange={onRoleChange} />);
    
    const roleButton = screen.getByText('Change Role');
    await user.click(roleButton);
    
    const adminOption = screen.getByText('Admin');
    await user.click(adminOption);
    
    expect(onRoleChange).toHaveBeenCalledWith('1', 'admin');
  });

  it('handles delete user', async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();
    render(<UserDetails {...mockProps} onDelete={onDelete} />);
    
    const deleteButton = screen.getByText('Delete User');
    await user.click(deleteButton);
    
    // Confirm deletion in modal
    const confirmButton = screen.getByText('Confirm Delete');
    await user.click(confirmButton);
    
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('handles close modal', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<UserDetails {...mockProps} onClose={onClose} />);
    
    const closeButton = screen.getByLabelText('Close');
    await user.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('is accessible', async () => {
    const { container } = render(<UserDetails {...mockProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});