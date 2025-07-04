-- Usage Tracking
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  feature VARCHAR(100) NOT NULL,
  usage_count INTEGER DEFAULT 0,
  usage_limit INTEGER,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, feature, period_start)
);

-- Create indexes
CREATE INDEX idx_usage_tracking_organization_id ON usage_tracking(organization_id);
CREATE INDEX idx_usage_tracking_feature ON usage_tracking(feature);
CREATE INDEX idx_usage_tracking_period ON usage_tracking(period_start, period_end);

-- Add comments
COMMENT ON TABLE usage_tracking IS 'Track feature usage for billing and limits';
COMMENT ON COLUMN usage_tracking.feature IS 'Feature identifier (api_calls, storage_gb, etc.)';
COMMENT ON COLUMN usage_tracking.usage_count IS 'Current usage count';
COMMENT ON COLUMN usage_tracking.usage_limit IS 'Usage limit for this period';
COMMENT ON COLUMN usage_tracking.period_start IS 'Start of the billing period';
COMMENT ON COLUMN usage_tracking.period_end IS 'End of the billing period';