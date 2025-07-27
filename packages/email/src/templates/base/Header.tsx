import { Section, Img, Heading } from '@react-email/components';
import { OrganizationBranding } from '../../types';

interface HeaderProps {
  branding: OrganizationBranding;
  showLogo?: boolean;
  showName?: boolean;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  branding,
  showLogo = true,
  showName = true,
  className = '',
}) => {
  return (
    <Section className={`text-center mb-8 ${className}`}>
      {showLogo && branding.logo && (
        <Img
          src={branding.logo}
          alt={`${branding.name} logo`}
          className="mx-auto mb-4 max-h-16 w-auto"
          style={{
            maxHeight: '64px',
            width: 'auto',
            display: 'block',
            margin: '0 auto 16px auto',
          }}
        />
      )}
      
      {showName && (
        <Heading
          as="h1"
          className="text-2xl font-bold m-0"
          style={{
            color: branding.primaryColor || '#007bff',
            fontSize: '24px',
            fontWeight: 'bold',
            margin: 0,
            lineHeight: '32px',
          }}
        >
          {branding.name}
        </Heading>
      )}
    </Section>
  );
};

export default Header;