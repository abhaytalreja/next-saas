require('@testing-library/jest-dom');

// Mock Resend
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ data: { id: 'test-id' } }),
    },
  })),
}));

// Mock SendGrid
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([{ statusCode: 202 }]),
}));

// Mock html-to-text
jest.mock('html-to-text', () => ({
  convert: jest.fn().mockReturnValue('Mocked text content'),
}));

// Global test utilities
global.mockEmailData = {
  to: 'test@example.com',
  from: 'noreply@example.com',
  subject: 'Test Email',
  html: '<p>Test content</p>',
  text: 'Test content',
};