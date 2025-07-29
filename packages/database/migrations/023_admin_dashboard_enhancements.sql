-- Migration: 023_admin_dashboard_enhancements
-- Description: Comprehensive admin dashboard database enhancements
-- Created: 2025-01-28

-- 1. Enhanced Admin Analytics Tables
CREATE TABLE IF NOT EXISTS admin_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(50) NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_data JSONB DEFAULT '{}',
  time_period VARCHAR(20) NOT NULL, -- 'hour', 'day', 'week', 'month'
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  organization_id UUID, -- NULL for global metrics
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for admin metrics
CREATE INDEX idx_admin_metrics_type_period ON admin_metrics(metric_type, time_period);
CREATE INDEX idx_admin_metrics_recorded_at ON admin_metrics(recorded_at);
CREATE INDEX idx_admin_metrics_organization_id ON admin_metrics(organization_id);

-- 2. Real-time Admin Events Table
CREATE TABLE IF NOT EXISTS admin_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  event_category VARCHAR(30) NOT NULL, -- 'user', 'organization', 'system', 'security', 'billing'
  severity VARCHAR(20) DEFAULT 'info', -- 'info', 'warning', 'error', 'critical'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_data JSONB DEFAULT '{}',
  user_id UUID REFERENCES users(id),
  organization_id UUID,
  ip_address INET,
  user_agent TEXT,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for admin events
CREATE INDEX idx_admin_events_type ON admin_events(event_type);
CREATE INDEX idx_admin_events_category ON admin_events(event_category);
CREATE INDEX idx_admin_events_severity ON admin_events(severity);
CREATE INDEX idx_admin_events_created_at ON admin_events(created_at);
CREATE INDEX idx_admin_events_processed ON admin_events(processed) WHERE processed = FALSE;
CREATE INDEX idx_admin_events_user_id ON admin_events(user_id);

-- 3. System Health Monitoring
CREATE TABLE IF NOT EXISTS system_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(50) NOT NULL,
  metric_value NUMERIC NOT NULL,
  unit VARCHAR(20),
  status VARCHAR(20) DEFAULT 'ok', -- 'ok', 'warning', 'critical'
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for system health
CREATE INDEX idx_system_health_metric_name ON system_health_metrics(metric_name);
CREATE INDEX idx_system_health_recorded_at ON system_health_metrics(recorded_at);
CREATE INDEX idx_system_health_status ON system_health_metrics(status);

-- 4. User Activity Summary (for admin dashboard)
CREATE TABLE IF NOT EXISTS user_activity_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  login_count INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  actions_count INTEGER DEFAULT 0,
  session_duration_minutes INTEGER DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  device_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- Indexes for user activity summary
CREATE INDEX idx_user_activity_summary_user_id ON user_activity_summary(user_id);
CREATE INDEX idx_user_activity_summary_date ON user_activity_summary(date);
CREATE INDEX idx_user_activity_summary_last_activity ON user_activity_summary(last_activity_at);

-- 5. Organization Activity Summary
CREATE TABLE IF NOT EXISTS organization_activity_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  date DATE NOT NULL,
  active_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  total_page_views INTEGER DEFAULT 0,
  total_actions INTEGER DEFAULT 0,
  storage_used_bytes BIGINT DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, date)
);

-- Indexes for organization activity
CREATE INDEX idx_org_activity_summary_org_id ON organization_activity_summary(organization_id);
CREATE INDEX idx_org_activity_summary_date ON organization_activity_summary(date);

-- 6. Admin Dashboard Views
CREATE OR REPLACE VIEW admin_dashboard_overview AS
SELECT 
  -- User metrics  
  (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) as total_users,
  (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '30 days' AND deleted_at IS NULL) as new_users_30d,
  (SELECT COUNT(*) FROM users WHERE last_seen_at >= CURRENT_DATE - INTERVAL '7 days' AND deleted_at IS NULL) as active_users_7d,
  
  -- Organization metrics
  (SELECT COUNT(*) FROM organizations WHERE deleted_at IS NULL) as total_organizations,
  (SELECT COUNT(*) FROM organizations WHERE created_at >= CURRENT_DATE - INTERVAL '30 days' AND deleted_at IS NULL) as new_organizations_30d,
  
  -- Activity metrics
  (SELECT COUNT(*) FROM activities WHERE created_at >= CURRENT_DATE) as activities_today,
  (SELECT COUNT(*) FROM user_sessions WHERE created_at >= CURRENT_DATE - INTERVAL '1 hour') as active_sessions,
  
  -- System health
  (SELECT AVG(metric_value) FROM system_health_metrics WHERE metric_name = 'cpu_usage' AND recorded_at >= NOW() - INTERVAL '5 minutes') as avg_cpu_usage,
  (SELECT AVG(metric_value) FROM system_health_metrics WHERE metric_name = 'memory_usage' AND recorded_at >= NOW() - INTERVAL '5 minutes') as avg_memory_usage,
  (SELECT AVG(metric_value) FROM system_health_metrics WHERE metric_name = 'response_time' AND recorded_at >= NOW() - INTERVAL '5 minutes') as avg_response_time,
  
  -- Email metrics
  (SELECT COUNT(*) FROM admin_events WHERE event_category = 'email' AND created_at >= CURRENT_DATE) as emails_sent_today,
  (SELECT COUNT(*) FROM admin_events WHERE event_category = 'email' AND event_type = 'email_failed' AND created_at >= CURRENT_DATE) as email_failures_today;

-- 7. Functions for Admin Dashboard
CREATE OR REPLACE FUNCTION get_user_growth_data(days_back INTEGER DEFAULT 30)
RETURNS TABLE(
  date DATE,
  new_users BIGINT,
  total_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - (days_back || ' days')::INTERVAL,
      CURRENT_DATE,
      '1 day'::INTERVAL
    )::DATE as date
  ),
  daily_new_users AS (
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as new_users
    FROM users 
    WHERE created_at >= CURRENT_DATE - (days_back || ' days')::INTERVAL
    AND deleted_at IS NULL
    GROUP BY DATE(created_at)
  )
  SELECT 
    ds.date,
    COALESCE(dnu.new_users, 0) as new_users,
    (SELECT COUNT(*) FROM users WHERE DATE(created_at) <= ds.date AND deleted_at IS NULL) as total_users
  FROM date_series ds
  LEFT JOIN daily_new_users dnu ON ds.date = dnu.date
  ORDER BY ds.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_organization_growth_data(days_back INTEGER DEFAULT 30)
RETURNS TABLE(
  date DATE,
  new_organizations BIGINT,
  total_organizations BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - (days_back || ' days')::INTERVAL,
      CURRENT_DATE,
      '1 day'::INTERVAL
    )::DATE as date
  ),
  daily_new_orgs AS (
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as new_organizations
    FROM organizations 
    WHERE created_at >= CURRENT_DATE - (days_back || ' days')::INTERVAL
    AND deleted_at IS NULL
    GROUP BY DATE(created_at)
  )
  SELECT 
    ds.date,
    COALESCE(dno.new_organizations, 0) as new_organizations,
    (SELECT COUNT(*) FROM organizations WHERE DATE(created_at) <= ds.date AND deleted_at IS NULL) as total_organizations
  FROM date_series ds
  LEFT JOIN daily_new_orgs dno ON ds.date = dno.date
  ORDER BY ds.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Function to record system metrics
CREATE OR REPLACE FUNCTION record_system_metric(
  metric VARCHAR(50),
  value NUMERIC,
  unit_val VARCHAR(20) DEFAULT NULL,
  status_val VARCHAR(20) DEFAULT 'ok',
  metadata_val JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  metric_id UUID;
BEGIN
  INSERT INTO system_health_metrics (
    metric_name,
    metric_value,
    unit,
    status,
    metadata
  ) VALUES (
    metric,
    value,
    unit_val,
    status_val,
    metadata_val
  ) RETURNING id INTO metric_id;
  
  RETURN metric_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Function to log admin events
CREATE OR REPLACE FUNCTION log_admin_event(
  event_type_val VARCHAR(50),
  category_val VARCHAR(30),
  title_val VARCHAR(255),
  description_val TEXT DEFAULT NULL,
  severity_val VARCHAR(20) DEFAULT 'info',
  user_id_val UUID DEFAULT NULL,
  org_id_val UUID DEFAULT NULL,
  event_data_val JSONB DEFAULT '{}',
  ip_addr INET DEFAULT NULL,
  user_agent_val TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO admin_events (
    event_type,
    event_category,
    title,
    description,
    severity,
    user_id,
    organization_id,
    event_data,
    ip_address,
    user_agent
  ) VALUES (
    event_type_val,
    category_val,
    title_val,
    description_val,
    severity_val,
    user_id_val,
    org_id_val,
    event_data_val,
    ip_addr,
    user_agent_val
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. RLS Policies for Admin Tables
ALTER TABLE admin_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_activity_summary ENABLE ROW LEVEL SECURITY;

-- Admin metrics policies
CREATE POLICY "admin_metrics_select_policy" ON admin_metrics
  FOR SELECT USING (is_system_admin(auth.uid()));

CREATE POLICY "admin_metrics_insert_policy" ON admin_metrics
  FOR INSERT WITH CHECK (is_system_admin(auth.uid()) OR auth.uid() IS NULL);

-- Admin events policies  
CREATE POLICY "admin_events_select_policy" ON admin_events
  FOR SELECT USING (is_system_admin(auth.uid()));

CREATE POLICY "admin_events_insert_policy" ON admin_events
  FOR INSERT WITH CHECK (true); -- Allow system to insert events

CREATE POLICY "admin_events_update_policy" ON admin_events
  FOR UPDATE USING (is_system_admin(auth.uid()));

-- System health policies
CREATE POLICY "system_health_select_policy" ON system_health_metrics
  FOR SELECT USING (is_system_admin(auth.uid()));

CREATE POLICY "system_health_insert_policy" ON system_health_metrics
  FOR INSERT WITH CHECK (true); -- Allow system to insert metrics

-- User activity summary policies
CREATE POLICY "user_activity_summary_select_policy" ON user_activity_summary
  FOR SELECT USING (is_system_admin(auth.uid()) OR user_id = auth.uid());

CREATE POLICY "user_activity_summary_insert_policy" ON user_activity_summary
  FOR INSERT WITH CHECK (true); -- Allow system to insert summaries

-- Organization activity summary policies
CREATE POLICY "org_activity_summary_select_policy" ON organization_activity_summary
  FOR SELECT USING (
    is_system_admin(auth.uid()) OR 
    EXISTS(
      SELECT 1 FROM organization_members om 
      WHERE om.organization_id = organization_activity_summary.organization_id 
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "org_activity_summary_insert_policy" ON organization_activity_summary
  FOR INSERT WITH CHECK (true); -- Allow system to insert summaries

-- 11. Grant necessary permissions
GRANT SELECT ON admin_metrics TO authenticated;
GRANT INSERT ON admin_metrics TO authenticated;
GRANT SELECT ON admin_events TO authenticated;
GRANT INSERT, UPDATE ON admin_events TO authenticated;
GRANT SELECT ON system_health_metrics TO authenticated;
GRANT INSERT ON system_health_metrics TO authenticated;
GRANT SELECT ON user_activity_summary TO authenticated;
GRANT INSERT, UPDATE ON user_activity_summary TO authenticated;
GRANT SELECT ON organization_activity_summary TO authenticated;
GRANT INSERT, UPDATE ON organization_activity_summary TO authenticated;
GRANT SELECT ON admin_dashboard_overview TO authenticated;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION get_user_growth_data(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_organization_growth_data(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION record_system_metric(VARCHAR, NUMERIC, VARCHAR, VARCHAR, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION log_admin_event(VARCHAR, VARCHAR, VARCHAR, TEXT, VARCHAR, UUID, UUID, JSONB, INET, TEXT) TO authenticated;

-- 12. Add table comments
COMMENT ON TABLE admin_metrics IS 'Comprehensive metrics for admin dashboard analytics';
COMMENT ON TABLE admin_events IS 'Real-time events for admin monitoring and notifications';
COMMENT ON TABLE system_health_metrics IS 'System health and performance metrics';
COMMENT ON TABLE user_activity_summary IS 'Daily summary of user activity for admin analytics';
COMMENT ON TABLE organization_activity_summary IS 'Daily summary of organization activity';
COMMENT ON VIEW admin_dashboard_overview IS 'Real-time overview metrics for admin dashboard';

-- Add column comments
COMMENT ON COLUMN admin_metrics.metric_type IS 'Type of metric (users, revenue, performance, etc.)';
COMMENT ON COLUMN admin_metrics.time_period IS 'Time period for metric aggregation';
COMMENT ON COLUMN admin_events.event_category IS 'Category of event for filtering and organization';
COMMENT ON COLUMN admin_events.severity IS 'Event severity level for prioritization';
COMMENT ON COLUMN system_health_metrics.status IS 'Health status indicator';
COMMENT ON COLUMN user_activity_summary.device_info IS 'Device and browser information';