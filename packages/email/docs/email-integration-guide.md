# NextSaaS Email System Integration Guide

## Overview

The NextSaaS Email System provides a comprehensive, enterprise-grade email solution with dual-provider support (Resend + SendGrid), React-based templates, intelligent routing, and advanced analytics. This system is designed to handle everything from simple transactional emails to complex marketing campaigns.

## Architecture

### Dual-Provider Strategy

The system intelligently routes emails between Resend and SendGrid based on:
- **Email Type**: Transactional emails prefer Resend, marketing emails use SendGrid
- **Provider Health**: Automatic failover when providers are down
- **Volume & Rate Limits**: Smart distribution to stay within limits
- **Cost Optimization**: Routes to the most cost-effective provider
- **Organization Preferences**: Custom routing rules per organization

### React Email Templates

All email templates are built using React Email, providing:
- **Type Safety**: Full TypeScript support for template props
- **Component Reusability**: Shared components across templates
- **Responsive Design**: Mobile-optimized layouts
- **Industry Customization**: Specialized templates for different industries
- **Brand Consistency**: Organization-specific branding

## Quick Start

### 1. Installation

```bash
npm install @nextsaas/email
```

### 2. Environment Configuration

```env
# Resend Configuration
RESEND_API_KEY=re_your_resend_api_key

# SendGrid Configuration
SENDGRID_API_KEY=SG.your_sendgrid_api_key

# Default Settings
DEFAULT_FROM_EMAIL=noreply@yourapp.com
```

### 3. Basic Setup

```typescript
import { EmailService } from '@nextsaas/email';

const emailService = new EmailService({
  providers: {
    resend: {
      apiKey: process.env.RESEND_API_KEY!,
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY!,
    },
  },
  defaultFrom: process.env.DEFAULT_FROM_EMAIL,
  routing: {
    defaultProvider: 'resend',
    failover: {
      enabled: true,
      fallbackProviders: ['sendgrid'],
    },
  },
});
```

### 4. Send Your First Email

```typescript
// Simple transactional email
const result = await emailService.sendWelcomeEmail('user@example.com', {
  firstName: 'John',
  organizationName: 'Acme Corp',
  organizationId: 'org-123',
  ctaUrl: 'https://app.acme.com/dashboard',
});

if (result.success) {
  console.log('Email sent:', result.messageId);
} else {
  console.error('Email failed:', result.error);
}
```

## Core Features

### 1. Transactional Emails

#### Welcome Email
```typescript
await emailService.sendWelcomeEmail('user@example.com', {
  firstName: 'John',
  organizationName: 'Acme Corp',
  organizationId: 'org-123',
  ctaUrl: 'https://app.acme.com/onboarding',
  ctaText: 'Get Started',
  features: [
    {
      title: 'Easy Setup',
      description: 'Get started in minutes',
    },
    {
      title: 'Powerful Analytics',
      description: 'Track your success',
    },
  ],
});
```

#### Email Verification
```typescript
await emailService.sendVerificationEmail('user@example.com', {
  firstName: 'John',
  verificationUrl: 'https://app.acme.com/verify?token=abc123',
  organizationName: 'Acme Corp',
  organizationId: 'org-123',
  expiresIn: '24 hours',
});
```

#### Password Reset
```typescript
await emailService.sendPasswordResetEmail('user@example.com', {
  firstName: 'John',
  resetUrl: 'https://app.acme.com/reset?token=xyz789',
  organizationName: 'Acme Corp',
  organizationId: 'org-123',
  expiresIn: '1 hour',
});
```

### 2. Custom Template Emails

```typescript
import { EmailTemplateData } from '@nextsaas/email';

const templateData: EmailTemplateData = {
  organizationId: 'org-123',
  recipient: {
    email: 'user@example.com',
    firstName: 'John',
  },
  organization: {
    name: 'Acme Corp',
    primaryColor: '#007bff',
    logo: 'https://acme.com/logo.png',
  },
  content: {
    subject: 'Custom Email',
    heading: 'Hello John!',
    message: 'This is a custom email message.',
    ctaText: 'Take Action',
    ctaUrl: 'https://app.acme.com/action',
  },
};

await emailService.sendTemplateEmail('custom-template', templateData, {
  to: 'user@example.com',
  tags: { type: 'custom', campaign: 'launch' },
});
```

### 3. Bulk Emails

```typescript
const emails = [
  {
    to: 'user1@example.com',
    subject: 'Personalized Message 1',
    html: '<p>Hello User 1!</p>',
    text: 'Hello User 1!',
    organizationId: 'org-123',
  },
  {
    to: 'user2@example.com',
    subject: 'Personalized Message 2',
    html: '<p>Hello User 2!</p>',
    text: 'Hello User 2!',
    organizationId: 'org-123',
  },
];

const result = await emailService.sendBulkEmails(emails);
console.log(`Sent ${result.successful} of ${result.totalEmails} emails`);
```

## Advanced Configuration

### Provider Routing Rules

```typescript
const emailService = new EmailService({
  providers: { /* ... */ },
  routing: {
    defaultProvider: 'resend',
    rules: [
      {
        id: 'high-volume-sendgrid',
        priority: 100,
        conditions: {
          volume: { min: 1000 },
          emailType: 'marketing',
        },
        provider: 'sendgrid',
        enabled: true,
      },
      {
        id: 'enterprise-customers',
        priority: 90,
        conditions: {
          tags: ['enterprise'],
        },
        provider: 'sendgrid',
        enabled: true,
      },
    ],
    failover: {
      enabled: true,
      maxRetries: 3,
      retryDelay: 1000,
      fallbackProviders: ['sendgrid', 'resend'],
      circuitBreaker: {
        enabled: true,
        failureThreshold: 5,
        resetTimeout: 60000,
      },
    },
  },
});
```

### Custom Templates

```typescript
// Register a custom template
import { CustomEmailTemplate } from './templates/CustomEmailTemplate';

emailService.registerTemplate('custom-template', CustomEmailTemplate);

// Use the custom template
await emailService.sendTemplateEmail('custom-template', templateData, options);
```

### Queue Processing

```typescript
const emailService = new EmailService({
  // ... other config
  queueConfig: {
    enabled: true,
    maxRetries: 3,
    retryDelay: 1000,
  },
});

// Queue an email for later processing
const queueId = await emailService.queueEmail(emailData, {
  priority: 'high',
  scheduledAt: new Date(Date.now() + 60000), // Send in 1 minute
});

// Process the queue
await emailService.processQueue();
```

## API Integration

### Next.js API Route

```typescript
// pages/api/email/send.ts
import { EmailService } from '@nextsaas/email';

const emailService = new EmailService(/* config */);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await emailService.sendWelcomeEmail(
      req.body.to,
      req.body.data
    );

    if (result.success) {
      res.status(200).json({ 
        success: true, 
        messageId: result.messageId 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### React Hook

```typescript
// hooks/useEmail.ts
import { useState } from 'react';

export const useEmail = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendWelcomeEmail = async (to: string, data: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'welcome', to, data }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendWelcomeEmail,
    loading,
    error,
  };
};
```

## Monitoring & Analytics

### Provider Health

```typescript
// Get provider health status
const health = emailService.getProviderHealth();
console.log('Resend status:', health.get('resend'));
console.log('SendGrid status:', health.get('sendgrid'));
```

### Performance Metrics

```typescript
// Get provider performance metrics
const metrics = emailService.getProviderMetrics();
for (const [provider, metric] of metrics) {
  console.log(`${provider}: ${metric.successfulRequests}/${metric.totalRequests}`);
}
```

### Email Analytics

```typescript
// Get analytics for an organization
const analytics = await emailService.getAnalytics('org-123', {
  start: new Date('2024-01-01'),
  end: new Date('2024-01-31'),
});

console.log('Emails sent:', analytics.sent);
console.log('Delivery rate:', analytics.deliveryRate);
console.log('Open rate:', analytics.openRate);
```

## Database Integration

The email system includes comprehensive database schemas for:
- Email templates and versions
- Organization email settings
- Email queue and processing
- Delivery status tracking
- Engagement analytics

### Migration

```sql
-- Run the provided migration
\i packages/email/database/migrations/001_email_templates.sql
```

### Querying Email Data

```sql
-- Get recent email activity
SELECT 
  eq.subject,
  eq.status,
  eds.status as delivery_status,
  eq.created_at
FROM email_queue eq
LEFT JOIN email_delivery_status eds ON eq.id = eds.queue_id
WHERE eq.organization_id = 'your-org-id'
ORDER BY eq.created_at DESC
LIMIT 10;
```

## Best Practices

### 1. Provider Configuration
- Always configure both Resend and SendGrid for redundancy
- Test webhook endpoints in development
- Monitor provider quotas and rate limits

### 2. Template Development
- Use TypeScript for type safety
- Test templates across email clients
- Keep templates accessible and responsive

### 3. Performance
- Use bulk sending for large recipient lists
- Implement queue processing for high-volume scenarios
- Monitor delivery rates and adjust routing rules

### 4. Compliance
- Always include unsubscribe links
- Respect user preferences
- Implement proper consent tracking

### 5. Monitoring
- Set up alerts for provider failures
- Track delivery and engagement metrics
- Regular health checks

## Troubleshooting

### Common Issues

1. **Provider Authentication Errors**
   - Verify API keys are correct
   - Check environment variable names
   - Ensure keys have proper permissions

2. **Template Rendering Errors**
   - Check TypeScript types
   - Verify all required props are provided
   - Test templates in isolation

3. **Delivery Issues**
   - Check provider quotas
   - Verify DNS settings (SPF, DKIM, DMARC)
   - Monitor bounce rates

4. **Rate Limiting**
   - Implement queue processing
   - Distribute load across providers
   - Adjust sending frequency

### Debug Mode

```typescript
const emailService = new EmailService({
  // ... config
  debug: true, // Enable detailed logging
});
```

## Support

For issues and questions:
- Check the [troubleshooting guide](./troubleshooting.md)
- Review [API documentation](./api-reference.md)
- Open an issue on GitHub

## Next Steps

1. Set up webhook endpoints for delivery tracking
2. Implement custom templates for your use case
3. Configure organization-specific branding
4. Set up analytics dashboards
5. Add campaign management features

The NextSaaS Email System provides a solid foundation for all your email needs, from simple notifications to complex marketing campaigns. With its dual-provider architecture and intelligent routing, you can ensure reliable delivery while maintaining the flexibility to scale and customize as needed.