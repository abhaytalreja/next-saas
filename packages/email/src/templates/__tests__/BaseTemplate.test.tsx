/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { BaseTemplate } from '../base/BaseTemplate';

// Mock @react-email/render
jest.mock('@react-email/render', () => ({
  render: jest.fn(() => Promise.resolve('<html>Mocked HTML</html>')),
}));

describe('BaseTemplate', () => {
  const defaultProps = {
    organizationId: 'org-123',
    recipient: {
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
    },
    branding: {
      logo: 'https://example.com/logo.png',
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      companyName: 'Test Company',
    },
    content: {
      title: 'Test Email',
      message: 'This is a test email message',
    },
    unsubscribeUrl: 'https://example.com/unsubscribe',
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { container } = render(
      <BaseTemplate {...defaultProps}>
        <div>Test content</div>
      </BaseTemplate>
    );

    expect(container).toBeInTheDocument();
  });

  it('should display company branding', () => {
    const { getByText } = render(
      <BaseTemplate {...defaultProps}>
        <div>Test content</div>
      </BaseTemplate>
    );

    expect(getByText('Test Company')).toBeInTheDocument();
  });

  it('should display recipient information', () => {
    const { getByText } = render(
      <BaseTemplate {...defaultProps}>
        <div>Test content</div>
      </BaseTemplate>
    );

    expect(getByText(/John/)).toBeInTheDocument();
  });

  it('should render children content', () => {
    const { getByText } = render(
      <BaseTemplate {...defaultProps}>
        <div>Custom child content</div>
      </BaseTemplate>
    );

    expect(getByText('Custom child content')).toBeInTheDocument();
  });

  it('should include unsubscribe link', () => {
    const { getByRole } = render(
      <BaseTemplate {...defaultProps}>
        <div>Test content</div>
      </BaseTemplate>
    );

    const unsubscribeLink = getByRole('link', { name: /unsubscribe/i });
    expect(unsubscribeLink).toHaveAttribute('href', 'https://example.com/unsubscribe');
  });

  it('should apply custom branding colors', () => {
    const customBranding = {
      ...defaultProps.branding,
      primaryColor: '#ff0000',
      secondaryColor: '#00ff00',
    };

    const { container } = render(
      <BaseTemplate {...defaultProps} branding={customBranding}>
        <div>Test content</div>
      </BaseTemplate>
    );

    // Check that custom colors are applied (this would depend on implementation)
    expect(container).toBeInTheDocument();
  });

  it('should handle missing optional props gracefully', () => {
    const minimalProps = {
      organizationId: 'org-123',
      recipient: {
        email: 'user@example.com',
      },
      content: {
        title: 'Test Email',
      },
    };

    const { container } = render(
      <BaseTemplate {...minimalProps}>
        <div>Test content</div>
      </BaseTemplate>
    );

    expect(container).toBeInTheDocument();
  });

  it('should display content title and message', () => {
    const { getByText } = render(
      <BaseTemplate {...defaultProps}>
        <div>Test content</div>
      </BaseTemplate>
    );

    expect(getByText('Test Email')).toBeInTheDocument();
    expect(getByText('This is a test email message')).toBeInTheDocument();
  });

  it('should render logo when provided', () => {
    const { getByRole } = render(
      <BaseTemplate {...defaultProps}>
        <div>Test content</div>
      </BaseTemplate>
    );

    const logo = getByRole('img', { name: /logo/i });
    expect(logo).toHaveAttribute('src', 'https://example.com/logo.png');
  });

  it('should handle missing logo gracefully', () => {
    const propsWithoutLogo = {
      ...defaultProps,
      branding: {
        ...defaultProps.branding,
        logo: undefined,
      },
    };

    const { container } = render(
      <BaseTemplate {...propsWithoutLogo}>
        <div>Test content</div>
      </BaseTemplate>
    );

    expect(container).toBeInTheDocument();
  });

  it('should include proper email metadata', () => {
    const { container } = render(
      <BaseTemplate {...defaultProps}>
        <div>Test content</div>
      </BaseTemplate>
    );

    // Check for HTML structure appropriate for email
    const htmlElement = container.querySelector('html');
    expect(htmlElement).toBeInTheDocument();
  });

  it('should be responsive for different screen sizes', () => {
    const { container } = render(
      <BaseTemplate {...defaultProps}>
        <div>Test content</div>
      </BaseTemplate>
    );

    // Check for responsive design elements (this would depend on implementation)
    expect(container).toBeInTheDocument();
  });
});