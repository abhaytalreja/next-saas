import { Section } from '@react-email/components';
import { BaseTemplate } from './BaseTemplate';
import { Header } from './Header';
import { Footer } from './Footer';
import { TemplateProps } from '../../types';

interface LayoutProps extends TemplateProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  headerConfig?: {
    showLogo?: boolean;
    showName?: boolean;
  };
  footerConfig?: {
    showSocialMedia?: boolean;
  };
  backgroundColor?: string;
  contentClassName?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  organizationId,
  branding,
  content,
  recipient,
  unsubscribeUrl,
  previewText,
  children,
  showHeader = true,
  showFooter = true,
  headerConfig = {},
  footerConfig = {},
  backgroundColor,
  contentClassName = '',
}) => {
  return (
    <BaseTemplate
      organizationId={organizationId}
      branding={branding}
      content={content}
      recipient={recipient}
      unsubscribeUrl={unsubscribeUrl}
      previewText={previewText}
    >
      {/* Header */}
      {showHeader && (
        <Header
          branding={branding}
          showLogo={headerConfig.showLogo}
          showName={headerConfig.showName}
        />
      )}

      {/* Main Content */}
      <Section 
        className={`bg-white rounded-lg p-8 shadow-sm ${contentClassName}`}
        style={{
          backgroundColor: backgroundColor || '#ffffff',
          borderRadius: '8px',
          padding: '32px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        {children}
      </Section>

      {/* Footer */}
      {showFooter && (
        <Footer
          branding={branding}
          unsubscribeUrl={unsubscribeUrl}
          showSocialMedia={footerConfig.showSocialMedia}
        />
      )}
    </BaseTemplate>
  );
};

export default Layout;