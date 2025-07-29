import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { SecurityDashboard } from '../SecurityDashboard';

// Mock hooks
jest.mock('../../hooks/useSecurityMonitoring', () => ({
  useSecurityMonitoring: () => ({
    loading: false,
    securityMetrics: {
      threatLevel: 'low',
      activeAlerts: 2,
      blockedAttacks: 127,
      lastSecurityScan: '2024-01-15T10:00:00Z',
      vulnerabilities: {
        critical: 0,
        high: 1,
        medium: 3,
        low: 8,
      },
    },
    auditLogs: [
      {
        id: '1',
        action: 'user_login',
        user: 'admin@example.com',
        timestamp: '2024-01-15T10:00:00Z',
        ip: '192.168.1.1',
        status: 'success',
      },
    ],
    refresh: jest.fn(),
  }),
}));

describe('SecurityDashboard', () => {
  it('renders security dashboard with metrics', () => {
    render(<SecurityDashboard />);
    
    expect(screen.getByText('Security Overview')).toBeInTheDocument();
    expect(screen.getByText('Threat Level')).toBeInTheDocument();
    expect(screen.getByText('Active Alerts')).toBeInTheDocument();
    expect(screen.getByText('Blocked Attacks')).toBeInTheDocument();
  });

  it('displays threat level with appropriate styling', () => {
    render(<SecurityDashboard />);
    
    const threatLevel = screen.getByTestId('threat-level-indicator');
    expect(threatLevel).toHaveClass('low');
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('shows vulnerability breakdown', () => {
    render(<SecurityDashboard />);
    
    expect(screen.getByText('0 Critical')).toBeInTheDocument();
    expect(screen.getByText('1 High')).toBeInTheDocument();
    expect(screen.getByText('3 Medium')).toBeInTheDocument();
    expect(screen.getByText('8 Low')).toBeInTheDocument();
  });

  it('displays recent audit logs', () => {
    render(<SecurityDashboard />);
    
    expect(screen.getByText('Recent Security Events')).toBeInTheDocument();
    expect(screen.getByText('user_login')).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    const { container } = render(<SecurityDashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});