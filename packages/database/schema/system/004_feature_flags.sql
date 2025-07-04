-- Feature Flags
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  conditions JSONB DEFAULT '{}', -- Complex targeting conditions
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization-specific feature overrides
CREATE TABLE IF NOT EXISTS feature_flag_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(feature_flag_id, organization_id)
);

-- Create indexes
CREATE INDEX idx_feature_flags_key ON feature_flags(key);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(enabled);
CREATE INDEX idx_feature_flag_overrides_feature_flag_id ON feature_flag_overrides(feature_flag_id);
CREATE INDEX idx_feature_flag_overrides_organization_id ON feature_flag_overrides(organization_id);

-- Add comments
COMMENT ON TABLE feature_flags IS 'Global feature flags for gradual rollouts';
COMMENT ON COLUMN feature_flags.rollout_percentage IS 'Percentage of users to enable feature for';
COMMENT ON COLUMN feature_flags.conditions IS 'Complex targeting conditions (user segments, etc.)';
COMMENT ON TABLE feature_flag_overrides IS 'Organization-specific feature flag overrides';