-- Subscription Plans
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  price_monthly INTEGER, -- in cents
  price_yearly INTEGER,  -- in cents
  currency VARCHAR(3) DEFAULT 'USD',
  features JSONB DEFAULT '[]',
  limits JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  stripe_price_id_monthly VARCHAR(255),
  stripe_price_id_yearly VARCHAR(255),
  stripe_product_id VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_plans_slug ON plans(slug);
CREATE INDEX idx_plans_is_active ON plans(is_active);
CREATE INDEX idx_plans_sort_order ON plans(sort_order);

-- Add comments
COMMENT ON TABLE plans IS 'Available subscription plans';
COMMENT ON COLUMN plans.name IS 'Display name of the plan';
COMMENT ON COLUMN plans.slug IS 'URL-friendly identifier';
COMMENT ON COLUMN plans.price_monthly IS 'Monthly price in cents';
COMMENT ON COLUMN plans.price_yearly IS 'Yearly price in cents';
COMMENT ON COLUMN plans.features IS 'Array of feature descriptions';
COMMENT ON COLUMN plans.limits IS 'JSON object with usage limits';
COMMENT ON COLUMN plans.is_default IS 'Whether this is the default plan for new users';