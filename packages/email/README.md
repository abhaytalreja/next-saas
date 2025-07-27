# @nextsaas/email

Comprehensive email system for NextSaaS with dual-provider support (Resend + SendGrid), React Email templates, and advanced campaign management.

## Features

- **Dual-Provider Support**: Intelligent routing between Resend and SendGrid with automatic failover
- **React Email Templates**: Type-safe, responsive email templates with industry customization
- **Campaign Management**: Marketing campaigns with segmentation, automation, and A/B testing
- **Analytics & Tracking**: Comprehensive email performance analytics and delivery tracking
- **Multi-Tenant Support**: Organization-specific email settings, branding, and isolation
- **Compliance**: Built-in GDPR and CAN-SPAM compliance features
- **Queue Processing**: Reliable email delivery with retry mechanisms
- **Testing Tools**: Email preview, validation, and deliverability testing

## Quick Start

```typescript
import { EmailService, createEmailProvider } from '@nextsaas/email';
import { WelcomeEmail } from '@nextsaas/email/templates';

// Initialize email service
const emailService = new EmailService({
  providers: {
    resend: { apiKey: process.env.RESEND_API_KEY },
    sendgrid: { apiKey: process.env.SENDGRID_API_KEY },
  },
});

// Send a welcome email
await emailService.sendEmail({
  template: 'welcome',
  to: 'user@example.com',
  data: {
    firstName: 'John',
    organizationName: 'Acme Corp',
  },
  organizationId: 'org-123',
});
```

## Architecture

### Provider Routing

The system intelligently routes emails based on:
- Email type (transactional vs marketing)
- Provider health and availability
- Volume and rate limiting
- Cost optimization
- Organization preferences

### Template System

React Email templates with:
- Industry-specific variations
- Organization branding
- Responsive design
- Accessibility compliance
- Multi-language support

### Campaign Management

Marketing campaigns with:
- Audience segmentation
- Automated sequences
- A/B testing
- Performance analytics
- Revenue attribution

## Installation

```bash
npm install @nextsaas/email
```

## Documentation

See `/docs` directory for detailed guides:
- [Email Integration Guide](./docs/email-integration-guide.md)
- [Provider Setup Guide](./docs/provider-setup-guide.md)
- [Template Development Guide](./docs/template-development-guide.md)
- [Campaign Management Guide](./docs/campaign-management-guide.md)
- [Analytics Guide](./docs/analytics-guide.md)
- [Compliance Guide](./docs/compliance-guide.md)

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Preview email templates
npm run email:preview
```

## Contributing

Please read the contributing guidelines before submitting pull requests.

## License

MIT