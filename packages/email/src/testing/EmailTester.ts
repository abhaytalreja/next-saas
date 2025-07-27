import { render } from '@react-email/render';
import { EmailService } from '../services/email-service';
import { EmailAnalytics } from '../analytics/EmailAnalytics';

export interface EmailTest {
  id: string;
  name: string;
  templateId: string;
  testType: 'preview' | 'send' | 'spam_check' | 'link_validation' | 'deliverability';
  status: 'pending' | 'running' | 'completed' | 'failed';
  
  // Test configuration
  testEmails: string[];
  templateVariables: Record<string, any>;
  
  // Test results
  results?: EmailTestResults;
  
  // Metadata
  createdAt: Date;
  completedAt?: Date;
  createdBy: string;
  organizationId: string;
}

export interface EmailTestResults {
  // Preview results
  htmlPreview?: string;
  textPreview?: string;
  subjectPreview?: string;
  
  // Spam check results
  spamScore?: number;
  spamReasons?: string[];
  spamRecommendations?: string[];
  
  // Link validation results
  links?: Array<{
    url: string;
    status: 'valid' | 'invalid' | 'suspicious';
    responseCode?: number;
    redirectChain?: string[];
    issues?: string[];
  }>;
  
  // Deliverability results
  deliverabilityScore?: number;
  authenticationResults?: {
    spf: 'pass' | 'fail' | 'neutral';
    dkim: 'pass' | 'fail' | 'neutral';
    dmarc: 'pass' | 'fail' | 'neutral';
  };
  
  // Send test results
  sendResults?: Array<{
    email: string;
    status: 'sent' | 'failed';
    messageId?: string;
    error?: string;
    deliveredAt?: Date;
  }>;
  
  // Performance metrics
  renderTime?: number;
  emailSize?: number;
  
  // Issues and warnings
  issues?: Array<{
    type: 'error' | 'warning' | 'info';
    category: 'content' | 'design' | 'deliverability' | 'accessibility';
    message: string;
    suggestion?: string;
  }>;
}

export interface EmailPreviewOptions {
  device: 'desktop' | 'mobile' | 'tablet';
  client: 'gmail' | 'outlook' | 'apple_mail' | 'yahoo' | 'generic';
  darkMode?: boolean;
  imageBlocking?: boolean;
}

export class EmailTester {
  private emailService: EmailService;
  private analytics: EmailAnalytics;
  private tests: Map<string, EmailTest> = new Map();

  constructor(emailService: EmailService, analytics: EmailAnalytics) {
    this.emailService = emailService;
    this.analytics = analytics;
  }

  /**
   * Create a new email test
   */
  async createTest(testData: Omit<EmailTest, 'id' | 'status' | 'createdAt'>): Promise<EmailTest> {
    const test: EmailTest = {
      ...testData,
      id: this.generateTestId(),
      status: 'pending',
      createdAt: new Date(),
    };

    this.tests.set(test.id, test);
    return test;
  }

  /**
   * Run an email test
   */
  async runTest(testId: string): Promise<EmailTestResults> {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    test.status = 'running';
    
    try {
      let results: EmailTestResults = {};

      switch (test.testType) {
        case 'preview':
          results = await this.runPreviewTest(test);
          break;
        case 'send':
          results = await this.runSendTest(test);
          break;
        case 'spam_check':
          results = await this.runSpamCheckTest(test);
          break;
        case 'link_validation':
          results = await this.runLinkValidationTest(test);
          break;
        case 'deliverability':
          results = await this.runDeliverabilityTest(test);
          break;
        default:
          throw new Error(`Unknown test type: ${test.testType}`);
      }

      test.results = results;
      test.status = 'completed';
      test.completedAt = new Date();

      return results;
    } catch (error) {
      test.status = 'failed';
      test.completedAt = new Date();
      throw error;
    }
  }

  /**
   * Generate email preview for different clients and devices
   */
  async generatePreview(
    templateId: string,
    variables: Record<string, any>,
    options: EmailPreviewOptions
  ): Promise<{
    html: string;
    text: string;
    subject: string;
    issues: EmailTestResults['issues'];
  }> {
    const startTime = Date.now();

    try {
      // Get template component (this would come from your template registry)
      const TemplateComponent = await this.getTemplateComponent(templateId);
      
      // Render the email
      const html = await render(TemplateComponent(variables));
      const text = this.extractTextFromHtml(html);
      const subject = this.extractSubjectFromTemplate(templateId, variables);

      // Apply client-specific transformations
      const transformedHtml = this.applyClientTransformations(html, options);

      // Validate and find issues
      const issues = this.validateEmailContent(transformedHtml, text, subject);

      const renderTime = Date.now() - startTime;

      return {
        html: transformedHtml,
        text,
        subject,
        issues
      };
    } catch (error) {
      throw new Error(`Failed to generate preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test email across multiple devices and clients
   */
  async testAcrossClients(
    templateId: string,
    variables: Record<string, any>
  ): Promise<Array<{
    device: string;
    client: string;
    preview: string;
    issues: string[];
    renderTime: number;
  }>> {
    const devices: EmailPreviewOptions['device'][] = ['desktop', 'mobile', 'tablet'];
    const clients: EmailPreviewOptions['client'][] = ['gmail', 'outlook', 'apple_mail', 'yahoo'];
    
    const results = [];

    for (const device of devices) {
      for (const client of clients) {
        try {
          const startTime = Date.now();
          const preview = await this.generatePreview(templateId, variables, { device, client });
          const renderTime = Date.now() - startTime;

          results.push({
            device,
            client,
            preview: preview.html,
            issues: preview.issues?.map(issue => issue.message) || [],
            renderTime
          });
        } catch (error) {
          results.push({
            device,
            client,
            preview: '',
            issues: [`Render failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
            renderTime: 0
          });
        }
      }
    }

    return results;
  }

  /**
   * Private test methods
   */

  private async runPreviewTest(test: EmailTest): Promise<EmailTestResults> {
    const preview = await this.generatePreview(
      test.templateId,
      test.templateVariables,
      { device: 'desktop', client: 'gmail' }
    );

    return {
      htmlPreview: preview.html,
      textPreview: preview.text,
      subjectPreview: preview.subject,
      issues: preview.issues,
      emailSize: Buffer.byteLength(preview.html, 'utf8'),
    };
  }

  private async runSendTest(test: EmailTest): Promise<EmailTestResults> {
    const sendResults = [];

    for (const email of test.testEmails) {
      try {
        const result = await this.emailService.sendTemplatedEmail({
          to: email,
          templateId: test.templateId,
          templateVariables: test.templateVariables,
          metadata: {
            testId: test.id,
            isTest: true,
          },
        });

        sendResults.push({
          email,
          status: result.success ? 'sent' : 'failed',
          messageId: result.messageId,
          error: result.success ? undefined : result.error,
          deliveredAt: result.success ? new Date() : undefined,
        });
      } catch (error) {
        sendResults.push({
          email,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { sendResults };
  }

  private async runSpamCheckTest(test: EmailTest): Promise<EmailTestResults> {
    const preview = await this.generatePreview(
      test.templateId,
      test.templateVariables,
      { device: 'desktop', client: 'generic' }
    );

    // Simple spam check implementation
    const spamKeywords = [
      'free', 'urgent', 'act now', 'limited time', 'click here',
      'guarantee', 'money back', 'no risk', 'winner', 'congratulations'
    ];

    const content = (preview.html + ' ' + preview.subject).toLowerCase();
    const foundKeywords = spamKeywords.filter(keyword => content.includes(keyword));
    
    const spamScore = Math.min(foundKeywords.length * 10, 100);
    const spamReasons = foundKeywords.map(keyword => `Contains spam keyword: "${keyword}"`);
    
    const spamRecommendations = [
      'Avoid excessive use of promotional language',
      'Include proper sender authentication',
      'Maintain good sender reputation',
      'Use clear and honest subject lines'
    ];

    return {
      spamScore,
      spamReasons,
      spamRecommendations,
    };
  }

  private async runLinkValidationTest(test: EmailTest): Promise<EmailTestResults> {
    const preview = await this.generatePreview(
      test.templateId,
      test.templateVariables,
      { device: 'desktop', client: 'generic' }
    );

    // Extract links from HTML
    const linkRegex = /href=["']([^"']+)["']/g;
    const links = [];
    let match;

    while ((match = linkRegex.exec(preview.html)) !== null) {
      const url = match[1];
      
      // Skip mailto and tel links
      if (url.startsWith('mailto:') || url.startsWith('tel:')) {
        continue;
      }

      try {
        // Simple URL validation
        new URL(url);
        links.push({
          url,
          status: 'valid' as const,
          responseCode: 200,
          issues: []
        });
      } catch (error) {
        links.push({
          url,
          status: 'invalid' as const,
          issues: ['Invalid URL format']
        });
      }
    }

    return { links };
  }

  private async runDeliverabilityTest(test: EmailTest): Promise<EmailTestResults> {
    // Mock deliverability test results
    return {
      deliverabilityScore: 85,
      authenticationResults: {
        spf: 'pass',
        dkim: 'pass',
        dmarc: 'pass'
      }
    };
  }

  /**
   * Helper methods
   */

  private async getTemplateComponent(templateId: string): Promise<any> {
    // This would fetch the actual React component for the template
    // For now, return a mock component
    return (props: any) => null;
  }

  private extractTextFromHtml(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractSubjectFromTemplate(templateId: string, variables: Record<string, any>): string {
    // This would extract the subject from the template
    return variables.subject || 'Test Email Subject';
  }

  private applyClientTransformations(html: string, options: EmailPreviewOptions): string {
    let transformedHtml = html;

    // Apply client-specific CSS transformations
    switch (options.client) {
      case 'outlook':
        // Outlook-specific transformations
        transformedHtml = transformedHtml.replace(/border-radius/g, '/* border-radius not supported */');
        break;
      case 'gmail':
        // Gmail-specific transformations
        break;
    }

    // Apply device-specific transformations
    if (options.device === 'mobile') {
      transformedHtml = transformedHtml.replace(
        /<style[^>]*>/,
        '<style>@media (max-width: 600px) { .mobile-hide { display: none !important; } }'
      );
    }

    return transformedHtml;
  }

  private validateEmailContent(html: string, text: string, subject: string): EmailTestResults['issues'] {
    const issues: EmailTestResults['issues'] = [];

    // Check email size
    const htmlSize = Buffer.byteLength(html, 'utf8');
    if (htmlSize > 102400) { // 100KB
      issues.push({
        type: 'warning',
        category: 'deliverability',
        message: 'Email size exceeds 100KB, may be clipped by some clients',
        suggestion: 'Reduce image sizes or content length'
      });
    }

    // Check subject line length
    if (subject.length > 50) {
      issues.push({
        type: 'warning',
        category: 'content',
        message: 'Subject line is longer than 50 characters',
        suggestion: 'Keep subject lines under 50 characters for better mobile display'
      });
    }

    // Check for missing alt text
    const imgWithoutAlt = html.match(/<img[^>]*(?!alt=)[^>]*>/g);
    if (imgWithoutAlt && imgWithoutAlt.length > 0) {
      issues.push({
        type: 'error',
        category: 'accessibility',
        message: `${imgWithoutAlt.length} images missing alt text`,
        suggestion: 'Add descriptive alt text to all images for accessibility'
      });
    }

    return issues;
  }

  private generateTestId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get test by ID
   */
  getTest(testId: string): EmailTest | null {
    return this.tests.get(testId) || null;
  }

  /**
   * List tests for an organization
   */
  listTests(organizationId: string): EmailTest[] {
    return Array.from(this.tests.values()).filter(
      test => test.organizationId === organizationId
    );
  }

  /**
   * Delete a test
   */
  deleteTest(testId: string): boolean {
    return this.tests.delete(testId);
  }
}