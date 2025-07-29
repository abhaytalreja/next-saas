import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { StatsCard } from '../StatsCard';
import { TrendingUp, TrendingDown, Users } from 'lucide-react';

describe('StatsCard', () => {
  const defaultProps = {
    title: 'Total Users',
    value: 1234,
    change: 12.5,
    trend: 'up' as const,
    icon: Users,
  };

  it('renders stat card with all information', () => {
    render(<StatsCard {...defaultProps} />);
    
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('12.5%')).toBeInTheDocument();
  });

  it('renders with up trend styling', () => {
    render(<StatsCard {...defaultProps} trend="up" />);
    
    const changeContainer = screen.getByText('12.5%').closest('div');
    expect(changeContainer).toHaveClass('text-green-600');
  });

  it('renders with down trend styling', () => {
    render(<StatsCard {...defaultProps} trend="down" change={5.2} />);
    
    const changeContainer = screen.getByText('5.2%').closest('div');
    expect(changeContainer).toHaveClass('text-red-600');
  });

  it('renders with stable trend styling', () => {
    render(<StatsCard {...defaultProps} trend="stable" change={0} />);
    
    const changeContainer = screen.getByText('0%').closest('div');
    expect(changeContainer).toHaveClass('text-gray-600');
  });

  it('renders icon correctly', () => {
    render(<StatsCard {...defaultProps} />);
    
    // Icon is rendered but doesn't have a test id, check for SVG element
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('handles large numbers correctly', () => {
    render(<StatsCard {...defaultProps} value={1234567} />);
    
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('formats currency values correctly', () => {
    render(<StatsCard {...defaultProps} value={1234.56} format="currency" />);
    
    expect(screen.getByText('$1,234.56')).toBeInTheDocument();
  });

  it('formats percentage values correctly', () => {
    render(<StatsCard {...defaultProps} value={85.5} format="percentage" />);
    
    expect(screen.getByText('85.5%')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<StatsCard {...defaultProps} loading={true} />);
    
    const loadingCard = document.querySelector('.animate-pulse');
    expect(loadingCard).toBeInTheDocument();
  });

  it('shows real-time indicator when enabled', () => {
    render(<StatsCard {...defaultProps} realTime={true} />);
    
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('renders without change value', () => {
    const propsWithoutChange = { ...defaultProps };
    delete propsWithoutChange.change;
    
    render(<StatsCard {...propsWithoutChange} />);
    
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.queryByText('%')).not.toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<StatsCard {...defaultProps} description="Active users in the last 30 days" />);
    
    expect(screen.getByText('Active users in the last 30 days')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    const { container } = render(<StatsCard {...defaultProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper semantic structure', () => {
    render(<StatsCard {...defaultProps} />);
    
    // Check for semantic elements
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    
    // Card should be contained in a div
    const cardContainer = screen.getByText('Total Users').closest('div');
    expect(cardContainer).toBeInTheDocument();
  });
});