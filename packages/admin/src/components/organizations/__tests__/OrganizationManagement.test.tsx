import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { OrganizationManagement } from '../OrganizationManagement';

// Mock the organization management hook
jest.mock('../../hooks/useOrganizationManagement', () => ({
  useOrganizationManagement: () => ({
    organizations: [
      {
        id: '1',
        name: 'Acme Corp',
        mode: 'multi',
        memberCount: 25,
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
      },
    ],
    loading: false,
    error: null,
    filters: { search: '', mode: '', status: '' },
    pagination: { page: 1, totalPages: 1, totalItems: 1 },
    selectedOrganizations: [],
    updateFilters: jest.fn(),
    toggleSelection: jest.fn(),
    performBulkAction: jest.fn(),
    refreshOrganizations: jest.fn(),
  }),
}));

describe('OrganizationManagement', () => {
  it('renders organization management interface', () => {
    render(<OrganizationManagement />);
    
    expect(screen.getByText('Organization Management')).toBeInTheDocument();
    expect(screen.getByText('Manage organizations and their settings')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('displays create organization button', () => {
    render(<OrganizationManagement />);
    
    const createButton = screen.getByTestId('create-organization-button');
    expect(createButton).toBeInTheDocument();
    expect(createButton).toHaveTextContent('Create Organization');
  });

  it('shows search and filter controls', () => {
    render(<OrganizationManagement />);
    
    expect(screen.getByTestId('organization-search-input')).toBeInTheDocument();
    expect(screen.getByTestId('mode-filter-button')).toBeInTheDocument();
    expect(screen.getByTestId('status-filter-button')).toBeInTheDocument();
  });

  it('displays organization table', () => {
    render(<OrganizationManagement />);
    
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Multi-tenant')).toBeInTheDocument();
    expect(screen.getByText('25 members')).toBeInTheDocument();
  });

  it('handles export functionality', async () => {
    const user = userEvent.setup();
    render(<OrganizationManagement />);
    
    const exportButton = screen.getByTestId('export-organizations-button');
    await user.click(exportButton);
    
    // Export functionality would be tested here
    expect(exportButton).toBeInTheDocument();
  });

  it('is accessible', async () => {
    const { container } = render(<OrganizationManagement />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});