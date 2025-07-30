// Core Services
export * from './stripe'
export * from './usage'
export * from './pricing'
export * from './gating'

// Components
export * from './components'

// Hooks
export * from './hooks'

// Types
export * from './types'

// Database functions (to be imported from main package if needed)
export const BILLING_DB_FUNCTIONS = {
  increment_usage: `
    CREATE OR REPLACE FUNCTION increment_usage(
      p_organization_id UUID,
      p_feature TEXT,
      p_quantity INTEGER,
      p_period_start TIMESTAMP WITH TIME ZONE,
      p_period_end TIMESTAMP WITH TIME ZONE,
      p_metadata JSONB DEFAULT '{}'::jsonb
    ) RETURNS VOID AS $$
    BEGIN
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
    END;
    $$ LANGUAGE plpgsql;
  `
} as const