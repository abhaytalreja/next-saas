/**
 * Jest test setup file for email package
 */

// Mock external dependencies globally
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({
        data: { id: 'mock-resend-id' },
        error: null,
      }),
    },
  })),
}));

jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([{
    statusCode: 202,
    headers: { 'x-message-id': 'mock-sendgrid-id' },
  }]),
}));

jest.mock('@react-email/render', () => ({
  render: jest.fn().mockResolvedValue('<html><body><p>Mock rendered email</p></body></html>'),
}));

// Mock crypto for signature verification
jest.mock('crypto', () => ({
  createHmac: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mock-signature'),
  }),
  timingSafeEqual: jest.fn().mockReturnValue(true),
}));

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log during tests unless explicitly needed
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Setup test environment
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset Date.now for consistent testing
  jest.spyOn(Date, 'now').mockReturnValue(1704110400000); // 2024-01-01 12:00:00 UTC
});

afterEach(() => {
  // Restore all mocks after each test
  jest.restoreAllMocks();
});

// Export test utilities
export const createMockDatabase = () => ({
  query: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

export const createMockEmailData = (overrides = {}) => ({
  to: 'test@example.com',
  from: 'sender@example.com',
  subject: 'Test Email',
  html: '<p>Test content</p>',
  text: 'Test content',
  organizationId: 'org-123',
  ...overrides,
});

export const createMockCampaignData = (overrides = {}) => ({
  name: 'Test Campaign',
  organizationId: 'org-123',
  templateId: 'newsletter',
  subject: 'Test Subject',
  audienceId: 'audience-123',
  type: 'standard' as const,
  status: 'draft' as const,
  scheduledAt: new Date(),
  templateVariables: { companyName: 'Test Corp' },
  sendingConfig: {
    sendRate: 100,
    batchSize: 50,
  },
  trackingConfig: {
    trackOpens: true,
    trackClicks: true,
    trackUnsubscribes: true,
  },
  ...overrides,
});

export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));