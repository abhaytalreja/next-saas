-- Billing Customers (Organization -> Stripe Customer mapping)
CREATE TABLE IF NOT EXISTS billing_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id)
);

-- Create indexes
CREATE INDEX idx_billing_customers_organization_id ON billing_customers(organization_id);
CREATE INDEX idx_billing_customers_stripe_customer_id ON billing_customers(stripe_customer_id);
CREATE INDEX idx_billing_customers_email ON billing_customers(email);

-- Add comments
COMMENT ON TABLE billing_customers IS 'Maps organizations to Stripe customers';
COMMENT ON COLUMN billing_customers.organization_id IS 'Organization that owns this billing relationship';
COMMENT ON COLUMN billing_customers.stripe_customer_id IS 'Stripe customer ID';
COMMENT ON COLUMN billing_customers.email IS 'Customer email address';
COMMENT ON COLUMN billing_customers.name IS 'Customer display name';
COMMENT ON COLUMN billing_customers.metadata IS 'Additional customer metadata from Stripe';

-- Add RLS policies
ALTER TABLE billing_customers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access billing customers for organizations they belong to
CREATE POLICY "Users can access billing customers for their organizations"
  ON billing_customers FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Organization owners/admins can manage billing customers
CREATE POLICY "Organization admins can manage billing customers"
  ON billing_customers FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Policy: Service role can manage all billing customers (for webhooks)
CREATE POLICY "Service role can manage all billing customers"
  ON billing_customers FOR ALL
  TO service_role
  USING (true);

-- Feature Quotas Table (Enhanced)
CREATE TABLE IF NOT EXISTS feature_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  feature VARCHAR(100) NOT NULL,
  quota_limit INTEGER NOT NULL DEFAULT 0,
  current_usage INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  alert_threshold_percentage INTEGER DEFAULT 80,
  is_hard_limit BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, feature, period_start)
);

-- Create indexes for feature quotas
CREATE INDEX idx_feature_quotas_organization_id ON feature_quotas(organization_id);
CREATE INDEX idx_feature_quotas_feature ON feature_quotas(feature);
CREATE INDEX idx_feature_quotas_period ON feature_quotas(period_start, period_end);

-- Add comments for feature quotas
COMMENT ON TABLE feature_quotas IS 'Feature usage quotas and enforcement';
COMMENT ON COLUMN feature_quotas.feature IS 'Feature identifier (api_calls, storage_gb, etc.)';
COMMENT ON COLUMN feature_quotas.quota_limit IS 'Maximum allowed usage for this period';
COMMENT ON COLUMN feature_quotas.current_usage IS 'Current usage count';
COMMENT ON COLUMN feature_quotas.is_hard_limit IS 'Whether to enforce this limit strictly';

-- Add RLS policies for feature quotas
ALTER TABLE feature_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view quotas for their organizations"
  ON feature_quotas FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all quotas"
  ON feature_quotas FOR ALL
  TO service_role
  USING (true);

-- Usage increment function (enhanced)
CREATE OR REPLACE FUNCTION increment_usage(
  p_organization_id UUID,
  p_feature TEXT,
  p_quantity INTEGER,
  p_period_start TIMESTAMP WITH TIME ZONE,
  p_period_end TIMESTAMP WITH TIME ZONE,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
BEGIN
  -- Update usage_tracking table
  INSERT INTO usage_tracking (
    organization_id,
    feature,
    usage_count,
    period_start,
    period_end,
    metadata
  ) VALUES (
    p_organization_id,
    p_feature,
    p_quantity,
    p_period_start,
    p_period_end,
    p_metadata
  )
  ON CONFLICT (organization_id, feature, period_start)
  DO UPDATE SET
    usage_count = usage_tracking.usage_count + p_quantity,
    metadata = p_metadata,
    updated_at = NOW();

  -- Update feature_quotas table if exists
  UPDATE feature_quotas 
  SET 
    current_usage = current_usage + p_quantity,
    updated_at = NOW()
  WHERE 
    organization_id = p_organization_id 
    AND feature = p_feature 
    AND period_start = p_period_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check quota limits
CREATE OR REPLACE FUNCTION check_quota_limit(
  p_organization_id UUID,
  p_feature TEXT,
  p_requested_quantity INTEGER DEFAULT 1
) RETURNS JSONB AS $$
DECLARE
  v_quota_record feature_quotas%ROWTYPE;
  v_result JSONB;
BEGIN
  -- Get current quota record
  SELECT * INTO v_quota_record
  FROM feature_quotas
  WHERE organization_id = p_organization_id 
    AND feature = p_feature
    AND period_start <= NOW()
    AND period_end >= NOW()
  ORDER BY period_start DESC
  LIMIT 1;

  -- If no quota record found, allow unlimited usage
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'unlimited', true
    );
  END IF;

  -- Check if request would exceed limit
  IF v_quota_record.is_hard_limit AND 
     (v_quota_record.current_usage + p_requested_quantity) > v_quota_record.quota_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'quota_exceeded',
      'current_usage', v_quota_record.current_usage,
      'quota_limit', v_quota_record.quota_limit,
      'requested', p_requested_quantity
    );
  END IF;

  -- Allow the request
  RETURN jsonb_build_object(
    'allowed', true,
    'current_usage', v_quota_record.current_usage,
    'quota_limit', v_quota_record.quota_limit,
    'remaining', v_quota_record.quota_limit - v_quota_record.current_usage
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set usage limits based on plan
CREATE OR REPLACE FUNCTION set_plan_usage_limits(
  p_organization_id UUID,
  p_plan_id UUID,
  p_period_start TIMESTAMP WITH TIME ZONE DEFAULT date_trunc('month', NOW()),
  p_period_end TIMESTAMP WITH TIME ZONE DEFAULT (date_trunc('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day')
) RETURNS VOID AS $$
DECLARE
  v_plan plans%ROWTYPE;
  v_limit_key TEXT;
  v_limit_value INTEGER;
BEGIN
  -- Get plan details
  SELECT * INTO v_plan FROM plans WHERE id = p_plan_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan not found: %', p_plan_id;
  END IF;

  -- Set limits for each feature in the plan
  FOR v_limit_key, v_limit_value IN
    SELECT key, value::integer 
    FROM jsonb_each_text(v_plan.limits)
  LOOP
    INSERT INTO feature_quotas (
      organization_id,
      feature,
      quota_limit,
      current_usage,
      period_start,
      period_end
    ) VALUES (
      p_organization_id,
      v_limit_key,
      CASE WHEN v_limit_value = -1 THEN 999999999 ELSE v_limit_value END, -- -1 means unlimited
      0,
      p_period_start,
      p_period_end
    )
    ON CONFLICT (organization_id, feature, period_start)
    DO UPDATE SET
      quota_limit = CASE WHEN v_limit_value = -1 THEN 999999999 ELSE v_limit_value END,
      updated_at = NOW();
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;