import { EmailService } from '../email-service';
import { EmailData, EmailTemplateData } from '../../types';

// Mock the providers
jest.mock('../../providers', () => ({
  EmailProviderFactory: {
    createProviders: jest.fn(() => new Map()),
  },
  EmailProviderRouter: jest.fn(() => ({
    routeEmail: jest.fn(),
    routeBulkEmails: jest.fn(),
    getHealthStatuses: jest.fn(() => new Map()),
    getProviderMetrics: jest.fn(() => new Map()),
  })),
}));

describe('EmailService', () => {
  let emailService: EmailService;
  let mockRouter: any;

  beforeEach(() => {
    mockRouter = {
      routeEmail: jest.fn(),
      routeBulkEmails: jest.fn(),
      getHealthStatuses: jest.fn(() => new Map()),
      getProviderMetrics: jest.fn(() => new Map()),
    };

    emailService = new EmailService({
      providers: {
        resend: { apiKey: 'test-resend-key' },
        sendgrid: { apiKey: 'test-sendgrid-key' },
      },
      defaultFrom: 'test@example.com',
    });

    // Replace the router with our mock
    (emailService as any).router = mockRouter;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send a simple email successfully', async () => {
      const emailData: EmailData = {
        to: 'user@example.com',
        from: 'sender@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
        text: 'Test content',
        organizationId: 'org-123',
      };

      const expectedResult = {
        success: true,
        messageId: 'msg-123',
        provider: 'resend',
        timestamp: new Date(),
      };

      mockRouter.routeEmail.mockResolvedValue(expectedResult);

      const result = await emailService.sendEmail(emailData);

      expect(result).toEqual(expectedResult);
      expect(mockRouter.routeEmail).toHaveBeenCalledWith(emailData);
    });

    it('should use default from address when not provided', async () => {
      const emailData: EmailData = {
        to: 'user@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
        text: 'Test content',
        organizationId: 'org-123',
      } as EmailData;

      mockRouter.routeEmail.mockResolvedValue({
        success: true,
        messageId: 'msg-123',
      });

      await emailService.sendEmail(emailData);

      expect(mockRouter.routeEmail).toHaveBeenCalledWith({
        ...emailData,
        from: 'test@example.com',
      });
    });

    it('should return error for invalid email data', async () => {
      const invalidEmailData = {
        // Missing required fields
        organizationId: 'org-123',
      } as EmailData;

      const result = await emailService.sendEmail(invalidEmailData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
      expect(mockRouter.routeEmail).not.toHaveBeenCalled();
    });

    it('should handle router errors gracefully', async () => {
      const emailData: EmailData = {
        to: 'user@example.com',
        from: 'sender@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
        text: 'Test content',
        organizationId: 'org-123',
      };

      mockRouter.routeEmail.mockRejectedValue(new Error('Provider error'));

      const result = await emailService.sendEmail(emailData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Provider error');
    });
  });

  describe('sendBulkEmails', () => {
    it('should send bulk emails successfully', async () => {
      const emails: EmailData[] = [
        {
          to: 'user1@example.com',
          from: 'sender@example.com',
          subject: 'Test Email 1',
          html: '<p>Test content 1</p>',
          text: 'Test content 1',
          organizationId: 'org-123',
        },
        {
          to: 'user2@example.com',
          from: 'sender@example.com',
          subject: 'Test Email 2',
          html: '<p>Test content 2</p>',
          text: 'Test content 2',
          organizationId: 'org-123',
        },
      ];

      const expectedResult = {
        totalEmails: 2,
        successful: 2,
        failed: 0,
        results: [
          { success: true, messageId: 'msg-1' },
          { success: true, messageId: 'msg-2' },
        ],
      };

      mockRouter.routeBulkEmails.mockResolvedValue(expectedResult);

      const result = await emailService.sendBulkEmails(emails);

      expect(result).toEqual(expectedResult);
      expect(mockRouter.routeBulkEmails).toHaveBeenCalledWith(emails);
    });

    it('should add default from address to all emails', async () => {
      const emails: EmailData[] = [
        {
          to: 'user1@example.com',
          subject: 'Test Email 1',
          html: '<p>Test content 1</p>',
          text: 'Test content 1',
          organizationId: 'org-123',
        } as EmailData,
      ];

      mockRouter.routeBulkEmails.mockResolvedValue({
        totalEmails: 1,
        successful: 1,
        failed: 0,
        results: [{ success: true }],
      });

      await emailService.sendBulkEmails(emails);

      expect(mockRouter.routeBulkEmails).toHaveBeenCalledWith([
        {
          ...emails[0],
          from: 'test@example.com',
        },
      ]);
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with correct template data', async () => {
      const mockSendTemplateEmail = jest.spyOn(emailService, 'sendTemplateEmail');
      mockSendTemplateEmail.mockResolvedValue({
        success: true,
        messageId: 'welcome-123',
        timestamp: new Date(),
      });

      const welcomeData = {
        firstName: 'John',
        organizationName: 'Test Corp',
        organizationId: 'org-123',
        ctaUrl: 'https://example.com/login',
        ctaText: 'Get Started',
      };

      const result = await emailService.sendWelcomeEmail('john@example.com', welcomeData);

      expect(result.success).toBe(true);
      expect(mockSendTemplateEmail).toHaveBeenCalledWith(
        'welcome',
        expect.objectContaining({
          organizationId: 'org-123',
          recipient: {
            email: 'john@example.com',
            firstName: 'John',
          },
          organization: expect.objectContaining({
            name: 'Test Corp',
          }),
        }),
        expect.objectContaining({
          to: 'john@example.com',
          subject: 'Welcome to Test Corp!',
        })
      );

      mockSendTemplateEmail.mockRestore();
    });
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email with correct data', async () => {
      const mockSendTemplateEmail = jest.spyOn(emailService, 'sendTemplateEmail');
      mockSendTemplateEmail.mockResolvedValue({
        success: true,
        messageId: 'verify-123',
        timestamp: new Date(),
      });

      const verificationData = {
        firstName: 'Jane',
        verificationUrl: 'https://example.com/verify?token=abc123',
        organizationName: 'Test Corp',
        organizationId: 'org-123',
        expiresIn: '24 hours',
      };

      const result = await emailService.sendVerificationEmail('jane@example.com', verificationData);

      expect(result.success).toBe(true);
      expect(mockSendTemplateEmail).toHaveBeenCalledWith(
        'verification',
        expect.objectContaining({
          organizationId: 'org-123',
          recipient: {
            email: 'jane@example.com',
            firstName: 'Jane',
          },
          content: expect.objectContaining({
            ctaUrl: 'https://example.com/verify?token=abc123',
          }),
        }),
        expect.objectContaining({
          to: 'jane@example.com',
          subject: 'Verify your email address',
        })
      );

      mockSendTemplateEmail.mockRestore();
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email with correct data', async () => {
      const mockSendTemplateEmail = jest.spyOn(emailService, 'sendTemplateEmail');
      mockSendTemplateEmail.mockResolvedValue({
        success: true,
        messageId: 'reset-123',
        timestamp: new Date(),
      });

      const resetData = {
        firstName: 'Bob',
        resetUrl: 'https://example.com/reset?token=xyz789',
        organizationName: 'Test Corp',
        organizationId: 'org-123',
        expiresIn: '1 hour',
      };

      const result = await emailService.sendPasswordResetEmail('bob@example.com', resetData);

      expect(result.success).toBe(true);
      expect(mockSendTemplateEmail).toHaveBeenCalledWith(
        'password-reset',
        expect.objectContaining({
          organizationId: 'org-123',
          recipient: {
            email: 'bob@example.com',
            firstName: 'Bob',
          },
          content: expect.objectContaining({
            ctaUrl: 'https://example.com/reset?token=xyz789',
          }),
        }),
        expect.objectContaining({
          to: 'bob@example.com',
          subject: 'Reset your password',
        })
      );

      mockSendTemplateEmail.mockRestore();
    });
  });

  describe('registerTemplate', () => {
    it('should register a custom template', () => {
      const mockTemplate = jest.fn();
      
      emailService.registerTemplate('custom-template', mockTemplate);
      
      // Access the private templates map to verify registration
      const templates = (emailService as any).templates;
      expect(templates.get('custom-template')).toBe(mockTemplate);
    });
  });

  describe('getProviderHealth', () => {
    it('should return provider health status', () => {
      const mockHealthStatus = new Map([
        ['resend', { healthy: true, lastChecked: new Date() }],
        ['sendgrid', { healthy: true, lastChecked: new Date() }],
      ]);

      mockRouter.getHealthStatuses.mockReturnValue(mockHealthStatus);

      const health = emailService.getProviderHealth();
      
      expect(health).toBe(mockHealthStatus);
      expect(mockRouter.getHealthStatuses).toHaveBeenCalled();
    });
  });

  describe('getProviderMetrics', () => {
    it('should return provider metrics', () => {
      const mockMetrics = new Map([
        ['resend', { totalRequests: 100, successfulRequests: 95 }],
        ['sendgrid', { totalRequests: 50, successfulRequests: 48 }],
      ]);

      mockRouter.getProviderMetrics.mockReturnValue(mockMetrics);

      const metrics = emailService.getProviderMetrics();
      
      expect(metrics).toBe(mockMetrics);
      expect(mockRouter.getProviderMetrics).toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    it('should validate required email fields', async () => {
      const testCases = [
        {
          data: {},
          expectedError: 'Recipient email is required',
        },
        {
          data: { to: 'user@example.com' },
          expectedError: 'Organization ID is required',
        },
        {
          data: { to: 'user@example.com', organizationId: 'org-123' },
          expectedError: 'Email subject is required',
        },
        {
          data: { 
            to: 'user@example.com', 
            organizationId: 'org-123', 
            subject: 'Test' 
          },
          expectedError: 'Email content (HTML or text) is required',
        },
      ];

      for (const testCase of testCases) {
        const result = await emailService.sendEmail(testCase.data as EmailData);
        expect(result.success).toBe(false);
        expect(result.error).toContain(testCase.expectedError);
      }
    });
  });
});