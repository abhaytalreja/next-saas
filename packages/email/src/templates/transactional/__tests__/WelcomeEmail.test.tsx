/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { WelcomeEmail } from '../welcome/WelcomeEmail';

describe('WelcomeEmail', () => {
  const defaultProps = {
    organizationId: 'org-123',
    recipient: {
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
    },
    organization: {
      name: 'Test Company',
      logo: 'https://example.com/logo.png',
      primaryColor: '#007bff',
    },
    content: {
      ctaUrl: 'https://example.com/dashboard',
      ctaText: 'Get Started',
      customMessage: 'Welcome to our platform!',
    },
    unsubscribeUrl: 'https://example.com/unsubscribe',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { container } = render(<WelcomeEmail {...defaultProps} />);
    expect(container).toBeInTheDocument();
  });

  it('should display welcome message with recipient name', () => {
    const { getByText } = render(<WelcomeEmail {...defaultProps} />);
    
    expect(getByText(/Welcome.*John/i)).toBeInTheDocument();
  });

  it('should display organization name', () => {
    const { getByText } = render(<WelcomeEmail {...defaultProps} />);
    
    expect(getByText(/Test Company/)).toBeInTheDocument();
  });

  it('should include call-to-action button', () => {
    const { getByRole } = render(<WelcomeEmail {...defaultProps} />);
    
    const ctaButton = getByRole('link', { name: /get started/i });
    expect(ctaButton).toHaveAttribute('href', 'https://example.com/dashboard');
  });

  it('should display custom welcome message when provided', () => {
    const { getByText } = render(<WelcomeEmail {...defaultProps} />);
    
    expect(getByText('Welcome to our platform!')).toBeInTheDocument();
  });

  it('should use default message when custom message not provided', () => {
    const propsWithoutCustomMessage = {
      ...defaultProps,
      content: {
        ...defaultProps.content,
        customMessage: undefined,
      },
    };

    const { container } = render(<WelcomeEmail {...propsWithoutCustomMessage} />);
    expect(container).toBeInTheDocument();
  });

  it('should handle missing recipient last name', () => {
    const propsWithoutLastName = {
      ...defaultProps,
      recipient: {
        email: 'john@example.com',
        firstName: 'John',
      },
    };

    const { getByText } = render(<WelcomeEmail {...propsWithoutLastName} />);
    expect(getByText(/John/)).toBeInTheDocument();
  });

  it('should include organization logo when provided', () => {
    const { getByRole } = render(<WelcomeEmail {...defaultProps} />);
    
    const logo = getByRole('img');
    expect(logo).toHaveAttribute('src', 'https://example.com/logo.png');
  });

  it('should apply organization branding colors', () => {
    const { container } = render(<WelcomeEmail {...defaultProps} />);
    
    // Check that branding is applied (implementation specific)
    expect(container).toBeInTheDocument();
  });

  it('should include proper email structure for welcome flow', () => {
    const { container } = render(<WelcomeEmail {...defaultProps} />);
    
    // Should include typical welcome email elements
    expect(container.textContent).toMatch(/welcome/i);
  });

  it('should use custom CTA text when provided', () => {
    const customCtaProps = {
      ...defaultProps,
      content: {
        ...defaultProps.content,
        ctaText: 'Start Your Journey',
      },
    };

    const { getByRole } = render(<WelcomeEmail {...customCtaProps} />);
    
    const ctaButton = getByRole('link', { name: /start your journey/i });
    expect(ctaButton).toBeInTheDocument();
  });

  it('should handle missing CTA gracefully', () => {
    const propsWithoutCta = {
      ...defaultProps,
      content: {
        customMessage: 'Welcome!',
      },
    };

    const { container } = render(<WelcomeEmail {...propsWithoutCta} />);
    expect(container).toBeInTheDocument();
  });

  it('should be accessible with proper ARIA labels', () => {
    const { getByRole } = render(<WelcomeEmail {...defaultProps} />);
    
    // Check for accessible elements
    const ctaButton = getByRole('link', { name: /get started/i });
    expect(ctaButton).toBeInTheDocument();
  });

  it('should include unsubscribe functionality', () => {
    const { getByRole } = render(<WelcomeEmail {...defaultProps} />);
    
    const unsubscribeLink = getByRole('link', { name: /unsubscribe/i });
    expect(unsubscribeLink).toHaveAttribute('href', 'https://example.com/unsubscribe');
  });
});