-- Function to generate URL-friendly slugs
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          input_text,
          '[^a-zA-Z0-9\s-]', '', 'g'  -- Remove special characters
        ),
        '\s+', '-', 'g'  -- Replace spaces with hyphens
      ),
      '-+', '-', 'g'  -- Replace multiple hyphens with single
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to ensure unique slug
CREATE OR REPLACE FUNCTION ensure_unique_slug(
  base_slug TEXT,
  table_name TEXT,
  org_id UUID DEFAULT NULL,
  exclude_id UUID DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  final_slug TEXT;
  counter INTEGER := 0;
  slug_exists BOOLEAN;
BEGIN
  final_slug := base_slug;
  
  LOOP
    -- Check if slug exists
    EXECUTE format(
      'SELECT EXISTS(SELECT 1 FROM %I WHERE slug = $1 %s %s)',
      table_name,
      CASE WHEN org_id IS NOT NULL THEN 'AND organization_id = $2' ELSE '' END,
      CASE WHEN exclude_id IS NOT NULL THEN 'AND id != $3' ELSE '' END
    ) INTO slug_exists USING final_slug, org_id, exclude_id;
    
    EXIT WHEN NOT slug_exists;
    
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate subscription days remaining
CREATE OR REPLACE FUNCTION subscription_days_remaining(sub_id UUID)
RETURNS INTEGER AS $$
DECLARE
  end_date TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT current_period_end INTO end_date
  FROM subscriptions
  WHERE id = sub_id;
  
  IF end_date IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN GREATEST(0, EXTRACT(DAY FROM end_date - NOW())::INTEGER);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check feature limit
CREATE OR REPLACE FUNCTION check_feature_limit(
  org_id UUID,
  feature_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  current_usage INTEGER;
  usage_limit INTEGER;
BEGIN
  -- Get current usage and limit
  SELECT u.usage_count, u.usage_limit
  INTO current_usage, usage_limit
  FROM usage_tracking u
  WHERE u.organization_id = org_id
  AND u.feature = feature_name
  AND u.period_start <= NOW()
  AND u.period_end > NOW();
  
  -- If no limit set, allow
  IF usage_limit IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Check if under limit
  RETURN current_usage < usage_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to increment feature usage
CREATE OR REPLACE FUNCTION increment_feature_usage(
  org_id UUID,
  feature_name TEXT,
  increment_by INTEGER DEFAULT 1
)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  -- Update usage count
  UPDATE usage_tracking
  SET usage_count = usage_count + increment_by,
      updated_at = NOW()
  WHERE organization_id = org_id
  AND feature = feature_name
  AND period_start <= NOW()
  AND period_end > NOW()
  RETURNING usage_count INTO new_count;
  
  -- If no row updated, create new usage record
  IF new_count IS NULL THEN
    INSERT INTO usage_tracking (
      organization_id,
      feature,
      usage_count,
      period_start,
      period_end
    ) VALUES (
      org_id,
      feature_name,
      increment_by,
      date_trunc('month', NOW()),
      date_trunc('month', NOW() + INTERVAL '1 month')
    ) RETURNING usage_count INTO new_count;
  END IF;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- Function to soft delete records
CREATE OR REPLACE FUNCTION soft_delete(
  table_name TEXT,
  record_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  EXECUTE format(
    'UPDATE %I SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
    table_name
  ) USING record_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to restore soft deleted records
CREATE OR REPLACE FUNCTION restore_deleted(
  table_name TEXT,
  record_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  EXECUTE format(
    'UPDATE %I SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL',
    table_name
  ) USING record_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;