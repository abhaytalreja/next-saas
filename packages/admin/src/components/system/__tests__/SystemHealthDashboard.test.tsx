import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { SystemHealthDashboard } from '../SystemHealthDashboard';

// Mock the system health hook
jest.mock('../../hooks/useSystemHealth', () => ({
  useSystemHealth: () => ({
    loading: false,
    healthData: {
      services: {
        database: {
          name: 'Database',
          status: 'healthy',
          responseTime: 45,
          uptime: 99.9,
          lastCheck: '2024-01-15T10:00:00Z',
          incidents: 0,
        },
        api: {
          name: 'API',
          status: 'healthy',
          responseTime: 120,
          uptime: 99.8,
          lastCheck: '2024-01-15T10:00:00Z',
          incidents: 1,
        },
      },
      performance: {
        responseTime: { current: 150, average: 145, history: [] },
        errorRate: { current: 0.1, average: 0.15, history: [] },
      },
      resources: {
        cpu: { current: 45, average: 42, threshold: 80 },
        memory: { current: 62, average: 58, threshold: 85 },
      },
    },
    refresh: jest.fn(),
    toggleAutoRefresh: jest.fn(),
    autoRefresh: true,
  }),
}));

describe('SystemHealthDashboard', () => {
  it('renders system health dashboard', () => {
    render(<SystemHealthDashboard />);
    
    expect(screen.getByText('System Health')).toBeInTheDocument();
    expect(screen.getByText('Monitor system performance and service status')).toBeInTheDocument();
  });

  it('displays service status indicators', () => {
    render(<SystemHealthDashboard />);
    
    expect(screen.getByText('Database')).toBeInTheDocument();
    expect(screen.getByText('API')).toBeInTheDocument();
    expect(screen.getAllByTestId('service-status-healthy')).toHaveLength(2);
  });

  it('shows performance metrics', () => {
    render(<SystemHealthDashboard />);
    
    expect(screen.getByText('Response Time')).toBeInTheDocument();
    expect(screen.getByText('Error Rate')).toBeInTheDocument();
    expect(screen.getByText('150ms')).toBeInTheDocument();
    expect(screen.getByText('0.1%')).toBeInTheDocument();
  });

  it('displays resource usage', () => {
    render(<SystemHealthDashboard />);
    
    expect(screen.getByText('CPU Usage')).toBeInTheDocument();
    expect(screen.getByText('Memory Usage')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('62%')).toBeInTheDocument();
  });

  it('has auto-refresh toggle', async () => {
    const user = userEvent.setup();
    render(<SystemHealthDashboard />);
    
    const autoRefreshToggle = screen.getByTestId('auto-refresh-toggle');
    expect(autoRefreshToggle).toBeInTheDocument();
    expect(autoRefreshToggle).toBeChecked();
    
    await user.click(autoRefreshToggle);
    // Toggle functionality would be tested here
  });

  it('has manual refresh button', async () => {
    const user = userEvent.setup();
    render(<SystemHealthDashboard />);
    
    const refreshButton = screen.getByTestId('refresh-button');
    expect(refreshButton).toBeInTheDocument();
    
    await user.click(refreshButton);
    // Refresh functionality would be tested here
  });

  it('is accessible', async () => {
    const { container } = render(<SystemHealthDashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});