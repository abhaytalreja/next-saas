import React from 'react'
import { ComponentLayout } from '../../components/ComponentLayout'

export default function EmailSystemPage() {
  return (
    <ComponentLayout
      title="Email System"
      description="Enterprise-grade email system with dual-provider architecture, React Email templates, and comprehensive analytics"
    >
      <div className="space-y-8">
        {/* Overview */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
          <p className="text-gray-600 mb-4">
            NextSaaS includes a comprehensive email system built on React Email with dual-provider 
            architecture for maximum reliability. The system supports transactional emails, marketing 
            campaigns, and advanced analytics with GDPR compliance built-in.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Key Features</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Dual-provider architecture (Resend + SendGrid)</li>
              <li>• React Email templates with Tailwind CSS</li>
              <li>• Campaign management with A/B testing</li>
              <li>• Real-time analytics and tracking</li>
              <li>• GDPR & CAN-SPAM compliance</li>
              <li>• Webhook handling for all providers</li>
              <li>• Email testing and preview tools</li>
            </ul>
          </div>
        </section>

        {/* Architecture */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Architecture</h2>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Package Structure</h3>
            <pre className="text-sm bg-white p-4 rounded border overflow-x-auto">
{`packages/email/
├── src/
│   ├── providers/          # Email provider integrations
│   │   ├── base/          # Base provider interfaces
│   │   ├── resend/        # Resend integration
│   │   └── sendgrid/      # SendGrid integration
│   ├── templates/         # React Email templates
│   │   ├── base/          # Base template components
│   │   ├── transactional/ # Welcome, verification, etc.
│   │   ├── marketing/     # Newsletter, product launch
│   │   └── industry/      # SaaS, E-commerce specific
│   ├── campaigns/         # Campaign management
│   ├── analytics/         # Email analytics & tracking
│   ├── compliance/        # GDPR & subscription management
│   ├── webhooks/          # Webhook handling
│   ├── testing/           # Email testing & preview
│   └── services/          # Core email service
└── database/              # Database migrations`}
            </pre>
          </div>
        </section>

        {/* Quick Start */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Start</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">1. Install Dependencies</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`npm install @nextsaas/email`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">2. Configure Providers</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`// Environment variables
RESEND_API_KEY=your_resend_key
SENDGRID_API_KEY=your_sendgrid_key

// Initialize email service
import { EmailService, createEmailProviders } from '@nextsaas/email'

const providers = createEmailProviders({
  resend: { apiKey: process.env.RESEND_API_KEY },
  sendgrid: { apiKey: process.env.SENDGRID_API_KEY }
})

const emailService = new EmailService({ providers })`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">3. Send Your First Email</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`// Send a welcome email
await emailService.sendTemplatedEmail({
  to: 'user@example.com',
  templateId: 'welcome',
  templateVariables: {
    firstName: 'John',
    companyName: 'Acme Corp'
  }
})`}
              </pre>
            </div>
          </div>
        </section>

        {/* Email Templates */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Templates</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Transactional Templates</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Welcome emails</li>
                <li>• Email verification</li>
                <li>• Password reset</li>
                <li>• Invitation emails</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Marketing Templates</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Newsletter campaigns</li>
                <li>• Product launches</li>
                <li>• Feature announcements</li>
                <li>• Event invitations</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Industry Templates</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• SaaS update emails</li>
                <li>• E-commerce promotions</li>
                <li>• Tech documentation</li>
                <li>• API change notifications</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Custom Templates</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• React Email components</li>
                <li>• Tailwind CSS styling</li>
                <li>• Variable substitution</li>
                <li>• Multi-language support</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Campaign Management */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign Management</h2>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">A/B Testing</h3>
              <pre className="text-sm bg-white p-3 rounded border">
{`const campaign = await campaignManager.createCampaign({
  name: 'Product Launch Campaign',
  type: 'ab_test',
  abTestConfig: {
    enabled: true,
    variants: [
      { name: 'Version A', percentage: 50, subject: 'Introducing Our New Feature' },
      { name: 'Version B', percentage: 50, subject: 'The Feature You've Been Waiting For' }
    ],
    winnerCriteria: 'open_rate',
    testDuration: 24 // hours
  }
})`}
              </pre>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Audience Segmentation</h3>
              <pre className="text-sm bg-white p-3 rounded border">
{`const audience = await audienceService.createAudience({
  name: 'Active Premium Users',
  filters: [
    { field: 'subscription_tier', operator: 'equals', value: 'premium' },
    { field: 'last_login', operator: 'greater_than', value: '2024-01-01' }
  ]
})`}
              </pre>
            </div>
          </div>
        </section>

        {/* Analytics */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics & Tracking</h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">95.2%</div>
              <div className="text-sm text-blue-800">Delivery Rate</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">24.8%</div>
              <div className="text-sm text-green-800">Open Rate</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">3.4%</div>
              <div className="text-sm text-purple-800">Click Rate</div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Real-time Analytics</h3>
            <pre className="text-sm bg-white p-3 rounded border">
{`const metrics = await emailAnalytics.getCampaignMetrics('campaign_id')
console.log({
  deliveryRate: metrics.deliveryRate,
  openRate: metrics.openRate,
  clickRate: metrics.clickRate,
  revenue: metrics.revenue
})`}
            </pre>
          </div>
        </section>

        {/* Compliance */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Compliance & Privacy</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">GDPR Compliance</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Consent tracking and management</li>
                <li>• Data export capabilities</li>
                <li>• Right to be forgotten</li>
                <li>• Audit trail logging</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">CAN-SPAM Compliance</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Automatic unsubscribe links</li>
                <li>• Physical address inclusion</li>
                <li>• Honest subject lines</li>
                <li>• Opt-out processing</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Webhooks */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Webhook Integration</h2>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Handle Provider Events</h3>
            <pre className="text-sm bg-white p-3 rounded border">
{`// API route: /api/webhooks/email/resend
import { WebhookManager } from '@nextsaas/email'

export async function POST(request: Request) {
  const signature = request.headers.get('webhook-signature')
  const payload = await request.json()
  
  const result = await webhookManager.processResendWebhook(
    payload,
    signature,
    { verifySignature: true, secretKey: process.env.RESEND_WEBHOOK_SECRET }
  )
  
  return Response.json(result)
}`}
            </pre>
          </div>
        </section>

        {/* Testing */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Testing</h2>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Preview & Testing</h3>
              <pre className="text-sm bg-white p-3 rounded border">
{`// Generate email preview
const preview = await emailTester.generatePreview(
  'welcome_template',
  { firstName: 'John', companyName: 'Acme' },
  { device: 'mobile', client: 'gmail' }
)

// Test across multiple clients
const crossClientTests = await emailTester.testAcrossClients(
  'welcome_template',
  { firstName: 'John' }
)`}
              </pre>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Spam Check & Validation</h3>
              <pre className="text-sm bg-white p-3 rounded border">
{`// Run comprehensive tests
const test = await emailTester.createTest({
  name: 'Welcome Email Test',
  templateId: 'welcome',
  testType: 'spam_check',
  testEmails: ['test@example.com']
})

const results = await emailTester.runTest(test.id)`}
              </pre>
            </div>
          </div>
        </section>

        {/* UI Components */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin UI Components</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <h3 className="font-semibold mb-2">EmailCampaignList</h3>
              <p className="text-sm text-gray-600">Campaign management with metrics</p>
            </div>
            
            <div className="border rounded-lg p-4 text-center">
              <h3 className="font-semibold mb-2">EmailTemplateEditor</h3>
              <p className="text-sm text-gray-600">Visual template builder</p>
            </div>
            
            <div className="border rounded-lg p-4 text-center">
              <h3 className="font-semibold mb-2">EmailAnalyticsDashboard</h3>
              <p className="text-sm text-gray-600">Performance analytics</p>
            </div>
          </div>
        </section>

        {/* API Reference */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">API Reference</h2>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Core Classes</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><code>EmailService</code> - Main email sending service</li>
                <li><code>CampaignManager</code> - Campaign management and execution</li>
                <li><code>EmailAnalytics</code> - Analytics and tracking</li>
                <li><code>SubscriptionManager</code> - GDPR compliance and subscriptions</li>
                <li><code>WebhookManager</code> - Provider webhook handling</li>
                <li><code>EmailTester</code> - Testing and preview tools</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">UI Components</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><code>EmailCampaignList</code> - Campaign listing and management</li>
                <li><code>EmailTemplateEditor</code> - Template creation and editing</li>
                <li><code>EmailAnalyticsDashboard</code> - Analytics visualization</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </ComponentLayout>
  )
}