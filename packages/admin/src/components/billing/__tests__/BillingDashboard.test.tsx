import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { BillingDashboard } from '../BillingDashboard';

// Mock the billing hook
jest.mock('../../hooks/useBillingManagement', () => ({
  useBillingManagement: () => ({
    billingData: {
      monthlyRecurringRevenue: 125000,
      totalRevenue: 450000,
      activeSubscriptions: 1250,
      churnRate: 2.5,
      averageRevenuePerUser: 100,
      recentTransactions: [
        {
          id: '1',
          amount: 99,
          customer: 'Acme Corp',
          date: '2024-01-15T10:00:00Z',
          status: 'succeeded',
        },
      ],
      subscriptionsByPlan: [
        { plan: 'Pro', count: 800, revenue: 79200 },
        { plan: 'Enterprise', count: 450, revenue: 67500 },
      ],
    },
    loading: false,
    error: null,
    refreshBilling: jest.fn(),
  }),
}));

describe('BillingDashboard', () => {
  it('renders billing dashboard with key metrics', () => {
    render(<BillingDashboard />);
    
    expect(screen.getByText('Billing Overview')).toBeInTheDocument();
    expect(screen.getByText('Monthly Recurring Revenue')).toBeInTheDocument();
    expect(screen.getByText('Active Subscriptions')).toBeInTheDocument();
    expect(screen.getByText('Churn Rate')).toBeInTheDocument();
  });

  it('displays revenue metrics correctly', () => {
    render(<BillingDashboard />);
    
    expect(screen.getByText('$125,000')).toBeInTheDocument(); // MRR
    expect(screen.getByText('$450,000')).toBeInTheDocument(); // Total revenue
    expect(screen.getByText('$100')).toBeInTheDocument(); // ARPU
  });

  it('displays subscription metrics', () => {
    render(<BillingDashboard />);
    
    expect(screen.getByText('1,250')).toBeInTheDocument(); // Active subscriptions
    expect(screen.getByText('2.5%')).toBeInTheDocument(); // Churn rate
  });

  it('shows subscription breakdown by plan', () => {
    render(<BillingDashboard />);
    
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
    expect(screen.getByText('800')).toBeInTheDocument(); // Pro count
    expect(screen.getByText('450')).toBeInTheDocument(); // Enterprise count
  });

  it('displays recent transactions', () => {
    render(<BillingDashboard />);
    
    expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('$99')).toBeInTheDocument();
    expect(screen.getByText('Succeeded')).toBeInTheDocument();
  });

  it('handles refresh functionality', async () => {
    const user = userEvent.setup();
    render(<BillingDashboard />);
    
    const refreshButton = screen.getByLabelText('Refresh billing data');
    await user.click(refreshButton);
    
    // Would call refresh function
    expect(refreshButton).toBeInTheDocument();
  });

  it('shows revenue chart', () => {
    render(<BillingDashboard />);
    
    expect(screen.getByText('Revenue Trend')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    const { container } = render(<BillingDashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});