import React from 'react'

interface EmailTemplateProps {
  children: React.ReactNode
  previewText?: string
}

interface ButtonProps {
  href: string
  children: React.ReactNode
}

// Base email template layout
const EmailTemplate: React.FC<EmailTemplateProps> = ({ children, previewText }) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {previewText && (
          <>
            <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>
              {previewText}
            </div>
            <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>
              &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
            </div>
          </>
        )}
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f6f9fc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ minWidth: '100%', backgroundColor: '#f6f9fc' }}>
          <tr>
            <td align="center" style={{ padding: '40px 0' }}>
              <table cellPadding="0" cellSpacing="0" style={{ width: '100%', maxWidth: '600px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                <tr>
                  <td style={{ padding: '40px 30px' }}>
                    {/* Logo */}
                    <table width="100%" cellPadding="0" cellSpacing="0">
                      <tr>
                        <td align="center" style={{ paddingBottom: '30px' }}>
                          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#5046e5' }}>
                            NextSaaS
                          </h1>
                        </td>
                      </tr>
                    </table>
                    
                    {/* Content */}
                    {children}
                    
                    {/* Footer */}
                    <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #e5e7eb' }}>
                      <tr>
                        <td align="center" style={{ fontSize: '14px', color: '#6b7280' }}>
                          <p style={{ margin: '0 0 10px 0' }}>
                            © {new Date().getFullYear()} NextSaaS. All rights reserved.
                          </p>
                          <p style={{ margin: 0 }}>
                            123 Main Street, San Francisco, CA 94105
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  )
}

// Button component for CTAs
const EmailButton: React.FC<ButtonProps> = ({ href, children }) => {
  return (
    <table width="100%" cellPadding="0" cellSpacing="0">
      <tr>
        <td align="center" style={{ padding: '20px 0' }}>
          <a
            href={href}
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#5046e5',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '16px',
            }}
          >
            {children}
          </a>
        </td>
      </tr>
    </table>
  )
}

// Welcome email template
export const WelcomeEmail: React.FC<{ userName: string; confirmUrl: string }> = ({
  userName,
  confirmUrl,
}) => {
  return (
    <EmailTemplate previewText="Welcome to NextSaaS! Please confirm your email address.">
      <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
        Welcome to NextSaaS, {userName}!
      </h2>
      
      <p style={{ margin: '0 0 20px 0', fontSize: '16px', lineHeight: '24px', color: '#374151' }}>
        Thanks for signing up! We're excited to have you on board. Before you get started, 
        please confirm your email address by clicking the button below:
      </p>
      
      <EmailButton href={confirmUrl}>Confirm Email Address</EmailButton>
      
      <p style={{ margin: '20px 0', fontSize: '14px', lineHeight: '20px', color: '#6b7280' }}>
        Or copy and paste this link into your browser:
        <br />
        <a href={confirmUrl} style={{ color: '#5046e5', wordBreak: 'break-all' }}>
          {confirmUrl}
        </a>
      </p>
      
      <p style={{ margin: '20px 0 0 0', fontSize: '16px', lineHeight: '24px', color: '#374151' }}>
        If you didn't create an account with NextSaaS, you can safely ignore this email.
      </p>
    </EmailTemplate>
  )
}

// Password reset email template
export const PasswordResetEmail: React.FC<{ userName: string; resetUrl: string }> = ({
  userName,
  resetUrl,
}) => {
  return (
    <EmailTemplate previewText="Reset your NextSaaS password">
      <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
        Hi {userName},
      </h2>
      
      <p style={{ margin: '0 0 20px 0', fontSize: '16px', lineHeight: '24px', color: '#374151' }}>
        We received a request to reset your password. Click the button below to create a new password:
      </p>
      
      <EmailButton href={resetUrl}>Reset Password</EmailButton>
      
      <p style={{ margin: '20px 0', fontSize: '14px', lineHeight: '20px', color: '#6b7280' }}>
        Or copy and paste this link into your browser:
        <br />
        <a href={resetUrl} style={{ color: '#5046e5', wordBreak: 'break-all' }}>
          {resetUrl}
        </a>
      </p>
      
      <p style={{ margin: '20px 0', fontSize: '14px', lineHeight: '20px', color: '#6b7280' }}>
        This link will expire in 1 hour for security reasons.
      </p>
      
      <p style={{ margin: '20px 0 0 0', fontSize: '16px', lineHeight: '24px', color: '#374151' }}>
        If you didn't request a password reset, you can safely ignore this email. 
        Your password won't be changed.
      </p>
    </EmailTemplate>
  )
}

// Email verification template
export const EmailVerificationEmail: React.FC<{ verifyUrl: string }> = ({ verifyUrl }) => {
  return (
    <EmailTemplate previewText="Verify your email address">
      <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
        Verify your email address
      </h2>
      
      <p style={{ margin: '0 0 20px 0', fontSize: '16px', lineHeight: '24px', color: '#374151' }}>
        Please click the button below to verify your email address:
      </p>
      
      <EmailButton href={verifyUrl}>Verify Email</EmailButton>
      
      <p style={{ margin: '20px 0', fontSize: '14px', lineHeight: '20px', color: '#6b7280' }}>
        Or copy and paste this link into your browser:
        <br />
        <a href={verifyUrl} style={{ color: '#5046e5', wordBreak: 'break-all' }}>
          {verifyUrl}
        </a>
      </p>
      
      <p style={{ margin: '20px 0 0 0', fontSize: '16px', lineHeight: '24px', color: '#374151' }}>
        If you didn't create an account with NextSaaS, you can safely ignore this email.
      </p>
    </EmailTemplate>
  )
}

// Organization invitation email template
export const OrganizationInviteEmail: React.FC<{
  inviterName: string
  organizationName: string
  role: string
  message?: string
  inviteUrl: string
}> = ({ inviterName, organizationName, role, message, inviteUrl }) => {
  return (
    <EmailTemplate previewText={`You're invited to join ${organizationName}`}>
      <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
        You're invited to join {organizationName}
      </h2>
      
      <p style={{ margin: '0 0 20px 0', fontSize: '16px', lineHeight: '24px', color: '#374151' }}>
        {inviterName} has invited you to join <strong>{organizationName}</strong> as 
        {role === 'admin' ? ' an Administrator' : ' a Team Member'}.
      </p>
      
      {message && (
        <div style={{ margin: '0 0 20px 0', padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: '20px', color: '#374151' }}>
            <strong>Message from {inviterName}:</strong>
            <br />
            {message}
          </p>
        </div>
      )}
      
      <EmailButton href={inviteUrl}>Accept Invitation</EmailButton>
      
      <p style={{ margin: '20px 0', fontSize: '14px', lineHeight: '20px', color: '#6b7280' }}>
        Or copy and paste this link into your browser:
        <br />
        <a href={inviteUrl} style={{ color: '#5046e5', wordBreak: 'break-all' }}>
          {inviteUrl}
        </a>
      </p>
      
      <div style={{ margin: '30px 0', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '6px' }}>
        <p style={{ margin: 0, fontSize: '14px', lineHeight: '20px', color: '#92400e' }}>
          <strong>What you'll have access to:</strong>
        </p>
        <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px', color: '#92400e', fontSize: '14px', lineHeight: '20px' }}>
          {role === 'admin' ? (
            <>
              <li>Manage team members and their permissions</li>
              <li>Access organization settings and billing</li>
              <li>Full access to all organization resources</li>
            </>
          ) : (
            <>
              <li>Collaborate with your team</li>
              <li>Access organization resources</li>
              <li>Participate in team projects</li>
            </>
          )}
        </ul>
      </div>
      
      <p style={{ margin: '20px 0', fontSize: '14px', lineHeight: '20px', color: '#6b7280' }}>
        This invitation will expire in 7 days.
      </p>
    </EmailTemplate>
  )
}