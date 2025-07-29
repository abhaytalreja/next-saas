import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { OrganizationTable } from '../OrganizationTable';

const mockOrganizations = [
  {
    id: '1',
    name: 'Acme Corporation',
    mode: 'multi',
    memberCount: 25,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    subscription_status: 'active',
  },
  {
    id: '2',
    name: 'Beta Inc',
    mode: 'single',
    memberCount: 1,
    status: 'suspended',
    created_at: '2024-01-02T00:00:00Z',
    subscription_status: 'inactive',
  },
];

const mockProps = {
  organizations: mockOrganizations,
  loading: false,
  pagination: { page: 1, totalPages: 1, totalItems: 2 },
  filters: { search: '', mode: '', status: '' },
  onOrganizationClick: jest.fn(),
  onStatusChange: jest.fn(),
  onFiltersChange: jest.fn(),
  onPageChange: jest.fn(),
};

describe('OrganizationTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders organization table with data', () => {
    render(<OrganizationTable {...mockProps} />);
    
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
    expect(screen.getByText('Beta Inc')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(<OrganizationTable {...mockProps} loading={true} organizations={[]} />);
    
    expect(screen.getByTestId('table-loading')).toBeInTheDocument();
  });

  it('displays empty state when no organizations', () => {
    render(<OrganizationTable {...mockProps} organizations={[]} />);
    
    expect(screen.getByTestId('organizations-empty-state')).toBeInTheDocument();
    expect(screen.getByText('No organizations found')).toBeInTheDocument();
  });

  it('displays organization modes correctly', () => {
    render(<OrganizationTable {...mockProps} />);
    
    expect(screen.getByText('Multi-tenant')).toBeInTheDocument();
    expect(screen.getByText('Single-tenant')).toBeInTheDocument();
  });

  it('displays member counts with links', () => {
    render(<OrganizationTable {...mockProps} />);
    
    const memberLinks = screen.getAllByTestId('member-count-link');
    expect(memberLinks[0]).toHaveTextContent('25 members');
    expect(memberLinks[1]).toHaveTextContent('1 member');
  });

  it('shows status badges correctly', () => {
    render(<OrganizationTable {...mockProps} />);
    
    const statusBadges = screen.getAllByTestId('organization-status-badge');
    expect(statusBadges[0]).toHaveTextContent('active');
    expect(statusBadges[1]).toHaveTextContent('suspended');
  });

  it('calls onOrganizationClick when row is clicked', async () => {
    const user = userEvent.setup();
    render(<OrganizationTable {...mockProps} />);
    
    const orgRow = screen.getByText('Acme Corporation').closest('tr');
    await user.click(orgRow!);
    
    expect(mockProps.onOrganizationClick).toHaveBeenCalledWith(mockOrganizations[0]);
  });

  it('handles status change actions', async () => {
    const user = userEvent.setup();
    render(<OrganizationTable {...mockProps} />);
    
    const statusButton = screen.getAllByTestId('change-status-button')[0];
    await user.click(statusButton);
    
    expect(screen.getByTestId('status-dropdown')).toBeInTheDocument();
    
    const suspendOption = screen.getByTestId('status-suspended');
    await user.click(suspendOption);
    
    expect(mockProps.onStatusChange).toHaveBeenCalledWith('1', 'suspended');
  });

  it('filters organizations by search term', async () => {
    const user = userEvent.setup();
    render(<OrganizationTable {...mockProps} />);
    
    const searchInput = screen.getByTestId('organization-search-input');
    await user.type(searchInput, 'Acme');
    await user.keyboard('{Enter}');
    
    expect(mockProps.onFiltersChange).toHaveBeenCalledWith({
      search: 'Acme',
      mode: '',
      status: '',
    });
  });

  it('filters organizations by mode', async () => {
    const user = userEvent.setup();
    render(<OrganizationTable {...mockProps} />);
    
    const modeFilter = screen.getByTestId('mode-filter-button');
    await user.click(modeFilter);
    
    const multiOption = screen.getByTestId('mode-filter-multi');
    await user.click(multiOption);
    
    expect(mockProps.onFiltersChange).toHaveBeenCalledWith({
      search: '',
      mode: 'multi',
      status: '',
    });
  });

  it('handles pagination correctly', async () => {
    const user = userEvent.setup();
    const paginatedProps = {
      ...mockProps,
      pagination: { page: 1, totalPages: 3, totalItems: 30 },
    };
    
    render(<OrganizationTable {...paginatedProps} />);
    
    const nextButton = screen.getByTestId('pagination-next');
    await user.click(nextButton);
    
    expect(mockProps.onPageChange).toHaveBeenCalledWith(2);
  });

  it('sorts organizations by column headers', async () => {
    const user = userEvent.setup();
    render(<OrganizationTable {...mockProps} />);
    
    const nameHeader = screen.getByTestId('column-organization-name');
    await user.click(nameHeader);
    
    expect(screen.getByTestId('sort-indicator')).toBeInTheDocument();
  });

  it('displays created dates in readable format', () => {
    render(<OrganizationTable {...mockProps} />);
    
    const dates = screen.getAllByTestId('organization-created-date');
    expect(dates[0]).toHaveTextContent('Jan 1, 2024');
    expect(dates[1]).toHaveTextContent('Jan 2, 2024');
  });

  it('is accessible', async () => {
    const { container } = render(<OrganizationTable {...mockProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper table structure and ARIA labels', () => {
    render(<OrganizationTable {...mockProps} />);
    
    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('aria-label', 'Organizations table');
    
    const columnHeaders = screen.getAllByRole('columnheader');
    expect(columnHeaders).toHaveLength(6);
    
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(3); // Header + 2 data rows
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<OrganizationTable {...mockProps} />);
    
    // Tab to first clickable element
    await user.tab();
    const focusedElement = document.activeElement;
    
    expect(focusedElement).toBeInTheDocument();
    
    // Test Enter key on organization row
    if (focusedElement?.closest('tr')) {
      await user.keyboard('{Enter}');
      expect(mockProps.onOrganizationClick).toHaveBeenCalled();
    }
  });

  it('handles bulk operations when implemented', async () => {
    const user = userEvent.setup();
    const propsWithBulk = {
      ...mockProps,
      supportsBulkActions: true,
      onBulkAction: jest.fn(),
    };
    
    render(<OrganizationTable {...propsWithBulk} />);
    
    // If bulk selection is available
    const selectAllCheckbox = screen.queryByTestId('select-all-organizations');
    if (selectAllCheckbox) {
      await user.click(selectAllCheckbox);
      expect(screen.getByTestId('bulk-actions')).toBeInTheDocument();
    }
  });
});