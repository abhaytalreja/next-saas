import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '../../src/services/email-service';
import { EmailData, EmailTemplateData } from '../../src/types';

// Initialize email service with environment configuration
const emailService = new EmailService({
  providers: {
    resend: {
      apiKey: process.env.RESEND_API_KEY!,
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY!,
    },
  },
  defaultFrom: process.env.DEFAULT_FROM_EMAIL || 'noreply@example.com',
  routing: {
    defaultProvider: 'resend',
    failover: {
      enabled: true,
      maxRetries: 3,
      retryDelay: 1000,
      fallbackProviders: ['sendgrid'],
      circuitBreaker: {
        enabled: true,
        failureThreshold: 5,
        resetTimeout: 60000,
      },
    },
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    // Validate required fields
    if (!data.organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'simple':
        result = await handleSimpleEmail(data);
        break;
      case 'template':
        result = await handleTemplateEmail(data);
        break;
      case 'welcome':
        result = await handleWelcomeEmail(data);
        break;
      case 'verification':
        result = await handleVerificationEmail(data);
        break;
      case 'password-reset':
        result = await handlePasswordResetEmail(data);
        break;
      case 'bulk':
        result = await handleBulkEmail(data);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        provider: result.provider,
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleSimpleEmail(data: any) {
  const emailData: EmailData = {
    to: data.to,
    from: data.from,
    subject: data.subject,
    html: data.html,
    text: data.text,
    organizationId: data.organizationId,
    replyTo: data.replyTo,
    cc: data.cc,
    bcc: data.bcc,
    tags: data.tags,
    headers: data.headers,
  };

  return emailService.sendEmail(emailData);
}

async function handleTemplateEmail(data: any) {
  const templateData: EmailTemplateData = {
    organizationId: data.organizationId,
    recipient: data.recipient,
    organization: data.organization,
    content: data.content,
    unsubscribeUrl: data.unsubscribeUrl,
  };

  return emailService.sendTemplateEmail(data.templateId, templateData, {
    to: data.to,
    from: data.from,
    subject: data.subject,
    replyTo: data.replyTo,
    cc: data.cc,
    bcc: data.bcc,
    tags: data.tags,
  });
}

async function handleWelcomeEmail(data: any) {
  return emailService.sendWelcomeEmail(data.to, {
    firstName: data.firstName,
    organizationName: data.organizationName,
    organizationId: data.organizationId,
    ctaUrl: data.ctaUrl,
    ctaText: data.ctaText,
    features: data.features,
    branding: data.branding,
  });
}

async function handleVerificationEmail(data: any) {
  return emailService.sendVerificationEmail(data.to, {
    firstName: data.firstName,
    verificationUrl: data.verificationUrl,
    organizationName: data.organizationName,
    organizationId: data.organizationId,
    expiresIn: data.expiresIn,
    branding: data.branding,
  });
}

async function handlePasswordResetEmail(data: any) {
  return emailService.sendPasswordResetEmail(data.to, {
    firstName: data.firstName,
    resetUrl: data.resetUrl,
    organizationName: data.organizationName,
    organizationId: data.organizationId,
    expiresIn: data.expiresIn,
    branding: data.branding,
  });
}

async function handleBulkEmail(data: any) {
  const emails: EmailData[] = data.emails.map((email: any) => ({
    to: email.to,
    from: email.from || data.defaultFrom,
    subject: email.subject,
    html: email.html,
    text: email.text,
    organizationId: data.organizationId,
    templateId: email.templateId,
    tags: email.tags,
  }));

  return emailService.sendBulkEmails(emails);
}

// Health check endpoint
export async function GET() {
  try {
    const health = emailService.getProviderHealth();
    const metrics = emailService.getProviderMetrics();

    return NextResponse.json({
      status: 'ok',
      providers: Object.fromEntries(health),
      metrics: Object.fromEntries(metrics),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        error: 'Health check failed' 
      },
      { status: 500 }
    );
  }
}