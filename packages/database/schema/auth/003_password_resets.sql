-- Password Reset Tokens
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX idx_password_resets_token ON password_resets(token);
CREATE INDEX idx_password_resets_expires_at ON password_resets(expires_at);

-- Add comments
COMMENT ON TABLE password_resets IS 'Password reset tokens for secure password recovery';
COMMENT ON COLUMN password_resets.token IS 'Unique reset token';
COMMENT ON COLUMN password_resets.expires_at IS 'When this token expires';
COMMENT ON COLUMN password_resets.used_at IS 'When this token was used';