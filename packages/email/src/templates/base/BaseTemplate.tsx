import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import { TemplateProps } from '../../types';

interface BaseTemplateProps extends TemplateProps {
  children: React.ReactNode;
}

export const BaseTemplate: React.FC<BaseTemplateProps> = ({
  organizationId,
  branding,
  content,
  recipient,
  unsubscribeUrl,
  previewText,
  children,
}) => {
  const tailwindConfig = {
    theme: {
      extend: {
        colors: {
          primary: branding.primaryColor || '#007bff',
          secondary: branding.secondaryColor || '#6c757d',
          background: branding.backgroundColor || '#ffffff',
          text: branding.textColor || '#333333',
          link: branding.linkColor || '#007bff',
        },
        fontFamily: {
          sans: [branding.fontFamily || 'Arial', 'sans-serif'],
        },
      },
    },
  };

  return (
    <Html>
      <Head>
        <title>{content.subject}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="x-apple-disable-message-reformatting" />
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
      </Head>
      
      {previewText && <Preview>{previewText}</Preview>}
      
      <Tailwind config={tailwindConfig}>
        <Body className="bg-background font-sans text-text m-0 p-0">
          <Container className="mx-auto my-8 max-w-2xl px-4">
            {children}
            
            {/* Footer */}
            <Section className="mt-8 pt-8 border-t border-gray-200">
              <Text className="text-sm text-gray-600 text-center">
                © {new Date().getFullYear()} {branding.name}. All rights reserved.
              </Text>
              
              {branding.address && (
                <Text className="text-xs text-gray-500 text-center mt-2">
                  {branding.address.street}, {branding.address.city}, {branding.address.state} {branding.address.postalCode}
                  {branding.address.country && `, ${branding.address.country}`}
                </Text>
              )}
              
              {unsubscribeUrl && (
                <Text className="text-xs text-gray-500 text-center mt-4">
                  <a 
                    href={unsubscribeUrl}
                    className="text-link underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Unsubscribe
                  </a>
                  {' | '}
                  <a 
                    href={`${unsubscribeUrl}?action=preferences`}
                    className="text-link underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Update preferences
                  </a>
                </Text>
              )}
              
              {branding.website && (
                <Text className="text-xs text-gray-500 text-center mt-2">
                  <a 
                    href={branding.website}
                    className="text-link underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit our website
                  </a>
                </Text>
              )}
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default BaseTemplate;