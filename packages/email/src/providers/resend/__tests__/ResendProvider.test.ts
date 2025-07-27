import { ResendProvider } from '../resend-client';
import { EmailData, EmailResult } from '../../../types/email';

// Mock the Resend client
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn(),
    },
  })),
}));

describe('ResendProvider', () => {
  let provider: ResendProvider;
  let mockResendClient: any;

  beforeEach(() => {
    mockResendClient = {
      emails: {
        send: jest.fn(),
      },
    };

    provider = new ResendProvider({ apiKey: 'test-api-key' });
    (provider as any).client = mockResendClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create provider with correct configuration', () => {
      expect(provider.name).toBe('resend');
      expect(provider.features.transactional).toBe(true);
      expect(provider.features.marketing).toBe(false);
      expect(provider.features.templates).toBe(true);
      expect(provider.features.analytics).toBe(true);
      expect(provider.features.webhooks).toBe(true);
    });

    it('should create provider without API key', () => {
      const provider = new ResendProvider({});
      expect(provider.name).toBe('resend');
    });
  });

  describe('sendEmail', () => {
    const emailData: EmailData = {
      to: 'user@example.com',
      from: 'sender@example.com',
      subject: 'Test Email',
      html: '<p>Test content</p>',
      text: 'Test content',
      organizationId: 'org-123',
    };

    it('should send email successfully', async () => {
      const mockResponse = {
        data: {
          id: 'resend-123',
        },
        error: null,
      };

      mockResendClient.emails.send.mockResolvedValue(mockResponse);

      const result = await provider.sendEmail(emailData);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('resend-123');
      expect(result.provider).toBe('resend');
      expect(mockResendClient.emails.send).toHaveBeenCalledWith({
        to: ['user@example.com'],
        from: 'sender@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
        text: 'Test content',
        headers: expect.objectContaining({
          'X-Organization-ID': 'org-123',
          'X-Email-Provider': 'resend',
        }),
      });
    });

    it('should handle Resend API errors', async () => {
      const mockError = new Error('API rate limit exceeded');
      mockResendClient.emails.send.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await provider.sendEmail(emailData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('API rate limit exceeded');
      expect(result.provider).toBe('resend');
    });

    it('should handle network errors', async () => {
      mockResendClient.emails.send.mockRejectedValue(new Error('Network error'));

      const result = await provider.sendEmail(emailData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.provider).toBe('resend');
    });

    it('should include attachments when provided', async () => {
      const emailWithAttachments: EmailData = {
        ...emailData,
        attachments: [
          {
            filename: 'document.pdf',
            content: 'base64content',
            contentType: 'application/pdf',
          },
        ],
      };

      mockResendClient.emails.send.mockResolvedValue({
        data: { id: 'resend-123' },
        error: null,
      });

      await provider.sendEmail(emailWithAttachments);

      expect(mockResendClient.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments: [
            {
              filename: 'document.pdf',
              content: 'base64content',
              content_type: 'application/pdf',
            },
          ],
        })
      );
    });

    it('should include reply-to when provided', async () => {
      const emailWithReplyTo: EmailData = {
        ...emailData,
        replyTo: 'noreply@example.com',
      };

      mockResendClient.emails.send.mockResolvedValue({
        data: { id: 'resend-123' },
        error: null,
      });

      await provider.sendEmail(emailWithReplyTo);

      expect(mockResendClient.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          reply_to: 'noreply@example.com',
        })
      );
    });

    it('should include custom headers when provided', async () => {
      const emailWithHeaders: EmailData = {
        ...emailData,
        headers: {
          'X-Custom-Header': 'custom-value',
        },
      };

      mockResendClient.emails.send.mockResolvedValue({
        data: { id: 'resend-123' },
        error: null,
      });

      await provider.sendEmail(emailWithHeaders);

      expect(mockResendClient.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Organization-ID': 'org-123',
            'X-Custom-Header': 'custom-value',
            'X-Email-Provider': 'resend',
          }),
        })
      );
    });

    it('should handle null data response', async () => {
      mockResendClient.emails.send.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await provider.sendEmail(emailData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No data returned');
    });
  });

  describe('checkHealth', () => {
    it('should return healthy status on successful API call', async () => {
      mockResendClient.emails.send.mockResolvedValue({
        data: { id: 'test' },
        error: null,
      });

      const status = await provider.checkHealth();

      expect(status.healthy).toBe(true);
      expect(status.lastChecked).toBeInstanceOf(Date);
      expect(status.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should return unhealthy status on API error', async () => {
      mockResendClient.emails.send.mockResolvedValue({
        data: null,
        error: new Error('API Error'),
      });

      const status = await provider.checkHealth();

      expect(status.healthy).toBe(false);
      expect(status.lastChecked).toBeInstanceOf(Date);
      expect(status.issues).toContain('API Error');
    });

    it('should return unhealthy status on network error', async () => {
      mockResendClient.emails.send.mockRejectedValue(new Error('Network timeout'));

      const status = await provider.checkHealth();

      expect(status.healthy).toBe(false);
      expect(status.lastChecked).toBeInstanceOf(Date);
      expect(status.issues).toContain('Network timeout');
    });
  });

  describe('transformEmailData', () => {
    it('should transform email data correctly', () => {
      const emailData: EmailData = {
        to: 'user@example.com',
        from: 'sender@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
        text: 'Test content',
        organizationId: 'org-123',
        attachments: [
          {
            filename: 'test.pdf',
            content: 'base64',
            contentType: 'application/pdf',
          },
        ],
        replyTo: 'noreply@example.com',
        headers: { 'X-Custom': 'value' },
      };

      const transformed = (provider as any).transformEmailData(emailData);

      expect(transformed).toEqual({
        to: ['user@example.com'],
        from: 'sender@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
        text: 'Test content',
        attachments: [
          {
            filename: 'test.pdf',
            content: 'base64',
            content_type: 'application/pdf',
            content_id: undefined,
          },
        ],
        reply_to: 'noreply@example.com',
        headers: expect.objectContaining({
          'X-Organization-ID': 'org-123',
          'X-Custom': 'value',
          'X-Email-Provider': 'resend',
        }),
      });
    });

    it('should handle minimal email data', () => {
      const emailData: EmailData = {
        to: 'user@example.com',
        from: 'sender@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
        organizationId: 'org-123',
      };

      const transformed = (provider as any).transformEmailData(emailData);

      expect(transformed).toEqual({
        to: ['user@example.com'],
        from: 'sender@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
        text: undefined,
        headers: expect.objectContaining({
          'X-Organization-ID': 'org-123',
          'X-Email-Provider': 'resend',
        }),
      });
    });
  });

  describe('handleProviderError', () => {
    it('should handle Error objects', () => {
      const error = new Error('Test error');
      const result = (provider as any).handleProviderError(error, 'sendEmail');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Test error');
      expect(result.provider).toBe('resend');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should handle string errors', () => {
      const result = (provider as any).handleProviderError('String error', 'sendEmail');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown provider error');
      expect(result.provider).toBe('resend');
    });

    it('should handle unknown errors', () => {
      const result = (provider as any).handleProviderError(null, 'sendEmail');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown provider error');
      expect(result.provider).toBe('resend');
    });
  });
});