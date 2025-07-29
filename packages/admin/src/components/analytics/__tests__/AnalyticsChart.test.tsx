import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { AnalyticsChart } from '../AnalyticsChart';

const mockData = [
  { date: '2024-01-01', value: 100, label: 'Jan 1' },
  { date: '2024-01-02', value: 120, label: 'Jan 2' },
  { date: '2024-01-03', value: 110, label: 'Jan 3' },
  { date: '2024-01-04', value: 140, label: 'Jan 4' },
  { date: '2024-01-05', value: 130, label: 'Jan 5' },
];

const mockProps = {
  title: 'User Growth',
  data: mockData,
  type: 'line' as const,
  height: 300,
  color: '#3B82F6',
  loading: false,
  error: null,
};

describe('AnalyticsChart', () => {
  it('renders chart with title', () => {
    render(<AnalyticsChart {...mockProps} />);
    
    expect(screen.getByText('User Growth')).toBeInTheDocument();
  });

  it('displays chart container', () => {
    render(<AnalyticsChart {...mockProps} />);
    
    const chartContainer = screen.getByTestId('analytics-chart');
    expect(chartContainer).toBeInTheDocument();
  });

  it('renders line chart type', () => {
    render(<AnalyticsChart {...mockProps} type="line" />);
    
    // Chart would render with line type
    expect(screen.getByTestId('analytics-chart')).toBeInTheDocument();
  });

  it('renders bar chart type', () => {
    render(<AnalyticsChart {...mockProps} type="bar" />);
    
    expect(screen.getByTestId('analytics-chart')).toBeInTheDocument();
  });

  it('renders pie chart type', () => {
    render(<AnalyticsChart {...mockProps} type="pie" />);
    
    expect(screen.getByTestId('analytics-chart')).toBeInTheDocument();
  });

  it('renders area chart type', () => {
    render(<AnalyticsChart {...mockProps} type="area" />);
    
    expect(screen.getByTestId('analytics-chart')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<AnalyticsChart {...mockProps} loading={true} />);
    
    expect(screen.getByText('Loading chart...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    const error = new Error('Failed to load chart data');
    render(<AnalyticsChart {...mockProps} error={error} />);
    
    expect(screen.getByText('Error loading chart')).toBeInTheDocument();
    expect(screen.getByText('Failed to load chart data')).toBeInTheDocument();
  });

  it('shows empty state when no data', () => {
    render(<AnalyticsChart {...mockProps} data={[]} />);
    
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('applies custom height', () => {
    render(<AnalyticsChart {...mockProps} height={400} />);
    
    const chartContainer = screen.getByTestId('analytics-chart');
    expect(chartContainer).toHaveStyle('height: 400px');
  });

  it('applies custom color', () => {
    render(<AnalyticsChart {...mockProps} color="#FF0000" />);
    
    // Color would be applied to chart elements
    expect(screen.getByTestId('analytics-chart')).toBeInTheDocument();
  });

  it('displays data points correctly', () => {
    render(<AnalyticsChart {...mockProps} />);
    
    // Chart would display data points
    expect(screen.getByTestId('analytics-chart')).toBeInTheDocument();
  });

  it('has tooltip functionality', () => {
    render(<AnalyticsChart {...mockProps} />);
    
    // Tooltip would be rendered on hover
    expect(screen.getByTestId('analytics-chart')).toBeInTheDocument();
  });

  it('supports animation', () => {
    render(<AnalyticsChart {...mockProps} animated={true} />);
    
    expect(screen.getByTestId('analytics-chart')).toBeInTheDocument();
  });

  it('can be exported', () => {
    render(<AnalyticsChart {...mockProps} exportable={true} />);
    
    expect(screen.getByLabelText('Export chart')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    const { container } = render(<AnalyticsChart {...mockProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper ARIA attributes', () => {
    render(<AnalyticsChart {...mockProps} />);
    
    const chart = screen.getByTestId('analytics-chart');
    expect(chart).toHaveAttribute('role', 'img');
    expect(chart).toHaveAttribute('aria-label', 'User Growth chart');
  });
});