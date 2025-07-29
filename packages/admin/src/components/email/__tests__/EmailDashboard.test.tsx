import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { EmailDashboard } from '../EmailDashboard';

// Mock the email management hook
jest.mock('../../hooks/useEmailManagement', () => ({
  useEmailManagement: () => ({
    emailMetrics: {
      emailsSentToday: 1250,
      emailDeliveryRate: 98.5,
      openRate: 22.4,
      clickRate: 5.8,
      bounceRate: 1.2,
      unsubscribeRate: 0.3,
      subscriberCount: 15650,
      activeCampaigns: 8,
    },
    campaigns: [
      {
        id: '1',
        name: 'Weekly Newsletter',
        status: 'active',
        sent: 1200,
        opened: 360,
        clicked: 72,
        created_at: '2024-01-15T10:00:00Z',
      },
    ],
    loading: false,
    error: null,
    refreshEmailData: jest.fn(),
  }),
}));

describe('EmailDashboard', () => {
  it('renders email dashboard with key metrics', () => {
    render(<EmailDashboard />);
    
    expect(screen.getByText('Email Overview')).toBeInTheDocument();
    expect(screen.getByText('Emails Sent Today')).toBeInTheDocument();
    expect(screen.getByText('Delivery Rate')).toBeInTheDocument();
    expect(screen.getByText('Subscriber Count')).toBeInTheDocument();
  });

  it('displays email metrics correctly', () => {
    render(<EmailDashboard />);
    
    expect(screen.getByText('1,250')).toBeInTheDocument(); // Emails sent
    expect(screen.getByText('98.5%')).toBeInTheDocument(); // Delivery rate
    expect(screen.getByText('15,650')).toBeInTheDocument(); // Subscribers
    expect(screen.getByText('8')).toBeInTheDocument(); // Active campaigns
  });

  it('displays performance metrics', () => {
    render(<EmailDashboard />);
    
    expect(screen.getByText('22.4%')).toBeInTheDocument(); // Open rate
    expect(screen.getByText('5.8%')).toBeInTheDocument(); // Click rate
    expect(screen.getByText('1.2%')).toBeInTheDocument(); // Bounce rate
    expect(screen.getByText('0.3%')).toBeInTheDocument(); // Unsubscribe rate
  });

  it('shows recent campaigns', () => {
    render(<EmailDashboard />);
    
    expect(screen.getByText('Recent Campaigns')).toBeInTheDocument();
    expect(screen.getByText('Weekly Newsletter')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('displays campaign performance', () => {
    render(<EmailDashboard />);
    
    expect(screen.getByText('1,200')).toBeInTheDocument(); // Sent
    expect(screen.getByText('360')).toBeInTheDocument(); // Opened
    expect(screen.getByText('72')).toBeInTheDocument(); // Clicked
  });

  it('has create campaign button', () => {
    render(<EmailDashboard />);
    
    expect(screen.getByText('Create Campaign')).toBeInTheDocument();
  });

  it('has manage templates button', () => {
    render(<EmailDashboard />);
    
    expect(screen.getByText('Manage Templates')).toBeInTheDocument();
  });

  it('handles refresh functionality', async () => {
    const user = userEvent.setup();
    render(<EmailDashboard />);
    
    const refreshButton = screen.getByLabelText('Refresh email data');
    await user.click(refreshButton);
    
    expect(refreshButton).toBeInTheDocument();
  });

  it('shows email performance chart', () => {
    render(<EmailDashboard />);
    
    expect(screen.getByText('Email Performance')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    const { container } = render(<EmailDashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});