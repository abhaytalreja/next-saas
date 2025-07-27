-- Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  description TEXT,
  category VARCHAR(100) NOT NULL,
  industry VARCHAR(100),
  template_id VARCHAR(255) NOT NULL, -- e.g., 'welcome', 'verification'
  subject VARCHAR(500) NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  design_data JSONB,
  variables JSONB DEFAULT '[]'::jsonb,
  personalization JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT '{}',
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  provider_template_id VARCHAR(255), -- External provider template ID
  provider VARCHAR(50), -- resend, sendgrid, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  UNIQUE(organization_id, template_id, version)
);

-- Template Versions
CREATE TABLE IF NOT EXISTS email_template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES email_templates(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  design_data JSONB,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT false,
  changelog TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(template_id, version)
);

-- Organization Email Settings
CREATE TABLE IF NOT EXISTS organization_email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Provider Configuration
  primary_provider VARCHAR(50) DEFAULT 'resend',
  fallback_provider VARCHAR(50) DEFAULT 'sendgrid',
  provider_configs JSONB DEFAULT '{}'::jsonb,
  
  -- Branding
  from_name VARCHAR(255),
  from_email VARCHAR(255),
  reply_to_email VARCHAR(255),
  logo_url VARCHAR(500),
  primary_color VARCHAR(7) DEFAULT '#007bff',
  secondary_color VARCHAR(7),
  background_color VARCHAR(7) DEFAULT '#ffffff',
  text_color VARCHAR(7) DEFAULT '#333333',
  link_color VARCHAR(7),
  font_family VARCHAR(100) DEFAULT 'Arial, sans-serif',
  
  -- Address Information
  company_address JSONB,
  
  -- Social Media
  social_media JSONB DEFAULT '{}'::jsonb,
  
  -- Tracking Settings
  track_opens BOOLEAN DEFAULT true,
  track_clicks BOOLEAN DEFAULT true,
  track_unsubscribes BOOLEAN DEFAULT true,
  
  -- Compliance
  include_unsubscribe_link BOOLEAN DEFAULT true,
  include_company_address BOOLEAN DEFAULT true,
  gdpr_compliant BOOLEAN DEFAULT true,
  can_spam_compliant BOOLEAN DEFAULT true,
  
  -- Rate Limiting
  daily_send_limit INTEGER DEFAULT 10000,
  hourly_send_limit INTEGER DEFAULT 1000,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Queue
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Email Data
  to_addresses JSONB NOT NULL, -- Array of recipient objects
  from_address VARCHAR(255) NOT NULL,
  reply_to_address VARCHAR(255),
  cc_addresses JSONB DEFAULT '[]'::jsonb,
  bcc_addresses JSONB DEFAULT '[]'::jsonb,
  subject VARCHAR(500) NOT NULL,
  html_content TEXT,
  text_content TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  email_type VARCHAR(50) DEFAULT 'transactional', -- transactional, marketing, system
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  template_id VARCHAR(255),
  campaign_id UUID,
  tags JSONB DEFAULT '{}'::jsonb,
  headers JSONB DEFAULT '{}'::jsonb,
  
  -- Queue Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, sent, failed, cancelled
  scheduled_at TIMESTAMPTZ,
  max_retries INTEGER DEFAULT 3,
  current_retries INTEGER DEFAULT 0,
  error_message TEXT,
  
  -- Provider Information
  provider VARCHAR(50),
  provider_message_id VARCHAR(255),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- Email Delivery Status
CREATE TABLE IF NOT EXISTS email_delivery_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  queue_id UUID REFERENCES email_queue(id) ON DELETE CASCADE,
  
  message_id VARCHAR(255) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL, -- queued, sent, delivered, bounced, complained, rejected, failed
  
  -- Event Details
  timestamp TIMESTAMPTZ NOT NULL,
  reason TEXT,
  bounce_type VARCHAR(50), -- hard, soft, technical, reputation
  bounce_subtype VARCHAR(100),
  details JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(message_id, recipient, status, timestamp)
);

-- Email Engagement Events
CREATE TABLE IF NOT EXISTS email_engagement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  message_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- delivered, opened, clicked, bounced, complained, unsubscribed
  recipient VARCHAR(255) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  
  -- Event Details
  timestamp TIMESTAMPTZ NOT NULL,
  user_agent VARCHAR(500),
  ip_address INET,
  location VARCHAR(255),
  link_url VARCHAR(1000), -- for click events
  bounce_type VARCHAR(50),
  bounce_reason TEXT,
  
  -- Campaign/Template Info
  campaign_id UUID,
  template_id VARCHAR(255),
  
  -- Additional Data
  details JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_email_templates_org_id ON email_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_email_templates_template_id ON email_templates(template_id);

CREATE INDEX IF NOT EXISTS idx_template_versions_template_id ON email_template_versions(template_id);
CREATE INDEX IF NOT EXISTS idx_template_versions_active ON email_template_versions(is_active);

CREATE INDEX IF NOT EXISTS idx_org_email_settings_org_id ON organization_email_settings(organization_id);

CREATE INDEX IF NOT EXISTS idx_email_queue_org_id ON email_queue(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_priority ON email_queue(priority);
CREATE INDEX IF NOT EXISTS idx_email_queue_created ON email_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_provider ON email_queue(provider);

CREATE INDEX IF NOT EXISTS idx_delivery_status_org_id ON email_delivery_status(organization_id);
CREATE INDEX IF NOT EXISTS idx_delivery_status_message_id ON email_delivery_status(message_id);
CREATE INDEX IF NOT EXISTS idx_delivery_status_status ON email_delivery_status(status);
CREATE INDEX IF NOT EXISTS idx_delivery_status_recipient ON email_delivery_status(recipient);
CREATE INDEX IF NOT EXISTS idx_delivery_status_timestamp ON email_delivery_status(timestamp);

CREATE INDEX IF NOT EXISTS idx_engagement_events_org_id ON email_engagement_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_engagement_events_message_id ON email_engagement_events(message_id);
CREATE INDEX IF NOT EXISTS idx_engagement_events_type ON email_engagement_events(event_type);
CREATE INDEX IF NOT EXISTS idx_engagement_events_recipient ON email_engagement_events(recipient);
CREATE INDEX IF NOT EXISTS idx_engagement_events_timestamp ON email_engagement_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_engagement_events_campaign ON email_engagement_events(campaign_id);

-- Create updated_at trigger for email_templates
CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_email_templates_updated_at();

-- Create updated_at trigger for organization_email_settings
CREATE TRIGGER update_organization_email_settings_updated_at
    BEFORE UPDATE ON organization_email_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_email_templates_updated_at();

-- Create updated_at trigger for email_queue
CREATE TRIGGER update_email_queue_updated_at
    BEFORE UPDATE ON email_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_email_templates_updated_at();

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_delivery_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_engagement_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can access their organization's email templates" ON email_templates
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access their organization's email settings" ON organization_email_settings
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access their organization's email queue" ON email_queue
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access their organization's delivery status" ON email_delivery_status
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access their organization's engagement events" ON email_engagement_events
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );