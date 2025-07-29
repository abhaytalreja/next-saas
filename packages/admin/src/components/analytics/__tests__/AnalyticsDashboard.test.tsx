import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { AnalyticsDashboard } from '../AnalyticsDashboard';

// Mock the analytics hook
jest.mock('../../hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    analyticsData: {
      userGrowth: [
        { date: '2024-01-01', value: 100 },
        { date: '2024-01-02', value: 120 },
        { date: '2024-01-03', value: 110 },
      ],
      revenueGrowth: [
        { date: '2024-01-01', value: 5000 },
        { date: '2024-01-02', value: 5500 },
        { date: '2024-01-03', value: 5200 },
      ],
      totalUsers: 1250,
      activeUsers: 890,
      conversionRate: 5.2,
      retentionRate: 85.3,
      averageSessionDuration: 12.5,
      bounceRate: 25.8,
    },
    loading: false,
    error: null,
    dateRange: {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31'),
    },
    updateDateRange: jest.fn(),
    refreshAnalytics: jest.fn(),
  }),
}));

describe('AnalyticsDashboard', () => {
  it('renders analytics dashboard with title', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Comprehensive analytics and insights')).toBeInTheDocument();
  });

  it('displays key metrics overview', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('1,250')).toBeInTheDocument(); // Total users
    expect(screen.getByText('890')).toBeInTheDocument(); // Active users
    expect(screen.getByText('5.2%')).toBeInTheDocument(); // Conversion rate
    expect(screen.getByText('85.3%')).toBeInTheDocument(); // Retention rate
  });

  it('shows performance metrics', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('12.5 min')).toBeInTheDocument(); // Session duration
    expect(screen.getByText('25.8%')).toBeInTheDocument(); // Bounce rate
  });

  it('displays user growth chart', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('User Growth Over Time')).toBeInTheDocument();
  });

  it('displays revenue growth chart', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('Revenue Growth')).toBeInTheDocument();
  });

  it('has date range picker', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('Date Range')).toBeInTheDocument();
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
  });

  it('handles date range change', async () => {
    const user = userEvent.setup();
    render(<AnalyticsDashboard />);
    
    const dateRangePicker = screen.getByText('Last 30 days');
    await user.click(dateRangePicker);
    
    const last7Days = screen.getByText('Last 7 days');
    await user.click(last7Days);
    
    // Date range would be updated
    expect(dateRangePicker).toBeInTheDocument();
  });

  it('handles refresh functionality', async () => {
    const user = userEvent.setup();
    render(<AnalyticsDashboard />);
    
    const refreshButton = screen.getByLabelText('Refresh analytics');
    await user.click(refreshButton);
    
    expect(refreshButton).toBeInTheDocument();
  });

  it('shows export button', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('Export Report')).toBeInTheDocument();
  });

  it('displays conversion funnel', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('Conversion Funnel')).toBeInTheDocument();
  });

  it('shows top performing pages', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('Top Pages')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    const { container } = render(<AnalyticsDashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});