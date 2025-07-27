import { SendGridProvider } from '../sendgrid-client';
import { EmailData, EmailResult } from '../../../types';

// Mock the SendGrid client
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

describe('SendGridProvider', () => {
  let provider: SendGridProvider;
  let mockSendGrid: any;

  beforeEach(() => {
    mockSendGrid = require('@sendgrid/mail');
    provider = new SendGridProvider({ apiKey: 'test-api-key' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create provider with correct configuration', () => {
      expect(provider.name).toBe('sendgrid');
      expect(provider.features.transactional).toBe(true);
      expect(provider.features.marketing).toBe(true);
      expect(provider.features.templates).toBe(true);
      expect(provider.features.analytics).toBe(true);
      expect(provider.features.webhooks).toBe(true);
    });

    it('should create provider without API key', () => {
      const provider = new SendGridProvider({});
      expect(provider.name).toBe('sendgrid');
    });

    it('should call setApiKey on initialization', () => {
      expect(mockSendGrid.setApiKey).toHaveBeenCalledWith('test-api-key');
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
      const mockResponse = [
        {
          statusCode: 202,
          headers: {
            'x-message-id': 'sendgrid-123',
          },
        },
      ];

      mockSendGrid.send.mockResolvedValue(mockResponse);

      const result = await provider.sendEmail(emailData);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('sendgrid-123');
      expect(result.provider).toBe('sendgrid');
      expect(mockSendGrid.send).toHaveBeenCalledWith({
        to: [{ email: 'user@example.com' }],
        from: 'sender@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
        text: 'Test content',
        headers: expect.objectContaining({
          'X-Organization-ID': 'org-123',
          'X-Email-Provider': 'sendgrid',
        }),
        tracking_settings: expect.any(Object),
      });
    });

    it('should handle SendGrid API errors', async () => {
      const mockError = {
        response: {
          body: {
            errors: [{ message: 'Invalid email address' }],
          },
        },
      };

      mockSendGrid.send.mockRejectedValue(mockError);

      const result = await provider.sendEmail(emailData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown provider error');
      expect(result.provider).toBe('sendgrid');
    });

    it('should handle network errors', async () => {
      mockSendGrid.send.mockRejectedValue(new Error('Network error'));

      const result = await provider.sendEmail(emailData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.provider).toBe('sendgrid');
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

      mockSendGrid.send.mockResolvedValue([{ statusCode: 202, headers: {} }]);

      await provider.sendEmail(emailWithAttachments);

      expect(mockSendGrid.send).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments: [
            {
              filename: 'document.pdf',
              content: 'base64content',
              type: 'application/pdf',
              disposition: 'attachment',
              content_id: undefined,
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

      mockSendGrid.send.mockResolvedValue([{ statusCode: 202, headers: {} }]);

      await provider.sendEmail(emailWithReplyTo);

      expect(mockSendGrid.send).toHaveBeenCalledWith(
        expect.objectContaining({
          replyTo: 'noreply@example.com',
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

      mockSendGrid.send.mockResolvedValue([{ statusCode: 202, headers: {} }]);

      await provider.sendEmail(emailWithHeaders);

      expect(mockSendGrid.send).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            'X-Custom-Header': 'custom-value',
          },
        })
      );
    });

    it('should handle multiple recipients', async () => {
      const emailWithMultipleRecipients: EmailData = {
        ...emailData,
        to: ['user1@example.com', 'user2@example.com'],
      };

      mockSendGrid.send.mockResolvedValue([{ statusCode: 202, headers: {} }]);

      await provider.sendEmail(emailWithMultipleRecipients);

      expect(mockSendGrid.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['user1@example.com', 'user2@example.com'],
        })
      );
    });

    it('should generate message ID when not provided in response', async () => {
      mockSendGrid.send.mockResolvedValue([{ statusCode: 202, headers: {} }]);

      const result = await provider.sendEmail(emailData);

      expect(result.success).toBe(true);
      expect(result.messageId).toMatch(/^sendgrid_/);
    });
  });

  describe('checkHealth', () => {
    it('should return healthy status on successful API call', async () => {
      mockSendGrid.send.mockResolvedValue([{ statusCode: 202 }]);

      const status = await provider.checkHealth();

      expect(status.healthy).toBe(true);
      expect(status.provider).toBe('sendgrid');
      expect(status.lastChecked).toBeInstanceOf(Date);
      expect(status.responseTime).toBeGreaterThan(0);
    });

    it('should return unhealthy status on API error', async () => {
      const mockError = {
        response: {
          body: {
            errors: [{ message: 'API Error' }],
          },
        },
      };

      mockSendGrid.send.mockRejectedValue(mockError);

      const status = await provider.checkHealth();

      expect(status.healthy).toBe(false);
      expect(status.provider).toBe('sendgrid');
      expect(status.error).toBe('API Error');
      expect(status.lastChecked).toBeInstanceOf(Date);
    });

    it('should return unhealthy status on network error', async () => {
      mockSendGrid.send.mockRejectedValue(new Error('Network timeout'));

      const status = await provider.checkHealth();

      expect(status.healthy).toBe(false);
      expect(status.provider).toBe('sendgrid');
      expect(status.error).toBe('Network timeout');
      expect(status.lastChecked).toBeInstanceOf(Date);
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
        to: 'user@example.com',
        from: 'sender@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
        text: 'Test content',
        attachments: [
          {
            filename: 'test.pdf',
            content: 'base64',
            type: 'application/pdf',
          },
        ],
        replyTo: 'noreply@example.com',
        headers: {
          'X-Custom': 'value',
        },
        customArgs: {
          organizationId: 'org-123',
        },
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
        to: 'user@example.com',
        from: 'sender@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
        customArgs: {
          organizationId: 'org-123',
        },
      });
    });
  });

  describe('extractErrorMessage', () => {
    it('should extract message from SendGrid error response', () => {
      const error = {
        response: {
          body: {
            errors: [
              { message: 'First error' },
              { message: 'Second error' },
            ],
          },
        },
      };

      const message = (provider as any).extractErrorMessage(error);
      expect(message).toBe('First error');
    });

    it('should handle Error objects', () => {
      const error = new Error('Test error');
      const message = (provider as any).extractErrorMessage(error);
      expect(message).toBe('Test error');
    });

    it('should handle string errors', () => {
      const message = (provider as any).extractErrorMessage('String error');
      expect(message).toBe('String error');
    });

    it('should handle unknown errors', () => {
      const message = (provider as any).extractErrorMessage(null);
      expect(message).toBe('Unknown error occurred');
    });
  });

  describe('generateMessageId', () => {
    it('should generate unique message IDs', () => {
      const id1 = (provider as any).generateMessageId();
      const id2 = (provider as any).generateMessageId();

      expect(id1).toMatch(/^sendgrid_/);
      expect(id2).toMatch(/^sendgrid_/);
      expect(id1).not.toBe(id2);
    });
  });
});