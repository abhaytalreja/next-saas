import { ResendProvider } from './resend-client';
import { 
  EmailData, 
  EmailResult, 
  EmailTemplateData,
  EmailProviderConfig 
} from '../../types';

export class ResendEmailSender {
  private provider: ResendProvider;

  constructor(config: EmailProviderConfig) {
    this.provider = new ResendProvider(config);
  }

  /**
   * Send a simple email
   */
  async sendEmail(emailData: EmailData): Promise<EmailResult> {
    return this.provider.sendEmail(emailData);
  }

  /**
   * Send email using a template
   */
  async sendTemplateEmail(
    templateId: string,
    templateData: EmailTemplateData,
    to: string | string[],
    options?: {
      subject?: string;
      from?: string;
      replyTo?: string;
      cc?: string[];
      bcc?: string[];
      headers?: Record<string, string>;
      tags?: Record<string, string>;
    }
  ): Promise<EmailResult> {
    try {
      // This would typically render the template with the data
      // For now, we'll create a simple email structure
      const emailData: EmailData = {
        to,
        from: options?.from || 'noreply@example.com',
        subject: options?.subject || 'Template Email',
        html: this.renderTemplate(templateId, templateData),
        text: this.renderTemplateText(templateId, templateData),
        organizationId: templateData.organizationId,
        templateId,
        replyTo: options?.replyTo,
        cc: options?.cc,
        bcc: options?.bcc,
        headers: options?.headers,
        tags: options?.tags,
        unsubscribeUrl: templateData.unsubscribeUrl,
      };

      return this.provider.sendEmail(emailData);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.provider.name,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(
    to: string,
    data: {
      firstName: string;
      organizationName: string;
      loginUrl?: string;
      organizationId: string;
    }
  ): Promise<EmailResult> {
    const templateData: EmailTemplateData = {
      organizationId: data.organizationId,
      recipient: {
        email: to,
        firstName: data.firstName,
      },
      organization: {
        name: data.organizationName,
        primaryColor: '#007bff',
      },
      content: {
        subject: `Welcome to ${data.organizationName}!`,
        heading: `Welcome, ${data.firstName}!`,
        message: `We're excited to have you join ${data.organizationName}. Get started by exploring your new account.`,
        ctaText: 'Get Started',
        ctaUrl: data.loginUrl || '#',
      },
    };

    return this.sendTemplateEmail(
      'welcome',
      templateData,
      to,
      {
        subject: `Welcome to ${data.organizationName}!`,
        tags: {
          type: 'welcome',
          organization: data.organizationId,
        },
      }
    );
  }

  /**
   * Send email verification email
   */
  async sendVerificationEmail(
    to: string,
    data: {
      firstName?: string;
      verificationUrl: string;
      organizationName: string;
      organizationId: string;
      expiresIn?: string;
    }
  ): Promise<EmailResult> {
    const templateData: EmailTemplateData = {
      organizationId: data.organizationId,
      recipient: {
        email: to,
        firstName: data.firstName,
      },
      organization: {
        name: data.organizationName,
        primaryColor: '#007bff',
      },
      content: {
        subject: 'Verify your email address',
        heading: 'Verify your email',
        message: `Please click the button below to verify your email address${data.expiresIn ? ` within ${data.expiresIn}` : ''}.`,
        ctaText: 'Verify Email',
        ctaUrl: data.verificationUrl,
        footer: 'If you did not request this email, please ignore it.',
      },
    };

    return this.sendTemplateEmail(
      'verification',
      templateData,
      to,
      {
        subject: 'Verify your email address',
        tags: {
          type: 'verification',
          organization: data.organizationId,
        },
      }
    );
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    to: string,
    data: {
      firstName?: string;
      resetUrl: string;
      organizationName: string;
      organizationId: string;
      expiresIn?: string;
    }
  ): Promise<EmailResult> {
    const templateData: EmailTemplateData = {
      organizationId: data.organizationId,
      recipient: {
        email: to,
        firstName: data.firstName,
      },
      organization: {
        name: data.organizationName,
        primaryColor: '#007bff',
      },
      content: {
        subject: 'Reset your password',
        heading: 'Password Reset Request',
        message: `We received a request to reset your password. Click the button below to create a new password${data.expiresIn ? ` within ${data.expiresIn}` : ''}.`,
        ctaText: 'Reset Password',
        ctaUrl: data.resetUrl,
        footer: 'If you did not request this password reset, please ignore this email.',
      },
    };

    return this.sendTemplateEmail(
      'password-reset',
      templateData,
      to,
      {
        subject: 'Reset your password',
        tags: {
          type: 'password-reset',
          organization: data.organizationId,
        },
      }
    );
  }

  /**
   * Send team invitation email
   */
  async sendInvitationEmail(
    to: string,
    data: {
      inviterName: string;
      organizationName: string;
      role: string;
      invitationUrl: string;
      organizationId: string;
      expiresIn?: string;
    }
  ): Promise<EmailResult> {
    const templateData: EmailTemplateData = {
      organizationId: data.organizationId,
      recipient: {
        email: to,
      },
      organization: {
        name: data.organizationName,
        primaryColor: '#007bff',
      },
      content: {
        subject: `You've been invited to join ${data.organizationName}`,
        heading: `Join ${data.organizationName}`,
        message: `${data.inviterName} has invited you to join ${data.organizationName} as a ${data.role}. Click the button below to accept the invitation${data.expiresIn ? ` within ${data.expiresIn}` : ''}.`,
        ctaText: 'Accept Invitation',
        ctaUrl: data.invitationUrl,
        footer: 'If you did not expect this invitation, please ignore this email.',
      },
    };

    return this.sendTemplateEmail(
      'invitation',
      templateData,
      to,
      {
        subject: `You've been invited to join ${data.organizationName}`,
        tags: {
          type: 'invitation',
          organization: data.organizationId,
          inviter: data.inviterName,
        },
      }
    );
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(
    to: string,
    data: {
      title: string;
      message: string;
      actionUrl?: string;
      actionText?: string;
      organizationName: string;
      organizationId: string;
      priority?: 'low' | 'normal' | 'high';
    }
  ): Promise<EmailResult> {
    const templateData: EmailTemplateData = {
      organizationId: data.organizationId,
      recipient: {
        email: to,
      },
      organization: {
        name: data.organizationName,
        primaryColor: '#007bff',
      },
      content: {
        subject: data.title,
        heading: data.title,
        message: data.message,
        ctaText: data.actionText,
        ctaUrl: data.actionUrl,
      },
    };

    return this.sendTemplateEmail(
      'notification',
      templateData,
      to,
      {
        subject: data.title,
        tags: {
          type: 'notification',
          organization: data.organizationId,
          priority: data.priority || 'normal',
        },
      }
    );
  }

  /**
   * Get provider health status
   */
  async getHealthStatus() {
    return this.provider.getHealthStatus();
  }

  /**
   * Get provider statistics
   */
  async getStats(period: { start: Date; end: Date }) {
    return this.provider.getStats(period);
  }

  private renderTemplate(templateId: string, data: EmailTemplateData): string {
    // This is a simplified template renderer
    // In production, this would use a proper template engine
    const baseTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${data.content.subject || 'Email'}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              ${data.organization.logo ? `<img src="${data.organization.logo}" alt="${data.organization.name}" style="max-height: 60px;">` : ''}
              <h1 style="color: ${data.organization.primaryColor || '#007bff'};">${data.organization.name}</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 8px;">
              ${data.content.heading ? `<h2 style="margin-top: 0;">${data.content.heading}</h2>` : ''}
              <p>${data.content.message}</p>
              
              ${data.content.ctaUrl ? `
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${data.content.ctaUrl}" 
                     style="background: ${data.organization.primaryColor || '#007bff'}; 
                            color: white; 
                            padding: 12px 24px; 
                            text-decoration: none; 
                            border-radius: 4px; 
                            display: inline-block;">
                    ${data.content.ctaText || 'Click Here'}
                  </a>
                </div>
              ` : ''}
              
              ${data.content.footer ? `<p style="font-size: 14px; color: #666; margin-top: 30px;">${data.content.footer}</p>` : ''}
            </div>
            
            <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">
              <p>© ${new Date().getFullYear()} ${data.organization.name}. All rights reserved.</p>
              ${data.unsubscribeUrl ? `<p><a href="${data.unsubscribeUrl}" style="color: #999;">Unsubscribe</a></p>` : ''}
            </div>
          </div>
        </body>
      </html>
    `;

    return baseTemplate;
  }

  private renderTemplateText(templateId: string, data: EmailTemplateData): string {
    // Generate plain text version
    let text = `${data.organization.name}\n\n`;
    
    if (data.content.heading) {
      text += `${data.content.heading}\n\n`;
    }
    
    text += `${data.content.message}\n\n`;
    
    if (data.content.ctaUrl) {
      text += `${data.content.ctaText || 'Click here'}: ${data.content.ctaUrl}\n\n`;
    }
    
    if (data.content.footer) {
      text += `${data.content.footer}\n\n`;
    }
    
    text += `© ${new Date().getFullYear()} ${data.organization.name}. All rights reserved.\n`;
    
    if (data.unsubscribeUrl) {
      text += `\nUnsubscribe: ${data.unsubscribeUrl}`;
    }
    
    return text;
  }
}