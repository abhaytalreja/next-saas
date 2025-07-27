import { EmailTester } from '../EmailTester';
import { EmailService } from '../../services/email-service';
import { EmailAnalytics } from '../../analytics/EmailAnalytics';
import { EmailTest, EmailTestResults } from '../EmailTester';

// Mock dependencies
jest.mock('../../services/email-service');
jest.mock('../../analytics/EmailAnalytics');
jest.mock('@react-email/render');

describe('EmailTester', () => {
  let emailTester: EmailTester;
  let mockEmailService: jest.Mocked<EmailService>;
  let mockAnalytics: jest.Mocked<EmailAnalytics>;

  beforeEach(() => {
    mockEmailService = new EmailService({} as any) as jest.Mocked<EmailService>;
    mockAnalytics = new EmailAnalytics({} as any) as jest.Mocked<EmailAnalytics>;
    emailTester = new EmailTester(mockEmailService, mockAnalytics);

    // Setup default mocks
    const mockRender = require('@react-email/render');
    mockRender.render.mockResolvedValue('<html><body><p>Test email content</p></body></html>');

    jest.clearAllMocks();
  });

  describe('createTest', () => {
    const baseTestData = {
      name: 'Welcome Email Test',
      templateId: 'welcome',
      testType: 'preview' as const,
      testEmails: ['test@example.com'],
      templateVariables: { firstName: 'John', companyName: 'Test Corp' },
      createdBy: 'user-123',
      organizationId: 'org-123',
    };

    it('should create a test successfully', async () => {
      const test = await emailTester.createTest(baseTestData);

      expect(test.id).toBeDefined();
      expect(test.name).toBe('Welcome Email Test');
      expect(test.status).toBe('pending');
      expect(test.createdAt).toBeInstanceOf(Date);
      expect(test.templateId).toBe('welcome');
    });

    it('should generate unique test IDs', async () => {
      const test1 = await emailTester.createTest(baseTestData);
      const test2 = await emailTester.createTest({ ...baseTestData, name: 'Test 2' });

      expect(test1.id).not.toBe(test2.id);
    });

    it('should create tests for different test types', async () => {
      const testTypes: Array<EmailTest['testType']> = [
        'preview', 'send', 'spam_check', 'link_validation', 'deliverability'
      ];

      for (const testType of testTypes) {
        const test = await emailTester.createTest({
          ...baseTestData,
          testType,
          name: `${testType} test`,
        });

        expect(test.testType).toBe(testType);
      }
    });
  });

  describe('runTest', () => {
    let testPreview: EmailTest;
    let testSend: EmailTest;

    beforeEach(async () => {
      testPreview = await emailTester.createTest({
        name: 'Preview Test',
        templateId: 'welcome',
        testType: 'preview',
        testEmails: ['test@example.com'],
        templateVariables: { firstName: 'John' },
        createdBy: 'user-123',
        organizationId: 'org-123',
      });

      testSend = await emailTester.createTest({
        name: 'Send Test',
        templateId: 'welcome',
        testType: 'send',
        testEmails: ['test1@example.com', 'test2@example.com'],
        templateVariables: { firstName: 'Jane' },
        createdBy: 'user-123',
        organizationId: 'org-123',
      });
    });

    it('should run preview test successfully', async () => {
      const results = await emailTester.runTest(testPreview.id);

      expect(results.htmlPreview).toContain('<html>');
      expect(results.textPreview).toBe('Test email content');
      expect(results.subjectPreview).toBeDefined();
      expect(results.emailSize).toBeGreaterThan(0);
      expect(results.issues).toBeDefined();

      const test = emailTester.getTest(testPreview.id);
      expect(test?.status).toBe('completed');
      expect(test?.completedAt).toBeInstanceOf(Date);
    });

    it('should run send test successfully', async () => {
      mockEmailService.sendTemplatedEmail.mockResolvedValue({
        success: true,
        messageId: 'test-msg-123',
        timestamp: new Date(),
      });

      const results = await emailTester.runTest(testSend.id);

      expect(results.sendResults).toHaveLength(2);
      expect(results.sendResults?.[0].status).toBe('sent');
      expect(results.sendResults?.[0].messageId).toBe('test-msg-123');
      expect(mockEmailService.sendTemplatedEmail).toHaveBeenCalledTimes(2);
    });

    it('should handle send test failures', async () => {
      mockEmailService.sendTemplatedEmail
        .mockResolvedValueOnce({
          success: true,
          messageId: 'success-msg',
          timestamp: new Date(),
        })
        .mockResolvedValueOnce({
          success: false,
          error: 'Email validation failed',
          timestamp: new Date(),
        });

      const results = await emailTester.runTest(testSend.id);

      expect(results.sendResults).toHaveLength(2);
      expect(results.sendResults?.[0].status).toBe('sent');
      expect(results.sendResults?.[1].status).toBe('failed');
      expect(results.sendResults?.[1].error).toBe('Email validation failed');
    });

    it('should run spam check test', async () => {
      const spamTest = await emailTester.createTest({
        name: 'Spam Check Test',
        templateId: 'promotional',
        testType: 'spam_check',
        testEmails: ['test@example.com'],
        templateVariables: { offer: 'FREE LIMITED TIME OFFER!!!' },
        createdBy: 'user-123',
        organizationId: 'org-123',
      });

      const results = await emailTester.runTest(spamTest.id);

      expect(results.spamScore).toBeGreaterThan(0);
      expect(results.spamReasons).toBeDefined();
      expect(results.spamRecommendations).toBeDefined();
      expect(results.spamReasons?.length).toBeGreaterThan(0);
    });

    it('should run link validation test', async () => {
      // Mock HTML with links
      const mockRender = require('@react-email/render');
      mockRender.render.mockResolvedValue(`
        <html>
          <body>
            <a href="https://example.com/valid">Valid Link</a>
            <a href="invalid-url">Invalid Link</a>
            <a href="mailto:test@example.com">Email Link</a>
          </body>
        </html>
      `);

      const linkTest = await emailTester.createTest({
        name: 'Link Validation Test',
        templateId: 'newsletter',
        testType: 'link_validation',
        testEmails: ['test@example.com'],
        templateVariables: {},
        createdBy: 'user-123',
        organizationId: 'org-123',
      });

      const results = await emailTester.runTest(linkTest.id);

      expect(results.links).toBeDefined();
      expect(results.links?.length).toBe(2); // Should skip mailto links
      expect(results.links?.some(link => link.status === 'valid')).toBe(true);
      expect(results.links?.some(link => link.status === 'invalid')).toBe(true);
    });

    it('should run deliverability test', async () => {
      const deliverabilityTest = await emailTester.createTest({
        name: 'Deliverability Test',
        templateId: 'newsletter',
        testType: 'deliverability',
        testEmails: ['test@example.com'],
        templateVariables: {},
        createdBy: 'user-123',
        organizationId: 'org-123',
      });

      const results = await emailTester.runTest(deliverabilityTest.id);

      expect(results.deliverabilityScore).toBeDefined();
      expect(results.authenticationResults).toBeDefined();
      expect(results.authenticationResults?.spf).toBeDefined();
      expect(results.authenticationResults?.dkim).toBeDefined();
      expect(results.authenticationResults?.dmarc).toBeDefined();
    });

    it('should handle test failures gracefully', async () => {
      // Mock render to throw error
      const mockRender = require('@react-email/render');
      mockRender.render.mockRejectedValue(new Error('Template render failed'));

      await expect(emailTester.runTest(testPreview.id)).rejects.toThrow('Template render failed');

      const test = emailTester.getTest(testPreview.id);
      expect(test?.status).toBe('failed');
      expect(test?.completedAt).toBeInstanceOf(Date);
    });

    it('should handle unknown test type', async () => {
      const unknownTest = await emailTester.createTest({
        name: 'Unknown Test',
        templateId: 'welcome',
        testType: 'unknown' as any,
        testEmails: ['test@example.com'],
        templateVariables: {},
        createdBy: 'user-123',
        organizationId: 'org-123',
      });

      await expect(emailTester.runTest(unknownTest.id)).rejects.toThrow('Unknown test type');
    });
  });

  describe('generatePreview', () => {
    it('should generate email preview for different devices and clients', async () => {
      const preview = await emailTester.generatePreview(
        'welcome',
        { firstName: 'John', companyName: 'Test Corp' },
        { device: 'mobile', client: 'gmail' }
      );

      expect(preview.html).toContain('<html>');
      expect(preview.text).toBe('Test email content');
      expect(preview.subject).toBeDefined();
      expect(preview.issues).toBeDefined();
    });

    it('should apply client-specific transformations', async () => {
      const outlookPreview = await emailTester.generatePreview(
        'welcome',
        { firstName: 'John' },
        { device: 'desktop', client: 'outlook' }
      );

      expect(outlookPreview.html).toContain('/* border-radius not supported */');
    });

    it('should apply mobile transformations', async () => {
      const mobilePreview = await emailTester.generatePreview(
        'welcome',
        { firstName: 'John' },
        { device: 'mobile', client: 'gmail' }
      );

      expect(mobilePreview.html).toContain('@media (max-width: 600px)');
    });

    it('should validate email content and return issues', async () => {
      // Mock large HTML content
      const mockRender = require('@react-email/render');
      const largeHtml = '<html><body>' + 'x'.repeat(150000) + '</body></html>';
      mockRender.render.mockResolvedValue(largeHtml);

      const preview = await emailTester.generatePreview(
        'large-template',
        {},
        { device: 'desktop', client: 'gmail' }
      );

      expect(preview.issues?.some(issue => 
        issue.category === 'deliverability' && 
        issue.message.includes('Email size exceeds')
      )).toBe(true);
    });

    it('should detect missing alt text in images', async () => {
      const mockRender = require('@react-email/render');
      mockRender.render.mockResolvedValue(`
        <html>
          <body>
            <img src="image1.jpg" alt="Description">
            <img src="image2.jpg">
            <img src="image3.jpg">
          </body>
        </html>
      `);

      const preview = await emailTester.generatePreview(
        'image-template',
        {},
        { device: 'desktop', client: 'gmail' }
      );

      expect(preview.issues?.some(issue => 
        issue.category === 'accessibility' && 
        issue.message.includes('images missing alt text')
      )).toBe(true);
    });

    it('should validate subject line length', async () => {
      const preview = await emailTester.generatePreview(
        'welcome',
        { subject: 'This is a very long subject line that exceeds the recommended character limit for mobile display' },
        { device: 'mobile', client: 'gmail' }
      );

      expect(preview.issues?.some(issue => 
        issue.category === 'content' && 
        issue.message.includes('Subject line is longer than 50 characters')
      )).toBe(true);
    });
  });

  describe('testAcrossClients', () => {
    it('should test across multiple devices and clients', async () => {
      const results = await emailTester.testAcrossClients(
        'welcome',
        { firstName: 'John' }
      );

      expect(results.length).toBe(12); // 3 devices × 4 clients
      
      const devices = ['desktop', 'mobile', 'tablet'];
      const clients = ['gmail', 'outlook', 'apple_mail', 'yahoo'];

      devices.forEach(device => {
        clients.forEach(client => {
          expect(results.some(r => r.device === device && r.client === client)).toBe(true);
        });
      });
    });

    it('should handle rendering errors for specific client/device combinations', async () => {
      const mockRender = require('@react-email/render');
      let callCount = 0;
      mockRender.render.mockImplementation(() => {
        callCount++;
        if (callCount === 3) { // Fail on third call
          throw new Error('Rendering failed for specific combination');
        }
        return Promise.resolve('<html><body>Success</body></html>');
      });

      const results = await emailTester.testAcrossClients(
        'problematic-template',
        { firstName: 'John' }
      );

      expect(results.length).toBe(12);
      expect(results.some(r => r.issues.includes('Render failed: Rendering failed for specific combination'))).toBe(true);
      expect(results.some(r => r.preview !== '')).toBe(true); // Some should succeed
    });

    it('should record render times for performance analysis', async () => {
      const results = await emailTester.testAcrossClients(
        'welcome',
        { firstName: 'John' }
      );

      results.forEach(result => {
        expect(result.renderTime).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('test management', () => {
    it('should list tests for organization', async () => {
      await emailTester.createTest({
        name: 'Test 1',
        templateId: 'welcome',
        testType: 'preview',
        testEmails: ['test@example.com'],
        templateVariables: {},
        createdBy: 'user-123',
        organizationId: 'org-123',
      });

      await emailTester.createTest({
        name: 'Test 2',
        templateId: 'newsletter',
        testType: 'send',
        testEmails: ['test@example.com'],
        templateVariables: {},
        createdBy: 'user-123',
        organizationId: 'org-123',
      });

      await emailTester.createTest({
        name: 'Test 3',
        templateId: 'welcome',
        testType: 'preview',
        testEmails: ['test@example.com'],
        templateVariables: {},
        createdBy: 'user-123',
        organizationId: 'org-456', // Different org
      });

      const org123Tests = emailTester.listTests('org-123');
      const org456Tests = emailTester.listTests('org-456');

      expect(org123Tests.length).toBe(2);
      expect(org456Tests.length).toBe(1);
    });

    it('should delete tests', async () => {
      const test = await emailTester.createTest({
        name: 'Deletable Test',
        templateId: 'welcome',
        testType: 'preview',
        testEmails: ['test@example.com'],
        templateVariables: {},
        createdBy: 'user-123',
        organizationId: 'org-123',
      });

      expect(emailTester.getTest(test.id)).toBeTruthy();

      const deleted = emailTester.deleteTest(test.id);
      expect(deleted).toBe(true);
      expect(emailTester.getTest(test.id)).toBeNull();
    });

    it('should return false when deleting non-existent test', () => {
      const deleted = emailTester.deleteTest('non-existent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('helper methods', () => {
    it('should extract text from HTML correctly', () => {
      const html = '<html><body><h1>Title</h1><p>Paragraph with <strong>bold</strong> text.</p></body></html>';
      const text = (emailTester as any).extractTextFromHtml(html);
      
      expect(text).toBe('Title Paragraph with bold text.');
    });

    it('should extract subject from template variables', () => {
      const subject = (emailTester as any).extractSubjectFromTemplate(
        'welcome',
        { subject: 'Custom Subject', firstName: 'John' }
      );
      
      expect(subject).toBe('Custom Subject');
    });

    it('should use default subject when not provided', () => {
      const subject = (emailTester as any).extractSubjectFromTemplate(
        'welcome',
        { firstName: 'John' }
      );
      
      expect(subject).toBe('Test Email Subject');
    });

    it('should generate unique test IDs', () => {
      const id1 = (emailTester as any).generateTestId();
      const id2 = (emailTester as any).generateTestId();

      expect(id1).toMatch(/^test_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^test_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });
});