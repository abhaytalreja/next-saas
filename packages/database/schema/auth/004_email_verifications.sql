-- Email Verification Tokens
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX idx_email_verifications_email ON email_verifications(email);
CREATE INDEX idx_email_verifications_token ON email_verifications(token);
CREATE INDEX idx_email_verifications_expires_at ON email_verifications(expires_at);

-- Add comments
COMMENT ON TABLE email_verifications IS 'Email verification tokens';
COMMENT ON COLUMN email_verifications.email IS 'Email address to verify';
COMMENT ON COLUMN email_verifications.token IS 'Unique verification token';
COMMENT ON COLUMN email_verifications.expires_at IS 'When this token expires';
COMMENT ON COLUMN email_verifications.verified_at IS 'When the email was verified';