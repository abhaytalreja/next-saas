-- OAuth Provider Accounts
CREATE TABLE IF NOT EXISTS oauth_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  token_type VARCHAR(50),
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(provider, provider_account_id)
);

-- Create indexes
CREATE INDEX idx_oauth_accounts_user_id ON oauth_accounts(user_id);
CREATE INDEX idx_oauth_accounts_provider ON oauth_accounts(provider);

-- Add comments
COMMENT ON TABLE oauth_accounts IS 'OAuth provider accounts linked to users';
COMMENT ON COLUMN oauth_accounts.provider IS 'OAuth provider name (google, github, etc.)';
COMMENT ON COLUMN oauth_accounts.provider_account_id IS 'Account ID from the OAuth provider';
COMMENT ON COLUMN oauth_accounts.access_token IS 'OAuth access token (encrypted)';
COMMENT ON COLUMN oauth_accounts.refresh_token IS 'OAuth refresh token (encrypted)';
COMMENT ON COLUMN oauth_accounts.expires_at IS 'When the access token expires';