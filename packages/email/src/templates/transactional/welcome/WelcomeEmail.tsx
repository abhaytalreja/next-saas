import { Heading, Text, Section } from '@react-email/components';
import { Layout } from '../../base/Layout';
import { Button } from '../../base/Button';
import { TemplateProps } from '../../../types';

interface WelcomeEmailProps extends TemplateProps {
  ctaUrl?: string;
  ctaText?: string;
  features?: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  organizationId,
  branding,
  content,
  recipient,
  unsubscribeUrl,
  ctaUrl,
  ctaText,
  features,
}) => {
  const defaultFeatures = [
    {
      title: 'Easy Setup',
      description: 'Get started in minutes with our intuitive onboarding process.',
    },
    {
      title: 'Powerful Features',
      description: 'Access all the tools you need to succeed in one platform.',
    },
    {
      title: '24/7 Support',
      description: 'Our team is here to help you every step of the way.',
    },
  ];

  const emailFeatures = features || defaultFeatures;

  return (
    <Layout
      organizationId={organizationId}
      branding={branding}
      content={content}
      recipient={recipient}
      unsubscribeUrl={unsubscribeUrl}
      previewText={`Welcome to ${branding.name}! Let's get you started.`}
    >
      {/* Welcome Message */}
      <Section className="text-center mb-8">
        <Heading 
          as="h1" 
          className="text-3xl font-bold mb-4"
          style={{
            color: branding.primaryColor || '#007bff',
            fontSize: '28px',
            fontWeight: 'bold',
            margin: '0 0 16px 0',
            lineHeight: '36px',
          }}
        >
          {content.heading || `Welcome to ${branding.name}${recipient.firstName ? `, ${recipient.firstName}` : ''}!`}
        </Heading>
        
        <Text 
          className="text-lg text-gray-600 mb-6"
          style={{
            fontSize: '18px',
            lineHeight: '28px',
            color: '#6b7280',
            margin: '0 0 24px 0',
          }}
        >
          {content.message || `We're excited to have you on board. Let's get you started with ${branding.name}.`}
        </Text>
      </Section>

      {/* Call to Action */}
      {(ctaUrl || content.ctaUrl) && (
        <Section className="text-center mb-8">
          <Button
            href={ctaUrl || content.ctaUrl || '#'}
            variant="primary"
            size="lg"
            primaryColor={branding.primaryColor}
            style={{ margin: '0 auto' }}
          >
            {ctaText || content.ctaText || 'Get Started'}
          </Button>
        </Section>
      )}

      {/* Features Section */}
      {emailFeatures.length > 0 && (
        <Section className="mb-8">
          <Heading 
            as="h2" 
            className="text-xl font-semibold mb-6 text-center"
            style={{
              fontSize: '20px',
              fontWeight: '600',
              margin: '0 0 24px 0',
              textAlign: 'center',
              color: branding.textColor || '#333333',
            }}
          >
            What you can do with {branding.name}
          </Heading>
          
          <div style={{ display: 'block' }}>
            {emailFeatures.map((feature, index) => (
              <Section 
                key={index}
                className="mb-6 p-4 bg-gray-50 rounded"
                style={{
                  backgroundColor: '#f9fafb',
                  padding: '16px',
                  borderRadius: '6px',
                  marginBottom: '16px',
                }}
              >
                <Heading 
                  as="h3" 
                  className="text-lg font-medium mb-2"
                  style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: '0 0 8px 0',
                    color: branding.primaryColor || '#007bff',
                  }}
                >
                  {feature.title}
                </Heading>
                <Text 
                  className="text-gray-600"
                  style={{
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#6b7280',
                    margin: 0,
                  }}
                >
                  {feature.description}
                </Text>
              </Section>
            ))}
          </div>
        </Section>
      )}

      {/* Next Steps */}
      <Section className="mb-6 p-4 bg-blue-50 rounded border-l-4 border-blue-500">
        <Heading 
          as="h3" 
          className="text-lg font-medium mb-3"
          style={{
            fontSize: '16px',
            fontWeight: '600',
            margin: '0 0 12px 0',
            color: branding.primaryColor || '#007bff',
          }}
        >
          Next Steps
        </Heading>
        <Text 
          className="text-gray-700 mb-3"
          style={{
            fontSize: '14px',
            lineHeight: '20px',
            color: '#374151',
            margin: '0 0 12px 0',
          }}
        >
          To get the most out of {branding.name}, we recommend:
        </Text>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px', fontSize: '14px', color: '#374151' }}>
            Complete your profile setup
          </li>
          <li style={{ marginBottom: '8px', fontSize: '14px', color: '#374151' }}>
            Explore the main features
          </li>
          <li style={{ marginBottom: '8px', fontSize: '14px', color: '#374151' }}>
            Connect with our support team if you have questions
          </li>
        </ul>
      </Section>

      {/* Support Information */}
      <Section className="text-center">
        <Text 
          className="text-gray-600"
          style={{
            fontSize: '14px',
            lineHeight: '20px',
            color: '#6b7280',
            margin: '0 0 8px 0',
          }}
        >
          Need help getting started? We're here for you!
        </Text>
        {branding.website && (
          <Text 
            className="text-sm"
            style={{
              fontSize: '14px',
              lineHeight: '20px',
              margin: 0,
            }}
          >
            Visit our{' '}
            <a 
              href={`${branding.website}/help`}
              style={{ color: branding.linkColor || '#007bff', textDecoration: 'underline' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              help center
            </a>
            {' '}or reply to this email.
          </Text>
        )}
      </Section>
    </Layout>
  );
};

export default WelcomeEmail;