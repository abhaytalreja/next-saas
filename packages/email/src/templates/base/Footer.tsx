import { Section, Text, Link, Hr } from '@react-email/components';
import { OrganizationBranding } from '../../types';

interface FooterProps {
  branding: OrganizationBranding;
  unsubscribeUrl?: string;
  showSocialMedia?: boolean;
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({
  branding,
  unsubscribeUrl,
  showSocialMedia = true,
  className = '',
}) => {
  return (
    <Section className={`mt-8 ${className}`}>
      <Hr className="border-gray-200 my-6" />
      
      {/* Social Media Links */}
      {showSocialMedia && branding.socialMedia && (
        <Section className="text-center mb-6">
          <Text className="text-sm text-gray-600 mb-4">
            Follow us on social media
          </Text>
          <div className="space-x-4">
            {branding.socialMedia.twitter && (
              <Link
                href={branding.socialMedia.twitter}
                className="text-link underline text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter
              </Link>
            )}
            {branding.socialMedia.linkedin && (
              <Link
                href={branding.socialMedia.linkedin}
                className="text-link underline text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </Link>
            )}
            {branding.socialMedia.facebook && (
              <Link
                href={branding.socialMedia.facebook}
                className="text-link underline text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </Link>
            )}
            {branding.socialMedia.instagram && (
              <Link
                href={branding.socialMedia.instagram}
                className="text-link underline text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </Link>
            )}
          </div>
        </Section>
      )}
      
      {/* Company Information */}
      <Section className="text-center">
        <Text className="text-sm text-gray-600 mb-2">
          © {new Date().getFullYear()} {branding.name}. All rights reserved.
        </Text>
        
        {branding.address && (
          <Text className="text-xs text-gray-500 mb-2">
            {branding.address.street}
            {branding.address.city && `, ${branding.address.city}`}
            {branding.address.state && `, ${branding.address.state}`}
            {branding.address.postalCode && ` ${branding.address.postalCode}`}
            {branding.address.country && `, ${branding.address.country}`}
          </Text>
        )}
        
        {branding.website && (
          <Text className="text-xs text-gray-500 mb-2">
            <Link
              href={branding.website}
              className="text-link underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit our website
            </Link>
          </Text>
        )}
      </Section>
      
      {/* Unsubscribe Links */}
      {unsubscribeUrl && (
        <Section className="text-center mt-4">
          <Text className="text-xs text-gray-500">
            <Link
              href={unsubscribeUrl}
              className="text-link underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Unsubscribe
            </Link>
            {' | '}
            <Link
              href={`${unsubscribeUrl}?action=preferences`}
              className="text-link underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Update preferences
            </Link>
          </Text>
          
          <Text className="text-xs text-gray-400 mt-2">
            You received this email because you signed up for {branding.name}.
            {' '}If you no longer wish to receive these emails, you can unsubscribe above.
          </Text>
        </Section>
      )}
    </Section>
  );
};

export default Footer;