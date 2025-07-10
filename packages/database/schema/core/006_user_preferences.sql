-- User Preferences Table
-- Stores user preferences for themes, notifications, privacy, and localization

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Theme & Appearance
  theme VARCHAR(20) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language VARCHAR(10) DEFAULT 'en',
  date_format VARCHAR(20) DEFAULT 'MM/dd/yyyy',
  time_format VARCHAR(5) DEFAULT '12h' CHECK (time_format IN ('12h', '24h')),
  
  -- Email Notifications
  email_notifications_enabled BOOLEAN DEFAULT true,
  email_frequency VARCHAR(20) DEFAULT 'immediate' CHECK (email_frequency IN ('immediate', 'hourly', 'daily', 'weekly')),
  email_digest BOOLEAN DEFAULT true,
  
  -- Notification Types
  notify_security_alerts BOOLEAN DEFAULT true,
  notify_account_updates BOOLEAN DEFAULT true,
  notify_organization_updates BOOLEAN DEFAULT true,
  notify_project_updates BOOLEAN DEFAULT true,
  notify_mentions BOOLEAN DEFAULT true,
  notify_comments BOOLEAN DEFAULT true,
  notify_invitations BOOLEAN DEFAULT true,
  notify_billing_alerts BOOLEAN DEFAULT true,
  notify_feature_announcements BOOLEAN DEFAULT false,
  
  -- Push Notifications
  browser_notifications_enabled BOOLEAN DEFAULT false,
  desktop_notifications_enabled BOOLEAN DEFAULT false,
  mobile_notifications_enabled BOOLEAN DEFAULT false,
  
  -- Marketing & Communication
  marketing_emails BOOLEAN DEFAULT false,
  product_updates BOOLEAN DEFAULT true,
  newsletters BOOLEAN DEFAULT false,
  surveys BOOLEAN DEFAULT false,
  
  -- Privacy Settings
  profile_visibility VARCHAR(20) DEFAULT 'organization' CHECK (profile_visibility IN ('public', 'organization', 'private')),
  email_visibility VARCHAR(20) DEFAULT 'organization' CHECK (email_visibility IN ('public', 'organization', 'private')),
  activity_visibility VARCHAR(20) DEFAULT 'organization' CHECK (activity_visibility IN ('public', 'organization', 'private')),
  hide_last_seen BOOLEAN DEFAULT false,
  hide_activity_status BOOLEAN DEFAULT false,
  
  -- Advanced Settings
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '08:00:00',
  timezone_aware BOOLEAN DEFAULT true,
  
  -- Accessibility
  reduce_motion BOOLEAN DEFAULT false,
  high_contrast BOOLEAN DEFAULT false,
  screen_reader_optimized BOOLEAN DEFAULT false,
  
  -- Data & Privacy
  data_retention_period INTEGER DEFAULT 365, -- days
  auto_delete_inactive BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one preference record per user
  UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_theme ON user_preferences(theme);
CREATE INDEX idx_user_preferences_language ON user_preferences(language);
CREATE INDEX idx_user_preferences_updated_at ON user_preferences(updated_at);

-- Add trigger for updated_at
CREATE TRIGGER trigger_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE user_preferences IS 'User preferences for themes, notifications, privacy, and personalization';
COMMENT ON COLUMN user_preferences.user_id IS 'Reference to the user who owns these preferences';
COMMENT ON COLUMN user_preferences.theme IS 'User preferred theme: light, dark, or system';
COMMENT ON COLUMN user_preferences.language IS 'User preferred language/locale';
COMMENT ON COLUMN user_preferences.email_frequency IS 'How often to send email notifications';
COMMENT ON COLUMN user_preferences.profile_visibility IS 'Who can see the user profile';
COMMENT ON COLUMN user_preferences.quiet_hours_enabled IS 'Whether to respect quiet hours for notifications';
COMMENT ON COLUMN user_preferences.data_retention_period IS 'How long to keep user data (in days)';