import { Button as EmailButton, Link } from '@react-email/components';

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
  primaryColor?: string;
}

export const Button: React.FC<ButtonProps> = ({
  href,
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  style = {},
  primaryColor = '#007bff',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: primaryColor,
          color: '#ffffff',
          border: `1px solid ${primaryColor}`,
        };
      case 'secondary':
        return {
          backgroundColor: '#6c757d',
          color: '#ffffff',
          border: '1px solid #6c757d',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: primaryColor,
          border: `1px solid ${primaryColor}`,
        };
      default:
        return {
          backgroundColor: primaryColor,
          color: '#ffffff',
          border: `1px solid ${primaryColor}`,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: '8px 16px',
          fontSize: '14px',
          lineHeight: '20px',
        };
      case 'md':
        return {
          padding: '12px 24px',
          fontSize: '16px',
          lineHeight: '24px',
        };
      case 'lg':
        return {
          padding: '16px 32px',
          fontSize: '18px',
          lineHeight: '28px',
        };
      default:
        return {
          padding: '12px 24px',
          fontSize: '16px',
          lineHeight: '24px',
        };
    }
  };

  const baseStyles: React.CSSProperties = {
    display: fullWidth ? 'block' : 'inline-block',
    width: fullWidth ? '100%' : 'auto',
    textAlign: 'center',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    boxSizing: 'border-box',
    ...getSizeStyles(),
    ...getVariantStyles(),
    ...style,
  };

  return (
    <EmailButton
      href={href}
      className={`email-button email-button--${variant} email-button--${size} ${fullWidth ? 'email-button--full-width' : ''} ${className}`}
      style={baseStyles}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </EmailButton>
  );
};

// Alternative implementation using Link for better email client compatibility
export const ButtonLink: React.FC<ButtonProps> = ({
  href,
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  style = {},
  primaryColor = '#007bff',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: primaryColor,
          color: '#ffffff',
          border: `1px solid ${primaryColor}`,
        };
      case 'secondary':
        return {
          backgroundColor: '#6c757d',
          color: '#ffffff',
          border: '1px solid #6c757d',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: primaryColor,
          border: `1px solid ${primaryColor}`,
        };
      default:
        return {
          backgroundColor: primaryColor,
          color: '#ffffff',
          border: `1px solid ${primaryColor}`,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: '8px 16px',
          fontSize: '14px',
          lineHeight: '20px',
        };
      case 'md':
        return {
          padding: '12px 24px',
          fontSize: '16px',
          lineHeight: '24px',
        };
      case 'lg':
        return {
          padding: '16px 32px',
          fontSize: '18px',
          lineHeight: '28px',
        };
      default:
        return {
          padding: '12px 24px',
          fontSize: '16px',
          lineHeight: '24px',
        };
    }
  };

  const baseStyles: React.CSSProperties = {
    display: fullWidth ? 'block' : 'inline-block',
    width: fullWidth ? '100%' : 'auto',
    textAlign: 'center',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    boxSizing: 'border-box',
    ...getSizeStyles(),
    ...getVariantStyles(),
    ...style,
  };

  return (
    <Link
      href={href}
      className={`email-button email-button--${variant} email-button--${size} ${fullWidth ? 'email-button--full-width' : ''} ${className}`}
      style={baseStyles}
      target="_blank"
    >
      {children}
    </Link>
  );
};

export default Button;